import { NextRequest, NextResponse } from "next/server";
import { joinRoom } from "@/firestore";

export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) => {
  const { roomId } = await params;
  const res = await joinRoom(roomId);
  const response = NextResponse.json(res);
  if (res.status !== 200) {
    return response;
  }
  response.cookies.set("roomId", res.roomId as string);
  response.cookies.set("userId", res.userId as string);
  return response;
};
