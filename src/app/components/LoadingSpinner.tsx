interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  size = "md",
  text = "Loading...",
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-xl",
  };

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#00b8e2]">
        <div className="text-center">
          <div className="flex justify-center items-center mb-4">
            <div
              className={`animate-spin rounded-full border-b-2 border-white ${sizeClasses[size]}`}
            ></div>
          </div>
          <h1 className={`text-white font-bold ${textSizeClasses[size]}`}>
            {text}
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div
        className={`animate-spin rounded-full border-b-2 border-[#00b8e2] ${sizeClasses[size]}`}
      ></div>
      {text && (
        <p className={`mt-4 text-gray-600 ${textSizeClasses[size]}`}>{text}</p>
      )}
    </div>
  );
}
