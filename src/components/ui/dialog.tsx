"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import { type ReactNode } from "react";

type DialogProps = {
  title: string;
  description?: string;
  trigger: ReactNode;
  children: ReactNode;
};

export function Dialog({
  title,
  description,
  trigger,
  children,
}: DialogProps) {
  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-zinc-950/50" />
        <DialogPrimitive.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-4xl bg-white p-6 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogPrimitive.Title className="text-2xl font-bold text-zinc-950">
                {title}
              </DialogPrimitive.Title>
              {description ? (
                <DialogPrimitive.Description className="mt-2 text-sm leading-6 text-zinc-500">
                  {description}
                </DialogPrimitive.Description>
              ) : null}
            </div>
            <DialogPrimitive.Close className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-zinc-100 text-zinc-600 hover:bg-zinc-200">
              <XIcon size={18} />
              <span className="sr-only">Закрыть</span>
            </DialogPrimitive.Close>
          </div>
          <div className="mt-6">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
