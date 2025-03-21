"use client";

import { Bolt } from "lucide-react";
import { useActionState, useEffect } from "react";
import { Button } from "@/components/buttons/Button";
import { createRoomAction, joinRoomAction } from "@/features/room/action";
import { useDialog } from "@/hooks/useDialog";
import { JoinDialog } from "@/features/top/components/dialogs/JoinDialog";
import { useToast } from "@/utils/toast/useToast";

export default function HomePage() {
  const toast = useToast();
  const {
    dialogRef: joinDialogRef,
    isShow: isShowJoinDialog,
    showModal: showJoinModal,
    closeModal: closeJoinModal,
  } = useDialog();

  const [createState, createAction, isCreating] = useActionState(
    createRoomAction,
    {
      error: "",
    }
  );
  const [joinState, joinAction, isJoining] = useActionState(joinRoomAction, {
    error: "",
  });

  useEffect(() => {
    if (isJoining || !isShowJoinDialog) {
      joinState.error = "";
    }
  }, [isJoining, isShowJoinDialog, joinState]);

  useEffect(() => {
    if (createState.error) {
      toast.open(createState.error);
    }
  }, [createState.error, toast]);

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
          <form action={createAction} className="flex flex-col gap-4">
            <Button>ルームを作成</Button>
            <Button
              type="button"
              onClick={() => showJoinModal()}
              bgColor="bg-gray-600"
            >
              ルームに入室
            </Button>
          </form>
        </div>
      </div>
      <JoinDialog
        dialogRef={joinDialogRef}
        joinAction={joinAction}
        joinState={joinState}
        isJoining={isJoining}
        closeJoinModal={closeJoinModal}
      />
      {isCreating && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000]">
          <div className="animate-pulse text-white text-center flex justify-center">
            <span className="font-bold text-xl">Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
}
