// components/ui/Button.tsx
import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "clear" | "cancel";
  isLoading?: boolean;
}

export function Button({
  children,
  variant = "primary",
  isLoading,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-colors";
  const variants = {
    primary: "bg-black-800 hover:bg-black-500 text-white disabled:bg-black-300",
    secondary:
      "bg-gray-200 hover:bg-gray-300 text-gray-800 disabled:bg-gray-100",
    cancel: "bg-red-200 hover:bg-gray-300 text-gray-800 disabled:bg-gray-100",
    clear: "bg-blue-200 hover:bg-gray-300 text-gray-800 disabled:bg-gray-100",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? "Loading..." : children}
    </button>
  );
}
