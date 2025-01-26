"use server";

import {
  getDoc,
  addDoc,
  collection,
  doc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { customAlphabet } from "nanoid";
import { getFirestoreApp } from "@/firestore/config";
import { GameRoom, RoomResponse } from "@/types/room";

export const createRoom = async () => {
  const alphanumeric =
    "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const db = await getFirestoreApp();

  try {
    const createrId = customAlphabet(alphanumeric, 5)();
    // Add a new document with a generated id.
    const room = await addDoc(collection(db, "rooms"), {
      status: "waiting",
      createrId: createrId,
      round: {
        count: 1,
        turn: "top",
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
      remainingChairs: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    });
    return { status: 200, roomId: room.id, userId: createrId };
  } catch (e) {
    return { status: "error", error: e };
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
      return { status: 404, error: "Room not found" };
    }

    const players = docSnap.data().players;
    if (Object.keys(players).length >= 2) {
      return { status: 400, error: "Room is full" };
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
    return { status: 500, error: e };
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
    return { status: 500, error: e };
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
