// components/ui/ActionMenu.tsx
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreVertical } from "lucide-react";

interface ActionItem {
  label: string;
  onClick: () => void;
  variant?: "default" | "destructive";
}

interface ActionMenuProps {
  items: ActionItem[];
}

export function ActionMenu({ items }: ActionMenuProps) {
  if (items.length === 0) return null;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="p-2 bg-gray-400 hover:bg-gray-200 rounded-full transition-colors">
          <MoreVertical className="h-5 w-5 text-black" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[160px] bg-gray-500 rounded-md shadow-lg p-1 z-50"
          sideOffset={5}
        >
          {items.map((item, index) => (
            <DropdownMenu.Item
              key={index}
              onClick={item.onClick}
              className={`
                px-3 py-2 text-sm text-white outline-none cursor-pointer hover:text-black
                ${
                  item.variant === "destructive"
                    ? "text-red-600 hover:bg-red-50"
                    : "text-gray-700 hover:bg-gray-100"
                }
                rounded-sm transition-colors
              `}
            >
              {item.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
