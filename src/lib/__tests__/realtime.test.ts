import { describe, expect, it } from "vitest";
import {
  ALL_REALTIME_QUERY_KEYS,
  buildHubUrl,
  isTokenExpiring,
  pushRecent,
  QUERY_KEYS_BY_EVENT,
  REALTIME_EVENTS,
  reconnectDelay,
  type RealtimeEnvelope,
} from "../realtime";
import { useRealtimeStore, resetRealtimeState } from "../../states/realtime-state";

const jwt = (payload: object) => `h.${btoa(JSON.stringify(payload)).replace(/=+$/, "")}.s`;

describe("buildHubUrl", () => {
  it("strips the API version suffix and trailing slashes", () => {
    expect(buildHubUrl("https://api.example.com/api/v1")).toBe("https://api.example.com/notificationHub");
    expect(buildHubUrl("https://api.example.com/api/v2/")).toBe("https://api.example.com/notificationHub");
    expect(buildHubUrl("http://localhost:5278/")).toBe("http://localhost:5278/notificationHub");
  });

  it("falls back to the local backend", () => {
    expect(buildHubUrl(undefined)).toBe("http://localhost:5278/notificationHub");
  });
});

describe("reconnectDelay", () => {
  it("follows the fast steps first", () => {
    expect([0, 1, 2, 3].map((n) => reconnectDelay(n))).toEqual([0, 2000, 5000, 10000]);
  });

  it("never gives up and stays within 30 s ± 20 %", () => {
    expect(reconnectDelay(4, () => 0.5)).toBe(30000);
    expect(reconnectDelay(50, () => 0)).toBe(24000);
    expect(reconnectDelay(500, () => 1)).toBe(36000);
  });
});

describe("isTokenExpiring", () => {
  const now = Date.UTC(2026, 10, 16, 8, 0, 0);

  it("accepts a token valid beyond the skew", () => {
    expect(isTokenExpiring(jwt({ exp: now / 1000 + 600 }), now)).toBe(false);
  });

  it("flags tokens inside the skew, expired, without exp, or malformed", () => {
    expect(isTokenExpiring(jwt({ exp: now / 1000 + 10 }), now)).toBe(true);
    expect(isTokenExpiring(jwt({ exp: now / 1000 - 1 }), now)).toBe(true);
    expect(isTokenExpiring(jwt({ sub: "u1" }), now)).toBe(true);
    expect(isTokenExpiring("not-a-jwt", now)).toBe(true);
  });
});

describe("pushRecent", () => {
  const env = (id: number): RealtimeEnvelope => ({
    id,
    name: "loan.overdue",
    payload: { loanId: `l${id}` },
    receivedAt: id,
  });

  it("puts the newest first and caps the length", () => {
    const list = [3, 2, 1].map(env);
    expect(pushRecent(list, env(4), 3).map((e) => e.id)).toEqual([4, 3, 2]);
    expect(list).toHaveLength(3);
  });
});

describe("query key map", () => {
  it("covers every subscribed event", () => {
    expect(Object.keys(QUERY_KEYS_BY_EVENT).sort()).toEqual([...REALTIME_EVENTS].sort());
  });

  it("lists each key once for the post-reconnect refresh", () => {
    expect(new Set(ALL_REALTIME_QUERY_KEYS).size).toBe(ALL_REALTIME_QUERY_KEYS.length);
    expect(ALL_REALTIME_QUERY_KEYS).toEqual(expect.arrayContaining(["dashboard", "loans", "assets", "stations"]));
  });
});

describe("useRealtimeStore", () => {
  it("records events newest first and tracks status", () => {
    resetRealtimeState();
    const { record, setStatus } = useRealtimeStore.getState();
    setStatus("reconnecting", "socket closed");
    expect(useRealtimeStore.getState().lastError).toBe("socket closed");

    setStatus("connected");
    record("loan.overdue", { loanId: "l1" });
    record("anomaly.raised", { anomalyId: "a1", type: "WRONG_ROOM" });

    const state = useRealtimeStore.getState();
    expect(state.status).toBe("connected");
    expect(state.lastError).toBeNull();
    expect(state.recent.map((e) => e.name)).toEqual(["anomaly.raised", "loan.overdue"]);
    expect(state.recent[0].id).toBeGreaterThan(state.recent[1].id);

    resetRealtimeState();
    expect(useRealtimeStore.getState().recent).toEqual([]);
    expect(useRealtimeStore.getState().status).toBe("idle");
  });
});
