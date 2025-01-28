import { isSuccessfulGetRoomResponse, plainRoundData } from "@/app/utils/room";
import { getRoom, updateRoom } from "@/firestore";
import { NextRequest, NextResponse } from "next/server";

export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) => {
  const { roomId } = await params;
  const { userId } = await req.json();

  const room = await getRoom(roomId);
  if (!isSuccessfulGetRoomResponse(room)) {
    return NextResponse.json({ error: room.error }, { status: room.status });
  }

  const round = room.data.round;

  if (round.result.confirmedIds.length === 0) {
    round.result.confirmedIds.push(userId);

    const res = await updateRoom(roomId, { round });

    if (res.status !== 200) {
      return NextResponse.json({ error: res.error }, { status: res.status });
    }
    return NextResponse.json({ data: res.data }, { status: res.status });
  }

  if (round.result.confirmedIds.includes(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (
    round.result.confirmedIds.length === 1 &&
    !round.result.confirmedIds.includes(userId)
  ) {
    const playerIds = [userId, round.result.confirmedIds[0]];
    const nextAttackerId = playerIds.find((id) => id !== round.attackerId);

    let data = {};
    if (round.turn === "top") {
      data = {
        round: {
          ...plainRoundData.round,
          attackerId: nextAttackerId,
          turn: "bottom",
          count: round.count,
        },
      };
    } else {
      data = {
        round: {
          ...plainRoundData.round,
          attackerId: nextAttackerId,
          turn: "top",
          count: round.count + 1,
        },
      };
    }
    const res = await updateRoom(roomId, data);
    if (res.status !== 200) {
      return NextResponse.json({ error: res.error }, { status: res.status });
    }
    return NextResponse.json({ data: res.data }, { status: res.status });
  }
};
