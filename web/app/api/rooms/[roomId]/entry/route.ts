"use server";

import { NextRequest, NextResponse } from "next/server";
import { getRoom, updateRoom } from "@/firestore";
import { isSuccessfulRoomResponse } from "@/app/utils/room";

export const PATCH = async (
  req: NextRequest,
  { params }: { params: { roomId: string } }
) => {
  const { roomId } = await params;
  const { userId } = await req.json();

  const room = await getRoom(roomId);
  if (!isSuccessfulRoomResponse(room)) {
    return NextResponse.json(room);
  }

  if (!room.data.players[userId]) {
    return NextResponse.json({ status: 403, error: "Forbidden" });
  }

  const updateData = {
    ...room.data.players[userId],
    ready: true,
  };

  const data = {
    [`players.${userId}`]: {
      ...updateData,
    },
  };

  const res = await updateRoom(roomId, data);
  return NextResponse.json(res);
};
