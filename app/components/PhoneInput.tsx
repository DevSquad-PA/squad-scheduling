import React from "react";

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
      />
    );
  }
);
PhoneInput.displayName = "PhoneInput";
