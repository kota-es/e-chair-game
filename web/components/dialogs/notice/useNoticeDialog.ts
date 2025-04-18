import { useState, useRef, useCallback } from "react";

export function useNoticeDialog() {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [dialogState, setDialogState] = useState({
    title: "",
    message: "",
    button: {
      label: "",
      action: () => {},
    },
  });

  const closeModal = useCallback(() => {
    if (dialogRef.current) {
      dialogRef.current.close();
    }
  }, []);

  const showModal = useCallback(
    (
      {
        title,
        message,
        button,
      }: {
        title: string;
        message: string;
        button: {
          label: string;
          action: () => void;
        };
      },
      miliseconds?: number
    ) => {
      if (dialogRef.current) {
        dialogRef.current.showModal();
        setDialogState({ title, message, button });
      }

      if (!miliseconds) return;

      if (typeof miliseconds !== "number") {
        console.error("miliseconds must be a number");
        return;
      }

      setTimeout(() => {
        closeModal();
      }, miliseconds);
    },
    [closeModal]
  );

  return { dialogRef, dialogState, showModal, closeModal };
}
