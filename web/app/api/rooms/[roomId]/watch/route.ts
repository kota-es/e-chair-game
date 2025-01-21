import { watchRoom } from "@/firestore";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (
  req: NextRequest,
  { params }: { params: { roomId: string } }
) => {
  const { roomId } = await params;
  const res = await watchRoom(roomId);
  console.log(res);
  return NextResponse.json({ status: 200 });
};
