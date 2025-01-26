import { GameRoom, RoomResponse } from "@/types/room";

export const plainRoundData: Pick<GameRoom, "round"> = {
  round: {
    count: 1,
    turn: "top",
    attackerId: "",
    phase: "setting",
    electricChair: null,
    seatedChair: null,
    result: {
      status: null,
      confirmedIds: [],
    },
  },
};

export const isSuccessfulGetRoomResponse = (
  room: RoomResponse
): room is { status: 200; data: GameRoom } => {
  return room.status === 200;
};
