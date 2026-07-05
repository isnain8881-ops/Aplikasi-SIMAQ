import React, { useState } from "react";

interface BarChartProps {
  data: { label: string; value: number }[];
  title?: string;
  color?: string;
  isDarkMode?: boolean;
}

export const SneatBarChart: React.FC<BarChartProps> = ({
  data,
  title = "Statistik",
  color = "#696cff", // Sneat Purple
  isDarkMode = false
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxVal = Math.max(...data.map(d => d.value), 10);
  const chartHeight = 180;
  const paddingBottom = 25;
  const paddingTop = 10;
  const barContainerWidth = 100 / data.length;

  return (
    <div className="w-full">
      {title && <h6 className="text-sm font-medium mb-3 text-gray-500 uppercase tracking-wider">{title}</h6>}
      <div className="relative h-[200px] w-full flex items-end border-b border-gray-200 dark:border-gray-700 pb-2">
        {data.map((item, idx) => {
          const heightPercent = (item.value / maxVal) * (chartHeight - paddingTop);
          const isHovered = hoveredIdx === idx;

          return (
            <div 
              key={idx} 
              style={{ width: `${barContainerWidth}%` }} 
              className="flex flex-col items-center group relative cursor-pointer"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Tooltip */}
              {isHovered && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded shadow-lg z-10 whitespace-nowrap">
                  {item.label}: <span className="font-bold">{item.value}</span>
                </div>
              )}

              {/* Bar */}
              <div 
                className="w-1/2 rounded-t-md transition-all duration-300 relative"
                style={{ 
                  height: `${heightPercent}px`, 
                  backgroundColor: color,
                  opacity: isHovered ? 1 : 0.85,
                  boxShadow: isHovered ? `0 4px 12px ${color}66` : "none"
                }}
              />

              {/* Label */}
              <span className="text-[10px] mt-2 font-mono truncate max-w-full text-gray-500 dark:text-gray-400">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface LineChartProps {
  data: { label: string; value: number }[];
  title?: string;
  color?: string;
  isDarkMode?: boolean;
}

export const SneatLineChart: React.FC<LineChartProps> = ({
  data,
  title = "Kehadiran Siswa",
  color = "#8592a3", // Sneat Grey
  isDarkMode = false
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxVal = Math.max(...data.map(d => d.value), 10);
  const chartHeight = 150;
  const chartWidth = 500;
  const padding = 20;

  // Generate points
  const points = data.map((item, idx) => {
    const x = padding + (idx * (chartWidth - padding * 2)) / (data.length - 1 || 1);
    const y = chartHeight - padding - (item.value / maxVal) * (chartHeight - padding * 2);
    return { x, y, item, idx };
  });

  const pathD = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  const areaD = points.length > 0 
    ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`
    : "";

  return (
    <div className="w-full">
      {title && <h6 className="text-sm font-medium mb-3 text-gray-500 uppercase tracking-wider">{title}</h6>}
      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-[180px] overflow-visible">
          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="#888" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.2" />
          <line x1={padding} y1={chartHeight / 2} x2={chartWidth - padding} y2={chartHeight / 2} stroke="#888" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.2" />
          <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#888" strokeWidth="0.5" opacity="0.4" />

          {/* Area under the line */}
          {areaD && (
            <path
              d={areaD}
              fill={`url(#line-area-grad-${color.replace("#", "")})`}
              className="transition-all duration-500"
            />
          )}

          {/* Gradient definition */}
          <defs>
            <linearGradient id={`line-area-grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Line */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke={color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-500"
            />
          )}

          {/* Interactive dots */}
          {points.map((p, idx) => (
            <g key={idx}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIdx === idx ? "6" : "4"}
                fill={color}
                stroke={isDarkMode ? "#2b2c40" : "#fff"}
                strokeWidth="2"
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
              {/* Text label at the bottom */}
              <text
                x={p.x}
                y={chartHeight - 3}
                textAnchor="middle"
                fill="#888"
                fontSize="9"
                className="font-mono"
              >
                {p.item.label}
              </text>

              {/* Tooltip card inside SVG */}
              {hoveredIdx === idx && (
                <g>
                  <rect
                    x={p.x - 35}
                    y={p.y - 30}
                    width="70"
                    height="20"
                    rx="3"
                    fill="#1e1e2f"
                    filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.3))"
                  />
                  <text
                    x={p.x}
                    y={p.y - 16}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="9"
                    fontWeight="bold"
                  >
                    {p.item.value}% Hadir
                  </text>
                </g>
              )}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  title?: string;
}

export const SneatDonutChart: React.FC<DonutChartProps> = ({
  data,
  title = "Penyebaran"
}) => {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  let accumulatedAngle = 0;

  const size = 160;
  const radius = 50;
  const strokeWidth = 14;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center">
      {title && <h6 className="text-sm font-medium mb-4 text-gray-500 uppercase tracking-wider">{title}</h6>}
      
      <div className="flex items-center gap-6 flex-wrap justify-center">
        {/* SVG Donut */}
        <div className="relative w-[160px] h-[160px]">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="#e1e4e8"
              strokeWidth={strokeWidth}
              className="dark:stroke-gray-700"
            />
            {data.map((item, idx) => {
              if (item.value === 0) return null;
              const percentage = (item.value / (total || 1)) * 100;
              const strokeLength = (percentage / 100) * circumference;
              const strokeOffset = circumference - (accumulatedAngle / 100) * circumference;
              accumulatedAngle += percentage;

              return (
                <circle
                  key={idx}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${strokeLength} ${circumference}`}
                  strokeDashoffset={strokeOffset}
                  transform={`rotate(-90 ${center} ${center})`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold font-sans">{total}</span>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">Siswa</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2">
          {data.map((item, idx) => {
            const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;
            return (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-gray-600 dark:text-gray-300 font-medium">{item.label}</span>
                <span className="text-gray-400 font-mono">({item.value} - {percent}%)</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
