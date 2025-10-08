"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Tooltip as RechartsTooltip } from 'recharts';

export type ChartConfig = Record<
  string,
  {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    color?: string; // hex/hsl or CSS var
    theme?: { light: string; dark: string };
  }
>;

type ChartContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  config: ChartConfig;
};

export function ChartContainer({ config, className, style, ...props }: ChartContainerProps) {
  // Expose '--color-<key>' CSS variables for consumers
  const cssVars = Object.entries(config).reduce<React.CSSProperties>((acc, [key, conf]) => {
    const varName = `--color-${key}` as const;
    const light = conf?.theme?.light ?? conf?.color;
    (acc as any)[varName] = light ?? "#10B981"; // default emerald-500
    return acc;
  }, {} as React.CSSProperties);

  return (
    <div
      data-chart
      className={cn("[--chart-padding:theme(spacing.4)]", className)}
      style={{ ...(style || {}), ...cssVars }}
      {...props}
    />
  );
}

export type ChartTooltipPayload = {
  name: string;
  value: number;
  color?: string;
};

export function ChartTooltipContent({
  active,
  payload,
  label,
  valueFormatter,
  indicator,
}: {
  active?: boolean;
  payload?: ChartTooltipPayload[] | any;
  label?: string | number;
  valueFormatter?: (n: number) => string;
  indicator?: 'line' | 'dot' | 'none';
}) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0];
  const color = p?.fill || p?.color || "var(--color-total, #10B981)";
  const value = typeof p?.value === "number" ? p.value : Number(p?.value);
  const formatted = Number.isFinite(value) ? (valueFormatter ? valueFormatter(value) : String(value)) : "-";
  return (
    <div className="rounded-lg border bg-popover text-popover-foreground shadow-sm px-3 py-2 text-xs">
      {label ? <div className="mb-1 font-medium">{label}</div> : null}
      <div className="flex items-center gap-2">
        {indicator !== 'none' && (
          <span className="inline-block size-2 rounded-sm" style={{ backgroundColor: color }} />
        )}
        <span className="text-muted-foreground">{p?.name || "Total"}</span>
        <span className="ml-auto font-medium">{formatted}</span>
      </div>
    </div>
  );
}

// Thin wrapper so consumers can write <ChartTooltip ... /> like in shadcn examples
export function ChartTooltip(props: any) {
  return <RechartsTooltip {...props} />;
}

// Small util mirroring shadcn/tailwind utils location
// If project does not have lib/utils, provide a fallback cn
// but keep import above; actual project includes it.
