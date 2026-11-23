import * as signalR from "@microsoft/signalr";
import { refreshAccessToken } from "../api/axios";
import { getToken } from "../utils/token";
import {
  buildHubUrl,
  isTokenExpiring,
  reconnectDelay,
  REALTIME_EVENTS,
  type RealtimeEventName,
  type RealtimeStatus,
} from "../lib/realtime";
import type { RealtimeEventMap } from "../@types/types";

type EventListener = <K extends RealtimeEventName>(name: K, payload: RealtimeEventMap[K]) => void;
type StatusListener = (status: RealtimeStatus, info: { error?: string; resumed?: boolean }) => void;

class SessionExpiredError extends Error {
  constructor() {
    super("Session expired");
  }
}

/**
 * Singleton SignalR client for the staff web app.
 *
 * - start() is idempotent and lives for the whole signed-in session; stop() is called on logout.
 * - The staff JWT is read from the cookie on every (re)connect and refreshed first if it is about to expire.
 * - Reconnect never gives up: the built-in reconnect handles dropped connections, and a retry timer handles a
 *   failed first start or a close after reconnect. Only a dead session (refresh fails) stops it.
 * - SignalR forgets group membership when the connection id changes, so the admin/staff group is rejoined
 *   after every reconnect.
 * - Every hub event in REALTIME_EVENTS is fanned out to onEvent() listeners; callers never touch the connection.
 */
class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private status: RealtimeStatus = "idle";
  private wanted = false;
  private startInFlight: Promise<void> | null = null;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private retryAttempt = 0;
  private hasConnected = false;
  private readonly eventListeners = new Set<EventListener>();
  private readonly statusListeners = new Set<StatusListener>();

  start(): Promise<void> {
    this.wanted = true;
    if (this.startInFlight) return this.startInFlight;
    // Already up, or SignalR's own reconnect is running, or a retry is queued: nothing to do.
    const state = this.connection?.state;
    if (this.retryTimer || (state && state !== signalR.HubConnectionState.Disconnected)) return Promise.resolve();
    return this.kick();
  }

  private kick(): Promise<void> {
    this.startInFlight ??= this.attemptStart().finally(() => {
      this.startInFlight = null;
    });
    return this.startInFlight;
  }

  async stop(): Promise<void> {
    this.wanted = false;
    this.clearRetry();
    const connection = this.connection;
    this.connection = null;
    this.hasConnected = false;
    this.retryAttempt = 0;
    if (connection) {
      await connection.stop().catch((error) => console.error("[SignalR] Error while stopping:", error));
    }
    this.setStatus("idle");
  }

  getStatus(): RealtimeStatus {
    return this.status;
  }

  isConnected(): boolean {
    return this.status === "connected";
  }

  onEvent(listener: EventListener): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  onStatus(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  // ── Internals ──────────────────────────────────────────────────────────────

  private async attemptStart(): Promise<void> {
    this.clearRetry();
    const connection = (this.connection ??= this.build());
    this.setStatus(this.hasConnected || this.retryAttempt > 0 ? "reconnecting" : "connecting");

    try {
      // The server adds staff to its "staff" group in OnConnectedAsync; the hub has no callable methods.
      await connection.start();
    } catch (error) {
      if (!this.wanted || connection !== this.connection) return;
      if (error instanceof SessionExpiredError || this.isSessionError(error)) {
        await this.endDeadSession();
        return;
      }
      await connection.stop().catch(() => undefined);
      this.setStatus("reconnecting", { error: describe(error) });
      this.scheduleRetry();
      return;
    }

    // stop() ran while start() was in flight.
    if (!this.wanted || connection !== this.connection) {
      await connection.stop().catch(() => undefined);
      return;
    }

    const resumed = this.hasConnected || this.retryAttempt > 0;
    this.hasConnected = true;
    this.retryAttempt = 0;
    this.setStatus("connected", { resumed });
  }

  private build(): signalR.HubConnection {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(buildHubUrl(import.meta.env.VITE_API_BASE_URL), {
        // With WebSockets/SSE the browser cannot send headers, so SignalR puts this in ?access_token=.
        accessTokenFactory: () => this.accessToken(),
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents,
      })
      .withAutomaticReconnect({ nextRetryDelayInMilliseconds: ({ previousRetryCount }) => reconnectDelay(previousRetryCount) })
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    for (const name of REALTIME_EVENTS) {
      connection.on(name, (payload: RealtimeEventMap[typeof name]) => this.emit(name, payload));
    }

    connection.onreconnecting((error) => {
      if (connection !== this.connection) return;
      this.setStatus("reconnecting", { error: error ? describe(error) : undefined });
    });

    connection.onreconnected(() => {
      if (connection !== this.connection) return;
      // A new connection id rejoins the staff group server-side in OnConnectedAsync.
      this.setStatus("connected", { resumed: true });
    });

    connection.onclose((error) => {
      if (connection !== this.connection || !this.wanted) return;
      if (error && this.isSessionError(error)) {
        void this.endDeadSession();
        return;
      }
      this.setStatus("reconnecting", { error: error ? describe(error) : "Connection closed" });
      this.scheduleRetry();
    });

    return connection;
  }

  private async accessToken(): Promise<string> {
    const token = getToken();
    if (token && !isTokenExpiring(token)) return token;
    try {
      return await refreshAccessToken();
    } catch {
      // SignalR's built-in reconnect would keep calling this forever, so end the session here as well.
      queueMicrotask(() => void this.endDeadSession());
      throw new SessionExpiredError();
    }
  }

  private isSessionError(error: unknown): boolean {
    if (error instanceof SessionExpiredError) return true;
    return error instanceof signalR.HttpError && error.statusCode === 401;
  }

  /** The refresh token is gone too; the next API call sends the user to login. */
  private async endDeadSession(): Promise<void> {
    if (!this.wanted) return;
    await this.stop();
    this.setStatus("disconnected", { error: "Session expired" });
  }

  private scheduleRetry(): void {
    if (!this.wanted || this.retryTimer) return;
    const delay = reconnectDelay(this.retryAttempt++);
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      if (this.wanted) void this.kick();
    }, delay);
  }

  private clearRetry(): void {
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.retryTimer = null;
  }

  private emit<K extends RealtimeEventName>(name: K, payload: RealtimeEventMap[K]): void {
    for (const listener of this.eventListeners) {
      try {
        listener(name, payload);
      } catch (error) {
        console.error(`[SignalR] Listener for ${name} threw:`, error);
      }
    }
  }

  private setStatus(status: RealtimeStatus, info: { error?: string; resumed?: boolean } = {}): void {
    this.status = status;
    for (const listener of this.statusListeners) listener(status, info);
  }
}

const describe = (error: unknown): string => (error instanceof Error ? error.message : String(error));

export const signalRService = new SignalRService();
