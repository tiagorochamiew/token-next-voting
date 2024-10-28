// components/forms/GenericNumberInput.tsx

import React from "react";

interface GenericNumberInputProps {
  name: string;
  data: number;
  errors: string | null;
  isProcessing: boolean;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  formatFieldName: (name: string) => string;
}

export function GenericNumberInput({
  name,
  data,
  errors,
  isProcessing,
  handleInputChange,
  formatFieldName,
}: GenericNumberInputProps) {
  const fieldName = formatFieldName(name);
  return (
    <div>
      <label className="block text-sm font-medium text-red-800 mb-1">
        {name}
      </label>
      <input
        className={`w-full p-2 border text-black rounded-lg ${
          errors ? "border-red-500" : "border-gray-300"
        }`}
        name={fieldName}
        type="number"
        min={0}
        value={data || ""}
        onChange={handleInputChange}
        disabled={isProcessing}
        required
      />
      {errors && <p className="mt-1 text-sm text-red-600">{errors}</p>}
    </div>
  );
}
