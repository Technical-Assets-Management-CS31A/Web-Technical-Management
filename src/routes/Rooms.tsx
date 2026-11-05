import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Building2,
  DoorOpen,
  MonitorSmartphone,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
  Truck,
  WifiOff,
  Warehouse,
} from "lucide-react";
import type { RoomDto, StationDto, StationHealth } from "../@types/types";
import { useAllRooms } from "../hooks/assetHooks";
import { useAllStations, useDeleteRoom, useDeleteStation, useRoomOccupancy } from "../hooks/roomHooks";
import SearchBar from "../components/SearchBar";
import ErrorTable from "../components/ErrorTables";
import PopUpModal from "../components/PopUpModal";
import RoomFormDialog from "../components/RoomFormDialog";
import StationFormDialog from "../components/StationFormDialog";
import StationHealthPill from "../components/StationHealthPill";
import { HEALTH_DOT } from "../components/stationHealth";
import { showToast } from "../components/AppToast";
import { getErrorMessage } from "../components/form/FormKit";
import { FormattedDateTime } from "../components/FormattedDateTime";
import { RoomsSkeletonLoader } from "../loader/RoomsSkeletonLoader";
import { formatEnum } from "../lib/utils";
import { UserData, canManageRooms } from "../utils/usersData/userData";
import { ROOMS_CONTENT as T } from "../constants/roomsContent";

type KindFilter = (typeof T.kindFilters)[number]["value"];

// Worst health first, so a room with any offline station shows red in the list.
const HEALTH_RANK: Record<StationHealth, number> = { OFFLINE: 0, WARNING: 1, ONLINE: 2 };

const worstHealth = (stations: StationDto[]) =>
  stations.reduce<StationHealth | null>(
    (worst, s) => (worst === null || HEALTH_RANK[s.health] < HEALTH_RANK[worst] ? s.health : worst),
    null,
  );

export default function Rooms() {
  const viewer = UserData();
  const canManage = canManageRooms(viewer.role);

  const roomsQuery = useQuery(useAllRooms());
  const stationsQuery = useQuery(useAllStations());
  const deleteRoom = useDeleteRoom();
  const deleteStation = useDeleteStation();

  const [search, setSearch] = useState("");
  const [kind, setKind] = useState<KindFilter>("all");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [roomDialog, setRoomDialog] = useState<{ room?: RoomDto } | null>(null);
  const [stationDialog, setStationDialog] = useState<{ station?: StationDto } | null>(null);
  const [roomToDelete, setRoomToDelete] = useState<RoomDto | null>(null);
  const [stationToDelete, setStationToDelete] = useState<StationDto | null>(null);

  const rooms = useMemo(() => (roomsQuery.data ?? []).filter((r) => !r.deletedAt), [roomsQuery.data]);
  const stations = useMemo(() => (stationsQuery.data ?? []).filter((s) => !s.deletedAt), [stationsQuery.data]);

  const stationsByRoom = useMemo(() => {
    const map = new Map<string, StationDto[]>();
    for (const station of stations) map.set(station.roomId, [...(map.get(station.roomId) ?? []), station]);
    return map;
  }, [stations]);

  const filteredRooms = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rooms
      .filter((r) => kind === "all" || (kind === "storage") === r.isStorage)
      .filter((r) => !q || [r.code, r.name, r.building].some((v) => v?.toLowerCase().includes(q)))
      .sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
  }, [rooms, search, kind]);

  // Keep the chosen room while it is visible; otherwise fall back to the first one in the list.
  const selectedRoom = filteredRooms.find((r) => r.id === selectedRoomId) ?? filteredRooms[0];
  const roomStations = selectedRoom ? (stationsByRoom.get(selectedRoom.id) ?? []) : [];
  const { data: occupancy } = useQuery(useRoomOccupancy(selectedRoom?.id ?? ""));

  const onlineCount = stations.filter((s) => s.health === "ONLINE").length;
  const offlineCount = stations.filter((s) => s.health === "OFFLINE").length;
  const stats = [
    { label: T.stats.rooms, value: rooms.length, sub: T.stats.activeSub(rooms.filter((r) => r.status === "ACTIVE").length), icon: DoorOpen },
    { label: T.stats.storage, value: rooms.filter((r) => r.isStorage).length, sub: T.stats.storageSub, icon: Warehouse },
    { label: T.stats.stations, value: stations.length, sub: T.stats.onlineSub(onlineCount), icon: MonitorSmartphone },
    { label: T.stats.offline, value: offlineCount, sub: T.stats.offlineSub(offlineCount), icon: WifiOff },
  ];

  const confirmDeleteRoom = () => {
    if (!roomToDelete) return;
    deleteRoom.mutate(roomToDelete.id, {
      onSuccess: () => showToast.success(T.toast.roomDeleted, `${roomToDelete.code} · ${roomToDelete.name}`),
      onError: (err) => showToast.error(T.toast.actionFailed, getErrorMessage(err, T.toast.deleteFailed)),
      onSettled: () => setRoomToDelete(null),
    });
  };

  const confirmDeleteStation = () => {
    if (!stationToDelete) return;
    deleteStation.mutate(stationToDelete.id, {
      onSuccess: () => showToast.success(T.toast.stationDeleted, stationToDelete.stationCode),
      onError: (err) => showToast.error(T.toast.actionFailed, getErrorMessage(err, T.toast.deleteFailed)),
      onSettled: () => setStationToDelete(null),
    });
  };

  if (roomsQuery.isPending) return <RoomsSkeletonLoader />;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-8xl space-y-6 px-4 py-6 sm:px-6 md:px-8 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">

        {/* Header */}
        <header className="flex flex-col gap-4 mt-12 md:mt-0 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-blue-600">{T.badge}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{T.title}</h1>
            <p className="mt-1 max-w-xl text-sm text-slate-500">{T.description}</p>
          </div>
          {canManage && (
            <button
              type="button"
              onClick={() => setRoomDialog({})}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              {T.newRoom}
            </button>
          )}
        </header>

        {/* Summary */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-sm"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-slate-500">{stat.label}</p>
                <p className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">{stat.value}</p>
                <p className="mt-0.5 truncate text-xs text-slate-400">{stat.sub}</p>
              </div>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                <stat.icon className="h-5 w-5" />
              </span>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">

          {/* ── Rooms list ── */}
          <section className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white lg:col-span-2">
            <div className="space-y-3 border-b border-slate-200 px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">{T.listTitle}</h2>
                  <p className="mt-0.5 text-xs text-slate-500">{T.countLabel(filteredRooms.length)}</p>
                </div>
                <div className="inline-flex shrink-0 rounded-lg bg-slate-100 p-1">
                  {T.kindFilters.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setKind(value)}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                        kind === value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <SearchBar onChangeValue={setSearch} name={T.searchName} placeholder={T.searchPlaceholder} />
            </div>

            <div className="max-h-[60vh] min-h-[45vh] overflow-y-auto">
              {roomsQuery.isError ? (
                <ErrorTable />
              ) : filteredRooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
                  <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                    <Search className="h-5 w-5 text-slate-400" />
                  </span>
                  <h3 className="text-sm font-semibold text-slate-900">{T.empty.title}</h3>
                  <p className="mt-1 max-w-sm text-sm text-slate-500">{T.empty.description}</p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {filteredRooms.map((room) => {
                    const list = stationsByRoom.get(room.id) ?? [];
                    const health = worstHealth(list);
                    const isSelected = room.id === selectedRoom?.id;
                    return (
                      <li key={room.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedRoomId(room.id)}
                          aria-current={isSelected}
                          className={`flex w-full items-center gap-3 px-5 py-3 text-left transition-colors ${
                            isSelected ? "bg-blue-50/70" : "hover:bg-slate-50"
                          }`}
                        >
                          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${isSelected ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"}`}>
                            {room.isStorage ? <Warehouse className="h-4 w-4" /> : <DoorOpen className="h-4 w-4" />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2">
                              <span className="font-mono text-sm font-medium text-slate-900">{room.code}</span>
                              {room.status === "INACTIVE" && (
                                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">{formatEnum(room.status)}</span>
                              )}
                            </span>
                            <span className="block truncate text-xs text-slate-500">{room.name}</span>
                          </span>
                          <span className="flex shrink-0 items-center gap-1.5 text-xs text-slate-500" title={health ? formatEnum(health) : undefined}>
                            <span className={`h-2 w-2 rounded-full ${health ? HEALTH_DOT[health] : "bg-slate-200"}`} />
                            {list.length}
                            <MonitorSmartphone className="h-3.5 w-3.5 text-slate-400" />
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>

          {/* ── Selected room ── */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white lg:col-span-3">
            {!selectedRoom ? (
              <div className="flex h-full min-h-[45vh] items-center justify-center px-8 text-center text-sm text-slate-500">
                {T.noSelection}
              </div>
            ) : (
              <>
                {/* Room header */}
                <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-mono text-lg font-semibold text-slate-900">{selectedRoom.code}</h2>
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                        {selectedRoom.isStorage ? <Warehouse className="h-3 w-3" /> : <DoorOpen className="h-3 w-3" />}
                        {selectedRoom.isStorage ? T.storageBadge : T.classroomBadge}
                      </span>
                      {selectedRoom.status === "INACTIVE" && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">{formatEnum(selectedRoom.status)}</span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-slate-700">{selectedRoom.name}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                      <Building2 className="h-3.5 w-3.5 text-slate-400" />
                      {T.location(selectedRoom.building, selectedRoom.floor)}
                    </p>
                  </div>
                  {canManage && (
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => setRoomDialog({ room: selectedRoom })}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        {T.actions.edit}
                      </button>
                      <button
                        type="button"
                        onClick={() => setRoomToDelete(selectedRoom)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {T.actions.delete}
                      </button>
                    </div>
                  )}
                </div>

                {/* Occupancy */}
                <div className="border-b border-slate-200 px-5 py-4">
                  <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-400">{T.occupancy.title}</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-3">
                      <Package className="h-4 w-4 text-emerald-600" />
                      <div>
                        <p className="text-lg font-semibold tabular-nums text-slate-900">{occupancy?.verifiedCount ?? "—"}</p>
                        <p className="text-xs text-slate-500">{T.occupancy.verified}</p>
                      </div>
                    </div>
                    <div className="rounded-lg bg-slate-50 px-4 py-3 sm:col-span-2">
                      <p className="mb-1.5 flex items-center gap-1.5 text-xs text-slate-500">
                        <Truck className="h-3.5 w-3.5 text-blue-600" />
                        {T.occupancy.incoming} · <span className="font-medium tabular-nums text-slate-700">{occupancy?.incoming.length ?? 0}</span>
                      </p>
                      {!occupancy || occupancy.incoming.length === 0 ? (
                        <p className="text-sm text-slate-400">{T.occupancy.noIncoming}</p>
                      ) : (
                        <ul className="max-h-24 space-y-1 overflow-y-auto">
                          {occupancy.incoming.map((loan) => (
                            <li key={loan.loanId} className="flex items-center justify-between gap-3 text-sm">
                              <span className="truncate text-slate-700">
                                <span className="font-mono text-xs text-slate-500">{loan.asset.assetCode}</span> {loan.asset.name}
                              </span>
                              <span className="shrink-0 text-xs text-slate-500">{T.occupancy.due} {FormattedDateTime(loan.transitDeadlineAt)}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stations */}
                <div className="px-5 py-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="text-xs font-medium uppercase tracking-wider text-slate-400">
                      {T.stations.title} · {roomStations.length}
                    </h3>
                    {canManage && (
                      <button
                        type="button"
                        onClick={() => setStationDialog({})}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        {T.stations.add}
                      </button>
                    )}
                  </div>

                  {stationsQuery.isError ? (
                    <ErrorTable />
                  ) : roomStations.length === 0 ? (
                    <p className="flex items-center gap-2 rounded-xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                      <Activity className="h-4 w-4 shrink-0 text-slate-400" />
                      {T.stations.empty}
                    </p>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead>
                          <tr className="bg-slate-50">
                            {T.stations.headers.map((col) => (
                              <th key={col} className="border-b border-slate-200 px-4 py-2.5 font-medium text-slate-500">{col}</th>
                            ))}
                            {canManage && <th className="w-20 border-b border-slate-200 px-4 py-2.5" />}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {roomStations.map((station) => (
                            <tr key={station.id} className="hover:bg-slate-50">
                              <td className="px-4 py-3 font-mono font-medium text-slate-900">{station.stationCode}</td>
                              <td className="px-4 py-3 text-slate-600">{formatEnum(station.type)}</td>
                              <td className="px-4 py-3"><StationHealthPill health={station.health} /></td>
                              <td className="px-4 py-3 text-slate-600">
                                {station.lastHeartbeatAt ? FormattedDateTime(station.lastHeartbeatAt) : <span className="text-slate-400">{T.stations.never}</span>}
                              </td>
                              <td className="px-4 py-3 font-mono text-xs text-slate-600">{station.firmwareVersion ?? "—"}</td>
                              <td className="px-4 py-3 font-mono text-xs text-slate-600">{station.ipAddress ?? "—"}</td>
                              {canManage && (
                                <td className="px-4 py-3">
                                  <div className="flex justify-end gap-1">
                                    <button
                                      type="button"
                                      onClick={() => setStationDialog({ station })}
                                      aria-label={`${T.actions.edit} ${station.stationCode}`}
                                      className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setStationToDelete(station)}
                                      aria-label={`${T.actions.delete} ${station.stationCode}`}
                                      className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </div>

      {/* Modals */}
      {roomDialog && <RoomFormDialog room={roomDialog.room} onClose={() => setRoomDialog(null)} />}

      {stationDialog && (
        <StationFormDialog station={stationDialog.station} roomId={selectedRoom?.id} onClose={() => setStationDialog(null)} />
      )}

      {roomToDelete && (
        <PopUpModal
          title={T.deleteRoomModal.title}
          label={T.deleteRoomModal.label}
          noun={T.deleteRoomModal.noun}
          onHandleCancelAction={() => setRoomToDelete(null)}
          onHandleConfirmAction={confirmDeleteRoom}
          isLoading={deleteRoom.isPending}
        />
      )}

      {stationToDelete && (
        <PopUpModal
          title={T.deleteStationModal.title}
          label={T.deleteStationModal.label}
          noun={T.deleteStationModal.noun}
          onHandleCancelAction={() => setStationToDelete(null)}
          onHandleConfirmAction={confirmDeleteStation}
          isLoading={deleteStation.isPending}
        />
      )}
    </div>
  );
}
