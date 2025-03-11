import { Button } from "@/components/buttons/Button";
import { InfoDialog } from "@/components/dialogs/InfoDialog";
import { Ref } from "react";

type NoticeSetDialogProps = {
  dialogRef: Ref<HTMLDialogElement>;
  action: () => void;
};

export function NoticeSetDialog({ dialogRef, action }: NoticeSetDialogProps) {
  return (
    <InfoDialog ref={dialogRef}>
      <div>
        <h2 className="font-semibold text-red-500">
          <span>相手が電気椅子を仕掛けました</span>
        </h2>
        <p className="pt-1 text-gray-300">座る椅子を選択してください</p>
      </div>
      <Button onClick={action}>OK</Button>
    </InfoDialog>
  );
}
