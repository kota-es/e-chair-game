import { useState, useRef } from "react";

export function useDialog() {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [isShow, setIsShow] = useState(false);

  const showModal = (miliseconds?: number) => {
    if (dialogRef.current) {
      dialogRef.current.showModal();
      setIsShow(true);
    }
    if (miliseconds) {
      setTimeout(() => {
        closeModal();
      }, miliseconds);
    }
  };

  const closeModal = () => {
    if (dialogRef.current) {
      dialogRef.current.close();
      setIsShow(false);
    }
  };

  return { dialogRef, isShow, showModal, closeModal };
}
