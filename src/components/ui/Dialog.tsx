// components/ui/Dialog.tsx
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  title: string;
  description?: string;
}

export function Dialog({
  children,
  open,
  onOpenChange,
  title,
  description = "Dialog content",
}: DialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 transition-opacity" />
        <DialogPrimitive.Content
          className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] w-full max-w-md"
          aria-describedby="dialog-description"
        >
          <DialogPrimitive.Title asChild>
            <VisuallyHidden>{title}</VisuallyHidden>
          </DialogPrimitive.Title>
          <DialogPrimitive.Description asChild>
            <VisuallyHidden id="dialog-description">
              {description}
            </VisuallyHidden>
          </DialogPrimitive.Description>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
