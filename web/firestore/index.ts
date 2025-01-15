"use server";

import { initializeApp } from "firebase/app";
import {
  getDoc,
  addDoc,
  collection,
  getFirestore,
  doc,
  updateDoc,
} from "firebase/firestore";
import { customAlphabet } from "nanoid";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEYY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

export const createRoom = async () => {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const alphanumeric =
    "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

  try {
    const createrId = customAlphabet(alphanumeric, 5)();
    // Add a new document with a generated id.
    const room = await addDoc(collection(db, "rooms"), {
      status: "waiting",
      createrId: createrId,
      players: {
        [createrId]: {
          point: 0,
          shockedCount: 0,
          ready: false,
        },
      },
      remainingChairs: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    });
    return { status: 200, roomId: room.id, userId: createrId };
  } catch (e) {
    return { status: "error", error: e };
  }
};

export const joinRoom = async (roomId: string) => {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

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
    await updateDoc(docRef, {
      [`players.${userId}`]: {
        point: 0,
        shockedCount: 0,
        ready: false,
      },
    });
    return { status: 200, roomId: roomId, userId: userId };
  } catch (e) {
    return { status: 500, error: e };
  }
};
