import { minutesToLabel } from "@/lib/hangout";

export function DualRangeSlider({
  min,
  max,
  step = 15,
  start,
  end,
  onChange,
}: {
  min: number;
  max: number;
  step?: number;
  start: number;
  end: number;
  onChange: (start: number, end: number) => void;
}) {
  const startPct = ((start - min) / (max - min)) * 100;
  const endPct = ((end - min) / (max - min)) * 100;

  return (
    <div>
      <div className="dual-range">
        <div className="pointer-events-none absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-muted" />
        <div
          className="pointer-events-none absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-primary"
          style={{ left: `${startPct}%`, width: `${Math.max(0, endPct - startPct)}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={start}
          onChange={(e) => {
            const next = Math.min(Number(e.target.value), end - step);
            onChange(next, end);
          }}
          aria-label="Start time"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={end}
          onChange={(e) => {
            const next = Math.max(Number(e.target.value), start + step);
            onChange(start, next);
          }}
          aria-label="End time"
        />
      </div>
      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>{minutesToLabel(min)}</span>
        <span className="font-medium text-foreground">
          {minutesToLabel(start)} – {minutesToLabel(end)}
        </span>
        <span>{minutesToLabel(max)}</span>
      </div>
    </div>
  );
}
