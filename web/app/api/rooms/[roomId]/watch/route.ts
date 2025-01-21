import { watchRoom } from "@/firestore";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (
  req: NextRequest,
  { params }: { params: { roomId: string } }
) => {
  const { roomId } = await params;
  await watchRoom(roomId);
  return NextResponse.json({ status: 200 });
};
