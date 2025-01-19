import { GameRoom, RoomResponse } from "@/types/room";

export const isSuccessfulRoomResponse = (
  room: RoomResponse
): room is { status: 200; data: GameRoom } => {
  return room.status === 200;
};
