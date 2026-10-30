import type { LoanDto } from "../@types/types";
import { FormattedDateTime } from "./FormattedDateTime";
import { SlugStatus } from "./SlugStatus";
import { formatEnum } from "../lib/utils";

type HistoryTableProps = {
    items: LoanDto[];
    onSelect: (loanId: string) => void;
};

export default function HistoryTable({ items, onSelect }: HistoryTableProps) {
    return (
        <>
            {items.map((loan) => (
                <tr
                    key={loan.id}
                    onClick={() => onSelect(loan.id)}
                    className="cursor-pointer hover:bg-slate-100 transition-colors odd:bg-white even:bg-slate-50"
                >
                    <td className="py-3 px-4 font-mono text-sm">{loan.loanNo}</td>
                    <td className="py-4 px-6">
                        <p>{loan.asset.name}</p>
                        <p className="font-mono text-xs text-slate-500">{loan.asset.assetCode}</p>
                    </td>
                    <td className="py-4 px-6">
                        <p>{loan.student?.fullName ?? loan.coordinator?.fullName ?? "-"}</p>
                        <p className="text-xs text-slate-500">{loan.type === "EVENT" ? loan.event?.title ?? "Event" : loan.student?.sectionCode}</p>
                    </td>
                    <td className="py-4 px-6">{loan.approvedBy?.fullName || "-"}</td>
                    <td className="py-4 px-6">{loan.destinationRoom?.code || "-"}</td>
                    <td className="py-4 px-6">{FormattedDateTime(loan.checkedOutAt)}</td>
                    <td className="py-4 px-6">{loan.returnedAt ? FormattedDateTime(loan.returnedAt) : "-"}</td>
                    <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-sm ${SlugStatus(loan.status)}`}>
                            {formatEnum(loan.status)}
                        </span>
                    </td>
                </tr>
            ))}
        </>
    );
}
