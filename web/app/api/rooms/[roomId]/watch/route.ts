import { watchRoom } from "@/libs/firestore";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) => {
  const { roomId } = await params;
  await watchRoom(roomId);
  return NextResponse.json({ status: 200 });
};
