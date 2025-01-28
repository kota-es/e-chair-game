"use server";

import { NextRequest, NextResponse } from "next/server";
import { getRoom, updateRoom } from "@/firestore";
import { isSuccessfulGetRoomResponse } from "@/app/utils/room";

export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) => {
  const { roomId } = await params;
  const { userId } = await req.json();

  const room = await getRoom(roomId);
  if (!isSuccessfulGetRoomResponse(room)) {
    return NextResponse.json(room);
  }

  const isPlayer = room.data.players.some((player) => player.id === userId);
  if (!isPlayer) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const playersData = room.data.players.map((player) => {
    if (player.id === userId) {
      return {
        ...player,
        ready: true,
      };
    }
    return player;
  });

  const data = {
    players: playersData,
  };

  const res = await updateRoom(roomId, data);
  if (res.status !== 200) {
    return NextResponse.json({ error: res.error }, { status: res.status });
  }
  return NextResponse.json({ data: res.data }, { status: res.status });
};
