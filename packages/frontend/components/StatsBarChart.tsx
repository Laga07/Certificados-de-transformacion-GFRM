"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const AXIS_COLOR = "#8a8168";
const GRID_COLOR = "#e3d9bd";
const FOREST = "#3c6e47";
const GOLD = "#c9a227";

export interface StatsBarChartDatum {
  categoria: string;
  valor: number;
}

export function StatsBarChart({
  data,
  valueLabel,
  accent = "forest",
}: {
  data: StatsBarChartDatum[];
  valueLabel: string;
  accent?: "forest" | "gold";
}) {
  if (data.length === 0) {
    return <p className="text-sm text-neutral-500">Sin datos todavía.</p>;
  }

  const barColor = accent === "gold" ? GOLD : FOREST;

  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={GRID_COLOR} vertical={false} />
          <XAxis
            dataKey="categoria"
            stroke={AXIS_COLOR}
            tick={{ fill: AXIS_COLOR, fontSize: 12 }}
            axisLine={{ stroke: AXIS_COLOR }}
            tickLine={false}
          />
          <YAxis
            stroke={AXIS_COLOR}
            tick={{ fill: AXIS_COLOR, fontSize: 12 }}
            axisLine={{ stroke: AXIS_COLOR }}
            tickLine={false}
            width={48}
          />
          <Tooltip
            cursor={{ fill: "rgba(27,94,63,0.06)" }}
            contentStyle={{
              background: "#faf6ea",
              border: "1px solid #e3d9bd",
              borderRadius: 4,
              fontSize: 12,
            }}
            labelStyle={{ color: "#1e2f22" }}
            formatter={(value) => [Number(value).toLocaleString("es-CR"), valueLabel]}
          />
          <Bar dataKey="valor" fill={barColor} radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
