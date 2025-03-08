import InfoDialog from "@/components/modals/InfoDialog";
import { Copy } from "lucide-react";
import { Ref } from "react";
import { Tooltip, TooltipRefProps } from "react-tooltip";

type CreaterWaitingStartDialogProps = {
  roomId: string;
  dialogRef: Ref<HTMLDialogElement>;
  tooltipRef: Ref<TooltipRefProps>;
  copyId: () => void;
};

export default function CreaterWaitingStartDialog({
  roomId,
  dialogRef,
  tooltipRef,
  copyId,
}: CreaterWaitingStartDialogProps) {
  return (
    <InfoDialog ref={dialogRef}>
      <div>
        <h2 className="font-semibold text-red-500">
          <span>ルームを作成しました</span>
        </h2>
        <p className="pt-1 text-gray-300">
          下記のルームIDを対戦相手に伝えてください。
        </p>
        <p className="pt-1 text-gray-300">
          対戦相手が入室しだい、ゲームを開始します。
        </p>
      </div>
      <div className="flex gap-2 m-auto text-center text-2xl text-red-500">
        <span>{roomId}</span>
        <div>
          <Tooltip ref={tooltipRef} style={{ fontSize: "16px" }} />
          <a id="id-tooltip" className="cursor-pointer" onClick={copyId}>
            <Copy className="text-red-800" />
          </a>
        </div>
      </div>
    </InfoDialog>
  );
}
