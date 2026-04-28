'use client';

import { useState } from 'react';

interface ChartData {
  name: string;
  value: number;
}

interface ChartWidgetProps {
  title: string;
  data: ChartData[];
  type: 'bar' | 'pie';
}

export function ChartWidget({ title, data, type }: ChartWidgetProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const maxValue = Math.max(...data.map(d => d.value));
  const total = data.reduce((sum, d) => sum + d.value, 0);

  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-green-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-indigo-500',
  ];

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow col-span-1 md:col-span-2 lg:col-span-1">
      <h3 className="text-l font-bold text-foreground mb-4">{title}</h3>
      
      {type === 'bar' && (
        <div className="space-y-3">
          {data.map((item, index) => (
            <div
              key={index}
              className="relative"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="flex items-center justify-between gap-2 w-full">
                <span className="text-foreground/80 text-sm truncate max-w-[500px]">
                  {item.name}
                </span>
                <span className="text-foreground font-semibold">{item.value}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                <div
                  className={`${colors[index % colors.length]} h-full rounded-full transition-all duration-500 ease-out`}
                  style={{
                    width: `${(item.value / maxValue) * 100}%`,
                    transform: hoveredIndex === index ? 'scaleY(1.2)' : 'scaleY(1)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {type === 'pie' && (
        <div className="flex flex-col items-center">
          <div className="relative w-48 h-48 mb-4">
            <svg viewBox="0 0 100 100" className="transform -rotate-90">
              {data.map((item, index) => {
                const percentage = (item.value / total) * 100;
                const previousPercentages = data
                  .slice(0, index)
                  .reduce((sum, d) => sum + (d.value / total) * 100, 0);
                
                const strokeDasharray = `${percentage} ${100 - percentage}`;
                const strokeDashoffset = -previousPercentages;

                return (
                  <circle
                    key={index}
                    cx="50"
                    cy="50"
                    r="15.915"
                    fill="transparent"
                    stroke={`hsl(${(index * 360) / data.length}, 70%, 60%)`}
                    strokeWidth="31.83"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-300 hover:stroke-[35]"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                );
              })}
            </svg>
          </div>
          <div className="space-y-2 w-full">
            {data.map((item, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-2 rounded transition-colors ${
                  hoveredIndex === index ? 'bg-white/20' : 'bg-white/5'
                }`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: `hsl(${(index * 360) / data.length}, 70%, 60%)`,
                    }}
                  />
                  <span className="text-foreground/80 text-sm truncate max-w-[300px]">
                    {item.name}
                  </span>
                </div>
                <span className="text-foreground font-semibold">
                  {item.value} ({((item.value / total) * 100).toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Made with Bob
