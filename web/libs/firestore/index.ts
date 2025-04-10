"use server";

import { getDoc, doc, updateDoc, onSnapshot, setDoc } from "firebase/firestore";
import { customAlphabet } from "nanoid";
import { getFirestoreApp } from "@/libs/firestore/config";
import { GameRoom, RoomResponse } from "@/types/room";

export const createRoom = async () => {
  const alphanumeric =
    "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const db = await getFirestoreApp();

  try {
    const newRoomId = await createRoomId();
    const createrId = customAlphabet(alphanumeric, 5)();
    // Add a new document with a generated id.
    await setDoc(doc(db, "rooms", newRoomId), {
      status: "waiting",
      createrId: createrId,
      round: {
        count: 1,
        turn: "top",
        phase: "setting",
        attackerId: createrId,
        electricChair: null,
        seatedChair: null,
        result: {
          status: null,
          confirmedIds: [],
        },
      },
      players: [
        {
          id: createrId,
          point: 0,
          shockedCount: 0,
          ready: false,
        },
      ],
      remainingChairs: [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    });
    return { status: 200, roomId: newRoomId, userId: createrId };
  } catch (e) {
    if (e instanceof Error) {
      return { status: 500, error: e.message };
    }
    return { status: 500, error: "ルーム作成に失敗しました" };
  }
};

export const joinRoom = async (roomId: string) => {
  const db = await getFirestoreApp();

  const alphanumeric =
    "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const docRef = doc(db, "rooms", roomId);

  try {
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return { status: 404, error: "ルームが見つかりませんでした" };
    }

    const players = docSnap.data().players;
    if (Object.keys(players).length >= 2) {
      return { status: 400, error: "ルームは満員です" };
    }
    //メンバー追加
    const userId = customAlphabet(alphanumeric, 5)();
    const player = {
      id: userId,
      point: 0,
      shockedCount: 0,
      ready: false,
    };
    players.push(player);
    await updateDoc(docRef, {
      players: players,
    });
    return { status: 200, roomId: roomId, userId: userId };
  } catch (e) {
    if (e instanceof Error) {
      return { status: 500, error: e.message };
    }
    return { status: 500, error: "ルーム参加に失敗しました" };
  }
};

export const updateRoom = async (roomId: string, data: Partial<GameRoom>) => {
  const db = await getFirestoreApp();
  const docRef = doc(db, "rooms", roomId);

  try {
    await updateDoc(docRef, data);
    const docSnap = await getDoc(docRef);
    return { status: 200, data: docSnap.data() };
  } catch (e) {
    if (e instanceof Error) {
      return { status: 500, error: e.message };
    }
    return { status: 500, error: "ルーム更新に失敗しました" };
  }
};

export const getRoom = async (roomId: string): Promise<RoomResponse> => {
  const db = await getFirestoreApp();
  const docRef = doc(db, "rooms", roomId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { status: 200, data: docSnap.data() as GameRoom };
  } else {
    return { status: 404, error: "Room not found" };
  }
};

export const watchRoom = async (roomId: string) => {
  const db = await getFirestoreApp();
  const docRef = doc(db, "rooms", roomId);

  const unsubscribe = onSnapshot(docRef, (doc) => {
    return doc.data();
  });

  return unsubscribe;
};

const createRoomId = async () => {
  const db = await getFirestoreApp();
  const alphanumeric = "23456789abcdefghjklmnpqrstuvwxyz";
  const newId = customAlphabet(alphanumeric, 7)();
  const snapshot = await getDoc(doc(db, "rooms", newId));
  if (snapshot.exists()) {
    return createRoomId();
  }
  return newId;
};
