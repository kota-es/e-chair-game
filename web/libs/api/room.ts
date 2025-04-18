import { apiRequest } from "@/libs/api/request";
import { GameRoom } from "@/types/room";
import { headers } from "next/headers";

const createApiUrl = async (path = "") => {
  const headersData = await headers();
  const host = headersData.get("host");
  const protocol = headersData.get("x-forwarded-proto") || "http";
  const baseUrl = `${protocol}://${host}/api/rooms/`;
  return baseUrl + path;
};

export const entryRoom = async (roomId: string, userId: string) => {
  try {
    const url = await createApiUrl(`${roomId}/entry`);
    const room = await apiRequest<GameRoom>(url, {
      method: "PATCH",
      body: { userId },
    });
    return room;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      throw error;
    }
    throw new Error("ルーム入室に失敗しました");
  }
};
