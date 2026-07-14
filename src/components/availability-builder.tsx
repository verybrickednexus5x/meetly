import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { formatDate, minutesToLabel, timeStringToMinutes, type Slot } from "@/lib/hangout";

function todayIso(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function dateToIso(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isoToDate(iso: string) {
  return new Date(`${iso}T00:00:00`);
}

function DateWindowRow({
  date,
  windows,
  onAdd,
  onRemove,
}: {
  date: string;
  windows: Slot[];
  onAdd: (start: number, end: number) => void;
  onRemove: (index: number) => void;
}) {
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");

  const add = () => {
    const startMin = timeStringToMinutes(start);
    const endMin = timeStringToMinutes(end);
    if (startMin === null || endMin === null || endMin <= startMin) return;
    onAdd(startMin, endMin);
  };

  return (
    <div className="rounded-xl border bg-background p-3">
      <div className="text-sm font-medium">{formatDate(date)}</div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input
          type="time"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="rounded-md border bg-background px-2 py-1 text-sm"
        />
        <span className="text-xs text-muted-foreground">to</span>
        <input
          type="time"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="rounded-md border bg-background px-2 py-1 text-sm"
        />
        <Button type="button" size="sm" variant="secondary" onClick={add}>
          <Plus className="mr-1 h-3.5 w-3.5" />
          Add
        </Button>
      </div>
      {windows.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {windows.map((w, i) => (
            <button
              key={`${w.start}-${w.end}-${i}`}
              type="button"
              onClick={() => onRemove(i)}
              className="inline-flex items-center gap-1 rounded-full border bg-card px-2.5 py-1 text-xs transition hover:bg-muted"
            >
              {minutesToLabel(w.start)} – {minutesToLabel(w.end)}
              <X className="h-3 w-3" />
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">
          No time windows added for this date yet.
        </p>
      )}
    </div>
  );
}

/**
 * Lets someone pick any number of dates, then add any number of arbitrary
 * start/end time windows for each date — used both by the creator (to set
 * their own availability for a flexible event) and by guests responding.
 */
export function AvailabilityBuilder({
  windows,
  onChange,
}: {
  windows: Slot[];
  onChange: (windows: Slot[]) => void;
}) {
  // The calendar is the source of truth for which dates are visible; windows
  // are keyed off it. Seed from any windows passed in (e.g. editing a saved response).
  const [calendarDates, setCalendarDates] = useState<string[]>(() =>
    Array.from(new Set(windows.map((w) => w.date))).sort((a, b) => a.localeCompare(b)),
  );

  const visibleDates = useMemo(
    () =>
      Array.from(new Set([...calendarDates, ...windows.map((w) => w.date)])).sort((a, b) =>
        a.localeCompare(b),
      ),
    [calendarDates, windows],
  );

  const handleCalendarSelect = (selection: Date[] | undefined) => {
    const dates = (selection ?? []).map(dateToIso).sort((a, b) => a.localeCompare(b));
    setCalendarDates(dates);
    const keep = new Set(dates);
    onChange(windows.filter((w) => keep.has(w.date)));
  };

  return (
    <div className="space-y-3">
      <div>
        <Label>Which dates work? ({visibleDates.length} selected)</Label>
        <p className="mt-1 text-xs text-muted-foreground">
          Pick dates on the calendar, then add one or more time windows for each — as many as you
          want.
        </p>
        <Calendar
          mode="multiple"
          selected={calendarDates.map(isoToDate)}
          onSelect={handleCalendarSelect}
          disabled={{ before: isoToDate(todayIso(0)) }}
          className="mt-2 rounded-lg border bg-card"
        />
      </div>

      {visibleDates.length > 0 ? (
        <div className="space-y-2">
          {visibleDates.map((date) => (
            <DateWindowRow
              key={date}
              date={date}
              windows={windows.filter((w) => w.date === date)}
              onAdd={(start, end) => onChange([...windows, { date, start, end }])}
              onRemove={(index) => {
                const dateWindows = windows.filter((w) => w.date === date);
                const target = dateWindows[index];
                onChange(windows.filter((w) => w !== target));
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
