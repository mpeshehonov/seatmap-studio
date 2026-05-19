"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { type ReactNode } from "react";

type PopoverProps = {
  trigger: ReactNode;
  children: ReactNode;
};

export function Popover({ trigger, children }: PopoverProps) {
  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          className="z-50 rounded-3xl border border-zinc-200 bg-white p-4 shadow-xl"
          sideOffset={8}
        >
          {children}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
