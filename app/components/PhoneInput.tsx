import React from "react";
import { cn } from "@/lib/utils";

interface PhoneInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const formatPhone = (value: string) => {
  // Remove all non-digit characters
  let digits = value.replace(/\D/g, "");
  // Remove leading 55 if present
  if (digits.startsWith("55") && digits.length > 11) {
    digits = digits.slice(2);
  }
  // Format: (XX) XXXXX-XXXX
  if (digits.length > 2) {
    digits = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length > 10) {
    digits = `${digits.slice(0, 10)}-${digits.slice(10, 14)}`;
  }
  return digits;
};

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ onChange, ...props }, ref) => {
    const [value, setValue] = React.useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPhone(e.target.value);
      setValue(formatted);
      if (onChange) onChange(e);
    };

    return (
      <input
        {...props}
        ref={ref}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        maxLength={15}
        value={value}
        onChange={handleChange}
        placeholder="(11) 98765-4321"
        className={cn(
          "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
          props.className
        )}
      />
    );
  }
);
PhoneInput.displayName = "PhoneInput";
