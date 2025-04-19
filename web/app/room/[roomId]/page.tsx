import Room from "@/features/room/page/Room";
import { redirect } from "next/navigation";
import { getRoomContextFromCookie } from "@/libs/room";
import { entryRoomAction } from "@/features/room/action";

export default async function RoomPage() {
  try {
    const { userId, roomId } = await getRoomContextFromCookie();
    const { status, room, error } = await entryRoomAction({ roomId, userId });
    if (status !== 200 || !room) {
      throw new Error(error);
    }
    return <Room initialData={{ room, userId, roomId }} />;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      redirect("/");
    }
  }
}
