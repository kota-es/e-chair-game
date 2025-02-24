import Room from "@/features/room/Room";
import type { GameRoom } from "@/types/room";
import { cookies, headers } from "next/headers";

export default async function RoomPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value as string;
  const roomId = cookieStore.get("roomId")?.value as string;
  // リクエスト情報から絶対パスを生成
  const headersData = await headers();
  const host = headersData.get("host");
  const protocol = headersData.get("x-forwarded-proto") || "http";
  const url = `${protocol}://${host}/api/rooms/${roomId}/entry`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId }),
  });
  if (res.status === 200) {
    const data = await res.json();
    const room: GameRoom = data.data;
    return <Room initialData={{ room, userId, roomId }} />;
  } else {
    console.error("failed to entry room");
  }
}
