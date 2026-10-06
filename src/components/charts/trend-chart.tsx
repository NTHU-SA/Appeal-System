"use client";

import { useEffect, useRef, useState } from "react";

const HEIGHT = 200;
const PAD = { top: 12, right: 12, bottom: 24, left: 28 };

function niceMax(value: number) {
  if (value <= 4) return 4;
  const step = Math.ceil(value / 4);
  return step * 4;
}

// Line chart: a 2px line in the data-1 thin-line step, a 3px dot on the
// last point, border-coloured grid lines and 10px mono axis labels.
export function TrendChart({
  points,
  unit = "件",
}: {
  // Labels are pre-formatted on the server.
  points: { label: string; value: number }[];
  unit?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    // Measure now; the observer only reports on the next rendered frame.
    setWidth(element.getBoundingClientRect().width);
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const max = niceMax(Math.max(0, ...points.map((point) => point.value)));
  const innerWidth = Math.max(0, width - PAD.left - PAD.right);
  const innerHeight = HEIGHT - PAD.top - PAD.bottom;
  const x = (index: number) => PAD.left + (points.length > 1 ? (index / (points.length - 1)) * innerWidth : innerWidth / 2);
  const y = (value: number) => PAD.top + innerHeight - (value / max) * innerHeight;
  const ticks = [0, max / 4, max / 2, (max * 3) / 4, max];
  const labelEvery = Math.max(1, Math.ceil(points.length / Math.max(2, Math.floor(innerWidth / 64))));
  const path = points.map((point, index) => `${index ? "L" : "M"}${x(index)},${y(point.value)}`).join("");
  const last = points.length - 1;
  const active = hover ?? null;

  return (
    <div ref={ref} className="relative w-full" style={{ height: HEIGHT }}>
      {width > 0 ? (
        <svg
          width={width}
          height={HEIGHT}
          role="img"
          aria-label={points.map((point) => `${point.label} ${point.value} ${unit}`).join("，")}
          onMouseLeave={() => setHover(null)}
          onMouseMove={(event) => {
            const box = event.currentTarget.getBoundingClientRect();
            const ratio = (event.clientX - box.left - PAD.left) / Math.max(1, innerWidth);
            setHover(Math.min(last, Math.max(0, Math.round(ratio * last))));
          }}
          className="overflow-visible"
        >
          {ticks.map((tick) => (
            <g key={tick}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(tick)} y2={y(tick)} stroke="var(--border)" />
              <text
                x={PAD.left - 8}
                y={y(tick)}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-text-tertiary font-mono text-[10px]"
              >
                {Number.isInteger(tick) ? tick : ""}
              </text>
            </g>
          ))}
          {points.map((point, index) =>
            // Skip a regular label that would crowd the last one.
            index === last || (index % labelEvery === 0 && last - index >= labelEvery * 0.75) ? (
              <text
                key={`${point.label}-${index}`}
                x={x(index)}
                y={HEIGHT - 6}
                textAnchor={index === 0 ? "start" : index === last ? "end" : "middle"}
                className="fill-text-tertiary font-mono text-[10px]"
              >
                {point.label}
              </text>
            ) : null,
          )}
          {active !== null ? (
            <line x1={x(active)} x2={x(active)} y1={PAD.top} y2={PAD.top + innerHeight} stroke="var(--border)" />
          ) : null}
          <path d={path} fill="none" stroke="var(--data-1-line)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          <circle cx={x(last)} cy={y(points[last]?.value ?? 0)} r={3} fill="var(--data-1-line)" />
          {active !== null && active !== last ? (
            <circle cx={x(active)} cy={y(points[active].value)} r={3} fill="var(--data-1-line)" />
          ) : null}
        </svg>
      ) : null}
      {active !== null && width > 0 ? (
        <div
          className="pointer-events-none absolute z-10 rounded-sm border bg-surface px-3 py-2 text-body-sm shadow-level-1"
          style={{
            left: Math.min(Math.max(x(active) - 60, 0), width - 120),
            top: Math.max(y(points[active].value) - 64, 0),
            width: 120,
          }}
        >
          <p className="text-caption text-text-tertiary">{points[active].label}</p>
          <p className="font-medium text-text-primary tabular-nums">
            {points[active].value} {unit}
          </p>
        </div>
      ) : null}
    </div>
  );
}
