import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  allStationsApi,
  createRoomApi,
  createStationApi,
  deleteRoomApi,
  deleteStationApi,
  updateRoomApi,
  updateStationApi,
} from "../api/room_api";
import { roomOccupancyApi } from "../api/loan_api";
import { ROOMS_KEY } from "./assetHooks";

// useAllRooms lives in assetHooks; these hooks share its ROOMS_KEY.

export const STATIONS_KEY = ["stations"] as const;
export const ROOM_OCCUPANCY_KEY = ["room-occupancy"] as const;

const useInvalidateRooms = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ROOMS_KEY });
    // Stations are listed per room, and the dashboard strip shows station health.
    queryClient.invalidateQueries({ queryKey: STATIONS_KEY });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };
};

// ── Rooms ────────────────────────────────────────────────────────────────────

export const useCreateRoom = () => {
  const onSuccess = useInvalidateRooms();
  return useMutation({ mutationFn: createRoomApi, mutationKey: ["create-room"], onSuccess });
};

export const useUpdateRoom = () => {
  const onSuccess = useInvalidateRooms();
  return useMutation({ mutationFn: updateRoomApi, mutationKey: ["update-room"], onSuccess });
};

export const useDeleteRoom = () => {
  const onSuccess = useInvalidateRooms();
  return useMutation({ mutationFn: deleteRoomApi, mutationKey: ["delete-room"], onSuccess });
};

export const useRoomOccupancy = (roomId: string) =>
  queryOptions({
    queryKey: [...ROOM_OCCUPANCY_KEY, roomId],
    queryFn: () => roomOccupancyApi(roomId),
    enabled: !!roomId,
    staleTime: 30 * 1000,
  });

// ── Stations ─────────────────────────────────────────────────────────────────

export const useAllStations = () =>
  queryOptions({
    queryKey: STATIONS_KEY,
    queryFn: allStationsApi,
    staleTime: 30 * 1000,
  });

export const useCreateStation = () => {
  const onSuccess = useInvalidateRooms();
  return useMutation({ mutationFn: createStationApi, mutationKey: ["create-station"], onSuccess });
};

export const useUpdateStation = () => {
  const onSuccess = useInvalidateRooms();
  return useMutation({ mutationFn: updateStationApi, mutationKey: ["update-station"], onSuccess });
};

export const useDeleteStation = () => {
  const onSuccess = useInvalidateRooms();
  return useMutation({ mutationFn: deleteStationApi, mutationKey: ["delete-station"], onSuccess });
};
