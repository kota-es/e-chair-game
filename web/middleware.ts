import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const userId = request.cookies.get("userId")?.value as string;
  const roomId = request.cookies.get("roomId")?.value as string;
  const pathRoomId = request.nextUrl.pathname.split("/").pop();

  if (!userId || !roomId || roomId !== pathRoomId) {
    return NextResponse.redirect(new URL("/", request.url));
  }
}

export const config = {
  matcher: ["/room/:roomId"],
};
