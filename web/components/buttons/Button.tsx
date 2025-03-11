import { ReactNode } from "react";

type ButtonProps = {
  onClick: () => void;
  children: ReactNode;
  textColor?: string;
  bgColor?: string;
  styles?: string;
};

export function Button({
  onClick,
  children,
  textColor = "text-white",
  bgColor = "bg-red-500",
  styles = "",
}: ButtonProps) {
  return (
    <button
      className={`inline-flex h-10 w-full justify-center items-center rounded-full ${bgColor} ${textColor} font-bold text-sm ${styles}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
