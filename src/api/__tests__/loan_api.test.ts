import { describe, expect, it } from "vitest";
import { toLoanDetail } from "../loan_api";

const loan = { id: "l1", loanNo: "L-2026-000001", asset: { id: "a1", assetCode: "LT-010", name: "HP ProBook", status: "BORROWED" } };
const approval = {
  id: "ap1", instructor: { id: "u1", fullName: "Ana Cruz" }, decision: "APPROVED", destinationRoomId: "r1",
  classLengthMinutes: 90, requestedAt: "2026-11-27T01:00:00Z", decidedAt: "2026-11-27T01:01:00Z", decidedDevice: "MOBILE",
};

describe("toLoanDetail", () => {
  it("flattens the { loan, approval, ledger } detail response", () => {
    const result = toLoanDetail({ loan, approval, ledger: [] });
    expect(result.asset.id).toBe("a1");
    expect(result.approvals).toEqual([approval]);
  });

  it("gives an empty approval list when the loan had no approval", () => {
    expect(toLoanDetail({ loan, approval: null, ledger: [] }).approvals).toEqual([]);
  });

  it("passes a bare loan through", () => {
    expect(toLoanDetail(loan).asset.assetCode).toBe("LT-010");
  });

  it("unwraps a { data } envelope first", () => {
    expect(toLoanDetail({ data: { loan, approval: null, ledger: [] } }).id).toBe("l1");
  });
});
