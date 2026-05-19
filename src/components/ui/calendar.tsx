"use client";

import { DayPicker, type DayPickerProps } from "react-day-picker";

import "react-day-picker/style.css";

export function Calendar(props: DayPickerProps) {
  return (
    <DayPicker
      {...props}
      classNames={{
        today: "text-rose-700",
        selected: "bg-rose-600 text-white rounded-full",
        day_button: "h-9 w-9 rounded-full text-sm hover:bg-zinc-100",
        chevron: "fill-zinc-700",
        month_caption: "text-sm font-bold text-zinc-950",
        months: "flex flex-col gap-4",
        nav: "flex items-center justify-end gap-2",
      }}
    />
  );
}
