import { updateRoom } from "@/libs/firestore";
import { NextRequest, NextResponse } from "next/server";

export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) => {
  const { roomId } = await params;
  const { data } = await req.json();

  const res = await updateRoom(roomId, { round: data });
  if (res.status !== 200) {
    return NextResponse.json({ error: res.error }, { status: res.status });
  }
  return NextResponse.json({ data: res.data }, { status: res.status });
};
