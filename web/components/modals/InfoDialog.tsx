import { Ref } from "react";

type InfoDialogProps = {
  ref: Ref<HTMLDialogElement>;
  children: React.ReactNode;
};

const InfoDialog = ({ ref, children }: InfoDialogProps) => {
  return (
    <dialog
      className="min-w-fit max-w-lg top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-transparent backdrop:bg-black/80 shadow-sm w-full"
      ref={ref}
    >
      <div className="animate-scale-in grid gap-4 backdrop:bg-black/80 p-6 text-card-foreground shadow-sm w-full bg-gray-800 border-2 border-red-500">
        {children}
      </div>
    </dialog>
  );
};

export default InfoDialog;
