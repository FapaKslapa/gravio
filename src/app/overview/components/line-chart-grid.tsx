import { formatTick } from "./line-chart-utils";

export function LineChartGrid({
  paddingLeft,
  paddingRight,
  paddingTop,
  chartHeight,
  width,
  maxVal,
  displayCurrency,
}: {
  paddingLeft: number;
  paddingRight: number;
  paddingTop: number;
  chartHeight: number;
  width: number;
  maxVal: number;
  displayCurrency: string;
}) {
  return (
    <>
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
        const y = paddingTop + ratio * chartHeight;
        const val = maxVal * (1 - ratio);
        return (
          <g key={ratio}>
            <line
              x1={paddingLeft}
              y1={y}
              x2={width - paddingRight}
              y2={y}
              stroke="currentColor"
              strokeWidth={1}
              className="text-border"
            />
            <text
              x={paddingLeft - 8}
              y={y + 4}
              textAnchor="end"
              fontSize={11}
              className="fill-muted-foreground tabular"
            >
              {formatTick(val, displayCurrency)}
            </text>
          </g>
        );
      })}
    </>
  );
}
