import Room from "@/features/room/page/Room";
import { redirect } from "next/navigation";
import { entryRoom } from "@/libs/api/room";
import { getRoomContextFromCookie } from "@/libs/room";

export default async function RoomPage() {
  try {
    const { userId, roomId } = await getRoomContextFromCookie();
    const room = await entryRoom(roomId, userId);
    return <Room initialData={{ room: room, userId, roomId }} />;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      redirect("/");
    }
  }
}
