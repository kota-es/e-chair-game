"use server";

import { createRoom, joinRoom, updateRoom } from "@/libs/firestore";
import { Round } from "@/types/room";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function createRoomAction() {
  const res = await createRoom();
  if (res.status !== 200) {
    return { error: res.error };
  }

  await setCookies([
    { name: "roomId", value: res.roomId as string },
    { name: "userId", value: res.userId as string },
  ]);

  return redirect(`/room/${res.roomId}`);
}

export async function joinRoomAction(
  _: { error?: string },
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

export async function selectChairAction(data: {
  roomId: string | null;
  roundData: Round | undefined;
}) {
  const { roomId, roundData } = data;
  if (!roomId || !roundData) {
    return { status: 400, error: "ルームIDとラウンドデータを指定してください" };
  }
  const res = await updateRoom(roomId, { round: roundData });
  if (res.status !== 200) {
    return { status: res.status, error: res.error };
  }
  return { status: 200, error: "" };
}
