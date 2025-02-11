import { NextResponse } from "next/server";
import { createRoom } from "@/firestore";

export const POST = async () => {
  const res = await createRoom();
  const response = NextResponse.json(res);
  if (res.status !== 200) {
    return response;
  }
  response.cookies.set("roomId", res.roomId as string);
  response.cookies.set("userId", res.userId as string);
  return response;
};
