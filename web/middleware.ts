import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value as string;
  const roomId = cookieStore.get("roomId")?.value as string;
  const pathRoomId = request.nextUrl.pathname.split("/").slice(-1)[0];

  if (!userId || !roomId || roomId !== pathRoomId) {
    return NextResponse.redirect(new URL("/", request.url));
  }
}

export const config = {
  matcher: ["/room/:roomId"],
};
