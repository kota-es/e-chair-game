import { useNoticeDialog } from "@/components/dialogs/notice/useNoticeDialog";
import { useDialog } from "@/hooks/useDialog";

export function useRoomDialogs() {
  const {
    dialogRef: NoticeDialogRef,
    dialogState: noticeDialogState,
    showModal: showNoticeModal,
    closeModal: closeNoticeModal,
  } = useNoticeDialog();

  const {
    dialogRef: waitingCreaterStartDialogRef,
    showModal: showCreaterWaitingStartModa,
    closeModal: closeCreaterWaitingStartModal,
  } = useDialog();

  const { dialogRef: startTurnDialogRef, showModal: showStartTurnModal } =
    useDialog();

  const {
    dialogRef: turnResultDialogRef,
    showModal: showTurnResultModal,
    closeModal: closeTurnResultModal,
  } = useDialog();

  const { dialogRef: gameResultDialogRef, showModal: showGameResultModal } =
    useDialog();

  return {
    NoticeDialogRef,
    noticeDialogState,
    showNoticeModal,
    closeNoticeModal,
    waitingCreaterStartDialogRef,
    showCreaterWaitingStartModa,
    closeCreaterWaitingStartModal,
    startTurnDialogRef,
    showStartTurnModal,
    turnResultDialogRef,
    showTurnResultModal,
    closeTurnResultModal,
    gameResultDialogRef,
    showGameResultModal,
  };
}
