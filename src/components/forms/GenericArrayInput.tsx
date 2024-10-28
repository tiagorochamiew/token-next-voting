// components/forms/GenericArrayInput.tsx
import { Button } from "@/components/ui/Button";

interface GenericArrayInputProps {
  name: string;
  values: (string | number)[];
  error?: string;
  isProcessing?: boolean;
  isNumber?: boolean;
  onChange: (newValues: (string | number)[]) => void;
}

export function GenericArrayInput({
  name,
  values = [],
  error,
  isProcessing,
  isNumber = false,
  onChange,
}: GenericArrayInputProps) {
  const handleAddItem = () => {
    onChange([...values, isNumber ? 0 : ""]);
  };

  const handleRemoveItem = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, value: string) => {
    const newValues = [...values];
    newValues[index] = isNumber ? Number(value) : value;
    onChange(newValues);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-red-800 mb-1">
        {name}
      </label>
      <div className="space-y-2">
        {values.map((value, index) => (
          <div key={index} className="flex gap-2">
            <input
              className={`flex-1 p-2 border text-black rounded-lg ${
                error ? "border-red-500" : "border-gray-300"
              }`}
              type={isNumber ? "number" : "text"}
              value={value}
              onChange={(e) => handleItemChange(index, e.target.value)}
              disabled={isProcessing}
              required
            />
            <Button
              type="button"
              onClick={() => handleRemoveItem(index)}
              variant="secondary"
              className="px-2 py-1 text-red-600"
            >
              Remove
            </Button>
          </div>
        ))}
        <Button
          type="button"
          onClick={handleAddItem}
          variant="secondary"
          className="w-full text-blue-600"
        >
          Add {name}
        </Button>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
