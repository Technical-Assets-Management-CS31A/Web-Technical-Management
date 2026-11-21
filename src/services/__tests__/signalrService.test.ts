import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ── Fake @microsoft/signalr ──────────────────────────────────────────────────

const hub = vi.hoisted(() => {
  enum HubConnectionState { Disconnected = "Disconnected", Connecting = "Connecting", Connected = "Connected", Reconnecting = "Reconnecting" }

  class FakeConnection {
    state = HubConnectionState.Disconnected;
    handlers = new Map<string, (p: unknown) => void>();
    closeCbs: ((e?: Error) => void)[] = [];
    reconnectingCbs: ((e?: Error) => void)[] = [];
    reconnectedCbs: ((id?: string) => void)[] = [];
    startImpl: () => Promise<void> = async () => undefined;
    invoke = vi.fn<(method: string) => Promise<void>>(async () => undefined);

    constructor(public options: { accessTokenFactory: () => Promise<string> }, public retryPolicy: unknown) {}

    on(name: string, cb: (p: unknown) => void) { this.handlers.set(name, cb); }
    onclose(cb: (e?: Error) => void) { this.closeCbs.push(cb); }
    onreconnecting(cb: (e?: Error) => void) { this.reconnectingCbs.push(cb); }
    onreconnected(cb: (id?: string) => void) { this.reconnectedCbs.push(cb); }

    async start() {
      await this.options.accessTokenFactory();
      await this.startImpl();
      this.state = HubConnectionState.Connected;
    }
    async stop() {
      const wasUp = this.state !== HubConnectionState.Disconnected;
      this.state = HubConnectionState.Disconnected;
      if (wasUp) this.closeCbs.forEach((cb) => cb());
    }
    // Test helpers
    emit(name: string, payload: unknown) { this.handlers.get(name)?.(payload); }
    drop() { this.state = HubConnectionState.Reconnecting; this.reconnectingCbs.forEach((cb) => cb(new Error("socket lost"))); }
    recover() { this.state = HubConnectionState.Connected; this.reconnectedCbs.forEach((cb) => cb("new-id")); }
  }

  const built: FakeConnection[] = [];
  class HubConnectionBuilder {
    private options!: { accessTokenFactory: () => Promise<string> };
    private retry: unknown;
    withUrl(_url: string, options: { accessTokenFactory: () => Promise<string> }) { this.options = options; return this; }
    withAutomaticReconnect(retry: unknown) { this.retry = retry; return this; }
    configureLogging() { return this; }
    build() { const c = new FakeConnection(this.options, this.retry); built.push(c); return c; }
  }
  class HttpError extends Error { constructor(msg: string, public statusCode: number) { super(msg); } }

  return { HubConnectionState, HubConnectionBuilder, HttpError, built };
});

vi.mock("@microsoft/signalr", () => ({
  HubConnectionState: hub.HubConnectionState,
  HubConnectionBuilder: hub.HubConnectionBuilder,
  HttpError: hub.HttpError,
  HttpTransportType: { WebSockets: 1, ServerSentEvents: 2 },
  LogLevel: { Warning: 3 },
}));

const auth = vi.hoisted(() => ({ token: undefined as string | undefined, refresh: vi.fn<() => Promise<string>>() }));
vi.mock("../../utils/token", () => ({ getToken: () => auth.token }));
vi.mock("../../api/axios", () => ({ refreshAccessToken: () => auth.refresh() }));

// ── Helpers ──────────────────────────────────────────────────────────────────

const validJwt = () => `h.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 900 }))}.s`;

const load = async () => {
  vi.resetModules();
  hub.built.length = 0;
  const { signalRService } = await import("../signalrService");
  const statuses: { status: string; resumed?: boolean }[] = [];
  signalRService.onStatus((status, { resumed }) => statuses.push({ status, resumed }));
  return { service: signalRService, statuses, conn: () => hub.built[hub.built.length - 1] };
};

beforeEach(() => {
  vi.useFakeTimers();
  auth.token = validJwt();
  auth.refresh.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

// ── Tests ────────────────────────────────────────────────────────────────────

describe("signalRService", () => {
  it("connects with the staff JWT, joins the staff group and fans out events", async () => {
    const { service, statuses, conn } = await load();
    const seen: unknown[] = [];
    service.onEvent((name, payload) => seen.push([name, payload]));

    await service.start();
    await service.start(); // idempotent

    expect(hub.built).toHaveLength(1);
    expect(await conn().options.accessTokenFactory()).toBe(auth.token);
    expect(conn().invoke).toHaveBeenCalledWith("JoinAdminStaffGroup");
    expect(service.isConnected()).toBe(true);
    expect(statuses.at(-1)).toEqual({ status: "connected", resumed: false });

    conn().emit("loan.overdue", { loanId: "l1" });
    conn().emit("scan.recorded", { scanId: "s1", result: "VERIFIED" });
    expect(seen).toEqual([
      ["loan.overdue", { loanId: "l1" }],
      ["scan.recorded", { scanId: "s1", result: "VERIFIED" }],
    ]);
  });

  it("refreshes an expiring token before connecting", async () => {
    auth.token = `h.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 5 }))}.s`;
    auth.refresh.mockResolvedValue("fresh-token");
    const { service, conn } = await load();

    await service.start();
    expect(auth.refresh).toHaveBeenCalledTimes(1);
    expect(await conn().options.accessTokenFactory()).toBe("fresh-token");
  });

  it("keeps retrying a failed first start until the hub is reachable", async () => {
    const { service, statuses, conn } = await load();
    let failures = 2;
    const startPromise = service.start();
    conn().startImpl = async () => {
      if (failures-- > 0) throw new Error("ECONNREFUSED");
    };
    await startPromise;
    expect(statuses.at(-1)?.status).toBe("reconnecting");

    await vi.advanceTimersByTimeAsync(0); // attempt 2, fails
    expect(service.isConnected()).toBe(false);
    await vi.advanceTimersByTimeAsync(2000); // attempt 3, succeeds
    expect(service.isConnected()).toBe(true);
    expect(statuses.at(-1)).toEqual({ status: "connected", resumed: true });
    expect(hub.built).toHaveLength(1);
  });

  it("rejoins the staff group after an automatic reconnect", async () => {
    const { service, statuses, conn } = await load();
    await service.start();
    conn().invoke.mockClear();

    conn().drop();
    expect(statuses.at(-1)?.status).toBe("reconnecting");

    conn().recover();
    await vi.runAllTimersAsync();
    expect(conn().invoke).toHaveBeenCalledWith("JoinAdminStaffGroup");
    expect(statuses.at(-1)).toEqual({ status: "connected", resumed: true });
  });

  it("uses a reconnect policy that never gives up", async () => {
    const { service, conn } = await load();
    await service.start();
    const policy = conn().retryPolicy as { nextRetryDelayInMilliseconds: (c: { previousRetryCount: number }) => number | null };
    expect(policy.nextRetryDelayInMilliseconds({ previousRetryCount: 1000 })).toBeGreaterThan(0);
  });

  it("restarts after the server closes the connection", async () => {
    const { service, conn } = await load();
    await service.start();

    conn().closeCbs.forEach((cb) => cb(new Error("server restarted")));
    conn().state = hub.HubConnectionState.Disconnected;
    expect(service.getStatus()).toBe("reconnecting");

    await vi.advanceTimersByTimeAsync(0);
    expect(service.isConnected()).toBe(true);
  });

  it("stops for good when the session cannot be refreshed", async () => {
    auth.token = undefined;
    auth.refresh.mockRejectedValue(new Error("401"));
    const { service, statuses } = await load();

    await service.start();
    await vi.runAllTimersAsync();

    expect(statuses.at(-1)?.status).toBe("disconnected");
    await vi.advanceTimersByTimeAsync(120_000);
    expect(auth.refresh).toHaveBeenCalledTimes(1);
  });

  it("leaves the group and stays down after stop()", async () => {
    const { service, conn } = await load();
    await service.start();
    const c = conn();

    await service.stop();
    expect(c.invoke).toHaveBeenCalledWith("LeaveAdminStaffGroup");
    expect(service.getStatus()).toBe("idle");

    await vi.advanceTimersByTimeAsync(60_000);
    expect(hub.built).toHaveLength(1);
  });
});
