type InstructionMessageProps = {
  needAction: boolean;
  message: string;
};

export function InstructionMessage({
  needAction,
  message,
}: InstructionMessageProps) {
  return (
    <div className="text-center">
      <p
        className={`font-bold text-white text-sm bg-gray-800 bg-opacity-75 p-3 rounded-full whitespace-nowrap ${
          needAction && "animate-pulse"
        }`}
      >
        {message}
      </p>
    </div>
  );
}
