import { isSuccessfulGetRoomResponse } from "@/app/utils/room";
import { getRoom, updateRoom } from "@/firestore";
import { GameRoom } from "@/types/room";
import { NextRequest, NextResponse } from "next/server";

export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) => {
  const { roomId } = await params;
  const room = await getRoom(roomId);

  if (!isSuccessfulGetRoomResponse(room)) {
    return NextResponse.json({ error: room.error }, { status: room.status });
  }

  const { players, round } = room.data;
  const isShocked = round.electricChair === round.seatedChair;

  // isShocked が true の場合、attackerId のプレイヤーの shockedCount を +1 する
  // isShockedでないばあい、attackerId のプレイヤーの point を seatedChair の値だけ増やす
  const updatedPlayers = players.map((player) => {
    if (player.id === round.attackerId) {
      return {
        ...player,
        point: isShocked
          ? player.point
          : player.point + (round.seatedChair || 0),
        shockedCount: isShocked ? player.shockedCount + 1 : player.shockedCount,
      };
    }
    return player;
  });

  // shockedでない場合、remainingChairs から seatedChair を削除する
  const remainingChairs = isShocked
    ? room.data.remainingChairs
    : room.data.remainingChairs.filter((chair) => chair !== round.seatedChair);

  // 勝敗判定
  let winnerId = null;
  const attackerId = round.attackerId;
  const defenderId = room.data.players.find(
    (player) => player.id !== attackerId
  )?.id;
  if (updatedPlayers.some((player) => player.point >= 40)) {
    winnerId = round.attackerId;
  } else if (updatedPlayers.some((player) => player.shockedCount === 3)) {
    winnerId = defenderId;
  } else if (remainingChairs.length === 1) {
    const winner = updatedPlayers.reduce((prev, current) =>
      prev.point > current.point ? prev : current
    );
    winnerId = winner.id;
  }

  const data: Partial<GameRoom> = {
    players: updatedPlayers,
    remainingChairs,
    winnerId,
    round: {
      ...round,
      phase: "result",
      result: {
        ...round.result,
        status: isShocked ? "shocked" : "safe",
      },
    },
  };

  const res = await updateRoom(roomId, data);

  if (res.status !== 200) {
    return NextResponse.json({ error: res.error }, { status: res.status });
  }
  return NextResponse.json({ data: res.data }, { status: res.status });
};
