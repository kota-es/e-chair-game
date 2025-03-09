"use client";

import { Bolt } from "lucide-react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import InfoDialog from "@/components/dialogs/InfoDialog";

export default function HomePage() {
  const router = useRouter();

  const dialogRef = useRef<HTMLDialogElement>(null);
  const roomIdRef = useRef<HTMLInputElement>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleShowModal = () => dialogRef.current?.showModal();
  const handleCloseModal = () => dialogRef.current?.close();

  const handleCreateRoom = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const response = await fetch("/api/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const res = await response.json();
    if (res.status === 200) {
      router.push(`/room/${res.roomId}`);
    } else {
      setIsSubmitting(false);
      console.error(res.id);
    }
  };

  const handleJoinRoom = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    const roomId = roomIdRef.current?.value;
    const response = await fetch(`/api/rooms/${roomId}/join`, {
      method: "POST",
      headers: {
        "Content-Type": "appliscation/json",
      },
    });
    const res = await response.json();
    if (res.status === 200) {
      router.push(`/room/${res.roomId}`);
    } else {
      setIsSubmitting(false);
      if (res.status === 404) {
        setErrorMessage("ルームが見つかりませんでした");
      }
      if (res.status === 400) {
        setErrorMessage("ルームが満員です");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 grid place-items-center">
      <div className="rounded-lg text-card-foreground shadow-sm w-full max-w-md bg-gray-800 border-2 border-red-500">
        <div className="p-6">
          <h3 className="flex gap-3 items-center justify-center text-3xl text-center font-semibold text-red-500">
            <Bolt className="animate-pulse" />
            <span>電気椅子ゲーム</span>
            <Bolt className="animate-pulse" />
          </h3>
          <p className="pt-1 text-sm text-center text-gray-300">
            緊張と興奮の椅子取り合戦
          </p>
        </div>
        <div className="flex flex-col gap-4 space-y-1.5 p-6 pt-0">
          <button
            className="inline-flex h-10 justify-center items-center rounded-full bg-red-500 p-4 font-bold text-sm"
            onClick={handleCreateRoom}
          >
            ルームを作成
          </button>
          <button
            className="inline-flex h-10 justify-center items-center rounded-full bg-gray-600 p-4 font-bold text-sm"
            onClick={handleShowModal}
          >
            ルームに入室
          </button>
        </div>
      </div>
      <InfoDialog ref={dialogRef}>
        <div>
          <h2 className="font-semibold text-red-500">
            <span>ルーム入室</span>
          </h2>
          <p className="pt-1 text-gray-300">ルームIDを入力してください</p>
        </div>
        <input
          type="text"
          spellCheck="false"
          className="w-full bg-gray-700 text-gray-300 p-2 rounded-md"
          ref={roomIdRef}
        />
        {errorMessage && (
          <p className="text-red-500 text-sm text-center">{errorMessage}</p>
        )}
        <div className="grid gap-4 grid-cols-2">
          <button
            className="inline-flex h-10 justify-center items-center rounded-full bg-gray-700 font-bold text-sm text-white"
            onClick={handleCloseModal}
          >
            キャンセル
          </button>
          <button
            className="inline-flex h-10 justify-center items-center rounded-full bg-red-500 font-bold text-sm text-white"
            onClick={handleJoinRoom}
          >
            {isSubmitting ? (
              <span className="animate-pulse">入室中...</span>
            ) : (
              "入室"
            )}
          </button>
        </div>
      </InfoDialog>
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000]">
          <div className="animate-pulse text-white text-center flex justify-center">
            <span className="font-bold text-xl">Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
}
