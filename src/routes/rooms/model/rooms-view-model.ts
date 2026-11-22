import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DoorOpen, MonitorSmartphone, WifiOff, Warehouse } from "lucide-react";
import type { RoomDto, StationDto, StationHealth } from "../../../@types/types";
import { useAllRooms } from "../../../hooks/assetHooks";
import { useAllStations, useDeleteRoom, useDeleteStation, useRoomOccupancy } from "../../../hooks/roomHooks";
import { showToast } from "../../../components/AppToast";
import { getErrorMessage } from "../../../components/form/FormKit";
import { UserData, canManageRooms } from "../../../utils/usersData/userData";
import { ROOMS_CONTENT as T } from "../../../constants/roomsContent";

export type KindFilter = (typeof T.kindFilters)[number]["value"];

// Worst health first, so a room with any offline station shows red in the list.
export const HEALTH_RANK: Record<StationHealth, number> = { OFFLINE: 0, WARNING: 1, ONLINE: 2 };

export const worstHealth = (stations: StationDto[]) =>
  stations.reduce<StationHealth | null>(
    (worst, s) => (worst === null || HEALTH_RANK[s.health] < HEALTH_RANK[worst] ? s.health : worst),
    null,
  );

export const useRoomsViewModel = () => {
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

  return {
    viewer,
    canManage,
    roomsQuery,
    stationsQuery,
    deleteRoom,
    deleteStation,
    search,
    setSearch,
    kind,
    setKind,
    selectedRoomId,
    setSelectedRoomId,
    roomDialog,
    setRoomDialog,
    stationDialog,
    setStationDialog,
    roomToDelete,
    setRoomToDelete,
    stationToDelete,
    setStationToDelete,
    rooms,
    stations,
    stationsByRoom,
    filteredRooms,
    selectedRoom,
    roomStations,
    occupancy,
    onlineCount,
    offlineCount,
    stats,
    confirmDeleteRoom,
    confirmDeleteStation,
  };
};

export type RoomsViewModel = ReturnType<typeof useRoomsViewModel>;
