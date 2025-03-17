"use server";

import { joinRoom } from "@/firestore";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function joinRoomAction(
  prevState: { error?: string },
  formData: FormData
) {
  const roomId = formData.get("roomId") as string;
  if (!roomId) {
    return { error: "ルームIDを入力してください" };
  }

  const res = await joinRoom(roomId);

  if (res.status !== 200) {
    return { error: res.error };
  }
  await setCookies([
    { name: "roomId", value: res.roomId as string },
    { name: "userId", value: res.userId as string },
  ]);

  return redirect(`/room/${roomId}`);
}

const setCookies = async (
  nameValues: Array<{ name: string; value: string }>
) => {
  const cookieStore = await cookies();
  nameValues.forEach(({ name, value }) => {
    cookieStore.set({
      name: name,
      value: value || "",
      sameSite: "strict",
      secure: true,
      httpOnly: true,
    });
  });
};
