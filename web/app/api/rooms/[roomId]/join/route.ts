import { NextRequest, NextResponse } from "next/server";
import { joinRoom } from "@/firestore";

export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) => {
  const { roomId } = await params;
  const res = await joinRoom(roomId);
  return NextResponse.json(res);
};
