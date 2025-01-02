"use client";

import { Bolt } from "lucide-react";
import { useRef } from "react";

export default function HomePage() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const handleShowModal = () => dialogRef.current?.showModal();
  const handleCloseModal = () => dialogRef.current?.close();

  return (
    <>
      <div className="min-h-screen bg-gray-900 text-white p-4 grid place-items-center">
        <div className="rounded-lg text-card-foreground shadow-sm w-full max-w-md bg-gray-800 border-2 border-red-500">
          <div className="p-6">
            <h3 className="flex gap-3 items-center justify-center text-3xl text-center font-semibold text-red-500">
              <Bolt className="animate-pulse" />
              <span>電気椅子ゲーム</span>
              <Bolt className="animate-pulse" />
            </h3>
            <p className="pt-1 text-sm text-center text-gray-300">
              緊張と興奮の2人対戦ゲーム
            </p>
          </div>
          <div className="flex flex-col gap-4 space-y-1.5 p-6 pt-0">
            <button className="inline-flex h-10 justify-center items-center rounded-full bg-red-500 p-4 font-bold text-sm">
              ルームを作成
            </button>
            <button
              onClick={handleShowModal}
              className="inline-flex h-10 justify-center items-center rounded-full bg-gray-600 p-4 font-bold text-sm"
            >
              ルームに入室
            </button>
          </div>
        </div>
        <dialog
          className="absolute min-w-fit max-w-lg top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  backdrop:bg-black/80 shadow-sm w-full"
          ref={dialogRef}
        >
          <div className="grid gap-4 backdrop:bg-black/80 p-6 text-card-foreground shadow-sm w-full bg-gray-800 border-2 border-red-500">
            <div>
              <h2 className="font-semibold text-red-500">
                <span>ルーム入室</span>
              </h2>
              <p className="pt-1 text-gray-300">ルームIDを入力してください</p>
            </div>
            <input
              type="text"
              className="w-full bg-gray-700 text-gray-300 p-2 rounded-md"
            />
            <div className="grid gap-4 grid-cols-2">
              <button
                onClick={handleCloseModal}
                className="inline-flex h-10 justify-center items-center rounded-full bg-gray-700 font-bold text-sm text-white"
              >
                キャンセル
              </button>
              <button className="inline-flex h-10 justify-center items-center rounded-full bg-red-500 font-bold text-sm text-white">
                入室
              </button>
            </div>
          </div>
        </dialog>
      </div>
    </>
  );
}
