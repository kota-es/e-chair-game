import { cookies } from "next/headers";

export const getRoomContextFromCookie = async () => {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value as string;
  const roomId = cookieStore.get("roomId")?.value as string;
  return { userId, roomId };
};
