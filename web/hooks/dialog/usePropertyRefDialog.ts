import { useState, useEffect, useRef } from "react";

type UpdateCheck<T> = (prevState: T | null, newState: T) => boolean;
type CloseCheck<T> = (prevState: T | null, newState: T) => boolean;

export function usePropertyRefDialog<T>({
  data,
  shouldShowDialog,
  shouldCloseDialog,
}: {
  data: T | null;
  shouldShowDialog: UpdateCheck<T>;
  shouldCloseDialog?: CloseCheck<T>;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const previousStateRef = useRef<T | null>(null);

  useEffect(() => {
    if (data) {
      const prevState = previousStateRef.current;
      const newState = data;

      // 開く条件
      if (prevState !== null && shouldShowDialog(prevState, newState)) {
        dialogRef.current?.showModal();
        setIsOpen(true);
      }

      // 閉じる条件（オプション）
      if (
        shouldCloseDialog &&
        prevState !== null &&
        shouldCloseDialog(prevState, newState)
      ) {
        dialogRef.current?.close();
        setIsOpen(false);
      }

      // 更新前の状態を記録
      previousStateRef.current = newState;
    }
  }, [data, shouldShowDialog, shouldCloseDialog]);

  const closeDialog = () => setIsOpen(false);

  return { dialogRef, isOpen, closeDialog };
}
