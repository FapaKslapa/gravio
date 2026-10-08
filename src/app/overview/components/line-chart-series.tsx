import {
  generateAreaPath,
  generateLinePath,
  type MonthData,
} from "./line-chart-utils";

type Point = { x: number; y: number };

export function LineChartSeries({
  months,
  incomePoints,
  expensePoints,
  width,
  height,
  paddingLeft,
  chartWidth,
  labelStep,
  hoveredIndex,
}: {
  months: MonthData[];
  incomePoints: Point[];
  expensePoints: Point[];
  width: number;
  height: number;
  paddingLeft: number;
  chartWidth: number;
  labelStep: number;
  hoveredIndex: number | null;
}) {
  const dots = (
    points: { x: number; y: number }[],
    prefix: string,
    color: string,
  ) =>
    points.map((p, idx) => (
      <g key={`${prefix}-${months[idx].label}`}>
        <circle
          cx={p.x}
          cy={p.y}
          r={hoveredIndex === idx ? 5 : 3}
          fill={color}
          stroke="var(--card)"
          strokeWidth={hoveredIndex === idx ? 3 : 1.5}
          className="transition-[r,stroke-width] duration-150"
        />
      </g>
    ));

  return (
    <>
      <path
        d={generateAreaPath(incomePoints, width)}
        fill="url(#incomeGrad)"
        stroke="none"
      />
      <path
        d={generateAreaPath(expensePoints, width)}
        fill="url(#expenseGrad)"
        stroke="none"
      />

      <path
        d={generateLinePath(incomePoints)}
        fill="none"
        stroke="var(--income)"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={generateLinePath(expensePoints)}
        fill="none"
        stroke="var(--expense)"
        strokeWidth={2.5}
        strokeDasharray="6 4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {dots(incomePoints, "inc-dot", "var(--income)")}
      {dots(expensePoints, "exp-dot", "var(--expense)")}

      {months.map((m, index) => {
        const x = paddingLeft + (index * chartWidth) / (months.length - 1);
        const skip = index % labelStep !== 0;
        if (skip) return null;
        return (
          <text
            key={m.label}
            x={x}
            y={height - 6}
            textAnchor="middle"
            fontSize={11}
            className="fill-muted-foreground"
          >
            {m.label}
          </text>
        );
      })}
    </>
  );
}
