"use client";

import { motion, useReducedMotion } from "motion/react";
import { AnimatedNumber } from "@/components/common/motion";

/** Animated SVG donut showing attendance composition. */
export function AttendanceRing({
  present,
  absent,
  late,
}: {
  present: number;
  absent: number;
  late: number;
}) {
  const reduce = useReducedMotion();
  const total = present + absent + late || 1;
  const rate = (present / total) * 100;

  const R = 52;
  const C = 2 * Math.PI * R;
  const segments = [
    { value: present, color: "var(--success)" },
    { value: late, color: "var(--warning)" },
    { value: absent, color: "var(--destructive)" },
  ];

  let offset = 0;
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative size-40">
        <svg viewBox="0 0 128 128" className="size-full -rotate-90">
          <circle cx="64" cy="64" r={R} fill="none" stroke="var(--muted)" strokeWidth="12" />
          {segments.map((s, i) => {
            const len = (s.value / total) * C;
            const dash = `${len} ${C - len}`;
            const el = (
              <motion.circle
                key={i}
                cx="64"
                cy="64"
                r={R}
                fill="none"
                stroke={s.color}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={dash}
                initial={reduce ? false : { strokeDashoffset: -offset + C }}
                animate={{ strokeDashoffset: -offset }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 * i }}
              />
            );
            offset += len;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-heading text-2xl font-bold tabular-nums">
            <AnimatedNumber value={rate} format={(n) => `${n.toFixed(1)}%`} />
          </span>
          <span className="text-xs text-muted-foreground">present</span>
        </div>
      </div>
      <div className="flex w-full items-center justify-center gap-4 text-xs">
        {[
          { label: "Present", value: present, color: "bg-success" },
          { label: "Late", value: late, color: "bg-warning" },
          { label: "Absent", value: absent, color: "bg-destructive" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className={`size-2.5 rounded-full ${l.color}`} />
            <span className="text-muted-foreground">{l.label}</span>
            <span className="font-semibold tabular-nums">{l.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
