import { Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { AssetDto, LedgerEvent, StaffAssetStatus } from "../@types/types";
import { useAllRooms, useAssetHistory, useGetAsset, useSetAssetStatus } from "../hooks/assetHooks";
import { assetQrApi } from "../api/asset_api";
import ViewItemSkeletonLoader from "../loader/ViewItemSkeletonLoader";
import AssetFormDialog from "./AssetFormDialog";
import { FormattedDateTime } from "./FormattedDateTime";
import { SlugStatus } from "./SlugStatus";
import { showToast } from "./AppToast";
import { getErrorMessage } from "./form/FormKit";
import { formatEnum } from "../lib/utils";
import { UserData, canManageAssets } from "../utils/usersData/userData";
import {
  ArrowLeft,
  Pencil,
  AlertTriangle,
  Hash,
  Wrench,
  CheckCircle,
  Tag,
  Calendar,
  FileText,
  Package,
  Nfc,
  DoorOpen,
  MapPin,
  Banknote,
  QrCode,
  History,
} from "lucide-react";

const php = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });

const escapeHtml = (text: string) =>
  text.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch] ?? ch);

const LEDGER_TONE: Record<LedgerEvent, string> = {
  CHECKOUT: "bg-blue-500",
  ROOM_VERIFIED: "bg-emerald-500",
  LATE_ARRIVAL_WARNING: "bg-amber-500",
  RETURN: "bg-slate-400",
  OVERDUE: "bg-orange-500",
  MARKED_MISSING: "bg-rose-500",
  SETTLED: "bg-violet-500",
};

export default function ViewItem() {
  const { id } = useParams({ strict: false }) as { id: string };
  const itemId = String(id);
  const viewer = UserData();
  const [isEditItemFormOpen, setIsEditItemFormOpen] = useState(false);
  const { data, isLoading, error } = useQuery(useGetAsset(itemId));
  const { data: history = [] } = useQuery(useAssetHistory(itemId));
  const { data: rooms = [] } = useQuery(useAllRooms());
  const setStatus = useSetAssetStatus();

  if (isLoading) return <ViewItemSkeletonLoader />;

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-6">
        <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-10 max-w-sm w-full text-center">
          <div className="h-14 w-14 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-7 w-7 text-rose-500" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">Unable to Load</h3>
          <p className="text-sm text-slate-500">Failed to load asset details. Please try again later.</p>
          <Link
            to="/home/inventory-list"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Assets
          </Link>
        </div>
      </div>
    );
  }

  const item: AssetDto = data;
  const room = (roomId: string | null) => {
    const r = rooms.find((x) => x.id === roomId);
    return r ? `${r.code} — ${r.name}` : null;
  };

  const canManage = canManageAssets(viewer.role);
  // Staff set only MAINTENANCE and RETIRED; the rest is driven by kiosk and room stations.
  const staffStatusAction: { label: string; status: StaffAssetStatus } | null =
    item.status === "IN_STORAGE"
      ? { label: "Send to maintenance", status: "MAINTENANCE" }
      : item.status === "MAINTENANCE"
        ? { label: "Back to storage", status: "IN_STORAGE" }
        : null;

  const changeStatus = (status: StaffAssetStatus) =>
    setStatus.mutate(
      { id: item.id, status },
      {
        onSuccess: () => showToast.success("Status Updated", `${item.assetCode} is now ${formatEnum(status)}.`),
        onError: (err) => showToast.error("Not Updated", getErrorMessage(err, "Failed to change status.")),
      },
    );

  const printQrLabel = async () => {
    try {
      const blob = await assetQrApi(item.id);
      const url = URL.createObjectURL(blob);
      const win = window.open("", "_blank", "width=420,height=520");
      if (!win) return;
      // QR encodes tams:asset:<uuid>
      win.document.write(`<title>${escapeHtml(item.assetCode)}</title><body style="margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif"><img src="${url}" style="width:240px;height:240px" onload="window.print()"/><p style="font:600 16px monospace;margin:8px 0 0">${escapeHtml(item.assetCode)}</p><p style="font-size:12px;margin:2px 0;color:#555">${escapeHtml(item.name)}</p></body>`);
      win.document.close();
    } catch (err) {
      showToast.error("QR Label", getErrorMessage(err, "Could not load the QR label."));
    }
  };

  const detailFields = [
    { icon: <Hash className="h-4 w-4" />, label: "Serial No.", value: item.serialNo },
    { icon: <CheckCircle className="h-4 w-4" />, label: "Condition", value: formatEnum(item.condition) },
    { icon: <Tag className="h-4 w-4" />, label: "Category", value: item.category?.name },
    { icon: <Wrench className="h-4 w-4" />, label: "Brand", value: item.brand },
    { icon: <Package className="h-4 w-4" />, label: "Model", value: item.model },
    { icon: <Nfc className="h-4 w-4" />, label: "RFID tag", value: item.rfidTagUid },
    { icon: <DoorOpen className="h-4 w-4" />, label: item.type === "FIXED" ? "Roster room" : "Home room", value: room(item.homeRoomId) },
    { icon: <MapPin className="h-4 w-4" />, label: "Last verified in", value: room(item.currentRoomId) },
    { icon: <Banknote className="h-4 w-4" />, label: "Replacement cost", value: php.format(item.replacementCost ?? 0) },
    { icon: <Calendar className="h-4 w-4" />, label: "Acquired", value: item.acquiredAt ? new Date(item.acquiredAt).toLocaleDateString("en-PH", { timeZone: "Asia/Manila" }) : null },
    { icon: <Calendar className="h-4 w-4" />, label: "Date Added", value: FormattedDateTime(item.createdAt) },
    { icon: <Calendar className="h-4 w-4" />, label: "Last Updated", value: FormattedDateTime(item.updatedAt) },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="max-w-5xl mx-auto space-y-6">

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/home/inventory-list"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Assets
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={printQrLabel}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <QrCode className="h-3.5 w-3.5" />
              Print QR label
            </button>
            {canManage && staffStatusAction && (
              <button
                type="button"
                onClick={() => changeStatus(staffStatusAction.status)}
                disabled={setStatus.isPending}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <Wrench className="h-3.5 w-3.5" />
                {staffStatusAction.label}
              </button>
            )}
            {canManage && item.status !== "RETIRED" && (item.status === "IN_STORAGE" || item.status === "MAINTENANCE") && (
              <button
                type="button"
                onClick={() => changeStatus("RETIRED")}
                disabled={setStatus.isPending}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 transition-colors disabled:opacity-50"
              >
                Retire
              </button>
            )}
            {canManage && (
              <button
                type="button"
                onClick={() => setIsEditItemFormOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold text-white bg-blue-500 hover:bg-blue-600 active:bg-blue-700 shadow-sm transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit Asset
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="flex-1 p-6 md:p-8 flex flex-col justify-between gap-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
                  {formatEnum(item.type)} asset
                </p>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                  {item.name}
                </h1>
                <p className="mt-1.5 font-mono text-sm text-slate-500">{item.assetCode}</p>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${SlugStatus(item.status)}`}>
                {formatEnum(item.status)}
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              <Chip label="Category" value={item.category?.name ?? "—"} />
              <Chip label="Condition" value={formatEnum(item.condition)} />
              <Chip label="Type" value={formatEnum(item.type)} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {detailFields.map(({ icon, label, value }) => (
            <div
              key={label}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 flex items-start gap-3"
            >
              <div className="h-8 w-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 flex-shrink-0">
                {icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-400 font-medium">{label}</p>
                <p className="text-sm font-semibold text-slate-900 truncate mt-0.5">
                  {value || <span className="text-slate-300 italic font-normal">Not provided</span>}
                </p>
              </div>
            </div>
          ))}
        </div>

        {item.notes && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex items-start gap-3">
            <div className="h-8 w-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 flex-shrink-0">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium mb-1">Notes</p>
              <p className="text-sm text-slate-700 leading-relaxed">{item.notes}</p>
            </div>
          </div>
        )}

        {/* History timeline from the append-only transaction ledger */}
        <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <History className="h-4 w-4 text-slate-400" />
            History
          </h2>
          {history.length === 0 ? (
            <p className="text-sm italic text-slate-400">No loan events yet.</p>
          ) : (
            <ol className="relative space-y-4 border-l border-slate-200 pl-5">
              {history.map((entry) => (
                <li key={entry.id} className="relative">
                  <span className={`absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white ${LEDGER_TONE[entry.event] ?? "bg-slate-400"}`} />
                  <p className="text-sm font-medium text-slate-900">
                    {formatEnum(entry.event)}
                    {entry.student && <span className="font-normal text-slate-500"> · {entry.student.fullName}</span>}
                  </p>
                  <p className="text-xs text-slate-500">
                    {FormattedDateTime(entry.occurredAt)}
                    {entry.instructor && ` · approved by ${entry.instructor.fullName}`}
                    {entry.actorStation && ` · ${entry.actorStation.stationCode}`}
                    {entry.actor && ` · ${entry.actor.fullName}`}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      {isEditItemFormOpen && (
        <AssetFormDialog asset={item} onClose={() => setIsEditItemFormOpen(false)} />
      )}
    </div>
  );
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100">
      <span className="text-xs text-slate-400 font-medium">{label}:</span>
      <span className="text-xs font-semibold text-slate-700">{value}</span>
    </div>
  );
}
