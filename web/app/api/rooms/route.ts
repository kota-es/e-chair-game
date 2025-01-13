import { NextResponse } from "next/server";
import { createRoom } from "@/firestore";

export const POST = async () => {
  const res = await createRoom();
  return NextResponse.json(res);
};
