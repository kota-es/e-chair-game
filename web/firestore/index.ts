"use server";

import { initializeApp } from "firebase/app";
import { addDoc, collection, getFirestore } from "firebase/firestore";
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
        },
      },
      remainingChairs: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    });
    return { status: "success", roomId: room.id, userId: createrId };
  } catch (e) {
    return { status: "error", error: e };
  }
};
