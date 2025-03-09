import InfoDialog from "@/components/dialogs/InfoDialog";
import { Ref } from "react";

type ActivateShockDialogProps = {
  dialogRef: Ref<HTMLDialogElement>;
  action: () => void;
};

export default function ActivateShockDialog({
  dialogRef,
  action,
}: ActivateShockDialogProps) {
  return (
    <InfoDialog ref={dialogRef}>
      <div>
        <h2 className="font-semibold text-red-500">
          <span>相手が椅子に座りました</span>
        </h2>
        <p className="pt-1 text-gray-300">電流を起動してください</p>
      </div>
      <button
        className="inline-flex h-10 justify-center items-center rounded-full bg-red-500 font-bold text-sm text-white"
        onClick={action}
      >
        起動
      </button>
    </InfoDialog>
  );
}
