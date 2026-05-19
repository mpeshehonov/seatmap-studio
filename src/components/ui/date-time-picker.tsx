"use client";

import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { Calendar } from "./calendar";
import { Popover } from "./popover";

type DateTimePickerProps = {
  name: string;
  defaultTime?: string;
};

export function DateTimePicker({
  name,
  defaultTime = "19:00",
}: DateTimePickerProps) {
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState(defaultTime);
  const value = useMemo(() => {
    if (!date) {
      return "";
    }

    return `${format(date, "yyyy-MM-dd")}T${time}`;
  }, [date, time]);

  return (
    <div className="grid gap-2">
      <input name={name} type="hidden" value={value} />
      <div className="grid gap-2 sm:grid-cols-[1fr_8rem]">
        <Popover
          trigger={
            <button
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-left text-sm text-zinc-800 outline-none hover:border-rose-300"
              type="button"
            >
              <CalendarIcon size={16} />
              {date ? (
                format(date, "d MMMM yyyy", { locale: ru })
              ) : (
                <span className="text-zinc-400">Дата события</span>
              )}
            </button>
          }
        >
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
          />
        </Popover>
        <input
          className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-rose-500"
          type="time"
          value={time}
          onChange={(event) => setTime(event.target.value)}
        />
      </div>
    </div>
  );
}
