import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const PriceChart = ({ historyData }) => {
  const [timeframe, setTimeframe] = useState(90); // 7, 30, or 90 days

  // Color palette for each store
  const storeColors = {
    Amazon: '#f59e0b',          // Amber
    Flipkart: '#3b82f6',         // Blue
    Myntra: '#ec4899',           // Pink
    Ajio: '#6366f1',             // Indigo
    Croma: '#10b981',            // Emerald
    'Reliance Digital': '#ef4444',// Red
    Nykaa: '#f43f5e',            // Rose
    Meesho: '#8b5cf6',           // Violet
    Default: '#94a3b8'           // Slate
  };

  // 1. Process history data into unified charts format
  const chartData = useMemo(() => {
    if (!historyData || historyData.length === 0) return [];
    
    // Group all price points by date
    const dateMap = {};
    
    historyData.forEach((storeRecord) => {
      const storeName = storeRecord.storeName;
      
      // Limit to timeframe
      const historyList = storeRecord.history || [];
      const slicedList = historyList.slice(-timeframe);
      
      slicedList.forEach((point) => {
        const rawDate = new Date(point.date);
        // Format as DD/MM
        const formattedDate = rawDate.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short'
        });
        
        if (!dateMap[formattedDate]) {
          dateMap[formattedDate] = { 
            dateLabel: formattedDate,
            rawTime: rawDate.getTime()
          };
        }
        
        dateMap[formattedDate][storeName] = point.price;
      });
    });

    // Convert map to sorted array
    const sorted = Object.values(dateMap).sort((a, b) => a.rawTime - b.rawTime);
    
    // Downsample data points for 30/90 days to prevent bar chart clutter for a clean UX
    let step = 1;
    if (timeframe === 90) step = 10;
    else if (timeframe === 30) step = 4;
    
    return sorted.filter((_, idx) => idx % step === 0);
  }, [historyData, timeframe]);

  // 2. Extract list of unique stores in dataset
  const stores = useMemo(() => {
    if (!historyData) return [];
    return historyData.map((d) => d.storeName);
  }, [historyData]);

  // 3. Find global min/max price for YAxis bounds
  const yAxisDomain = useMemo(() => {
    if (chartData.length === 0) return [0, 100];
    
    let min = Infinity;
    let max = -Infinity;
    
    chartData.forEach((d) => {
      stores.forEach((store) => {
        const val = d[store];
        if (val !== undefined) {
          if (val < min) min = val;
          if (val > max) max = val;
        }
      });
    });
    
    // Padding
    const pad = (max - min) * 0.1 || 500;
    return [Math.max(0, Math.round(min - pad)), Math.round(max + pad)];
  }, [chartData, stores]);

  if (!historyData || historyData.length === 0) {
    return (
      <div className="py-12 text-center text-slate-400">
        No price history records available.
      </div>
    );
  }

  // Custom Tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md p-4 shadow-xl text-left">
          <p className="text-xs font-bold text-slate-400 mb-2">{label}</p>
          <div className="space-y-1.5">
            {payload.map((item) => (
              <div key={item.name} className="flex items-center gap-6 justify-between text-xs">
                <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-extrabold text-slate-900 dark:text-white">
                  ₹{item.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Timeframe selector header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          Price History & Trends
          <span className="text-xs font-medium text-slate-400">(Auto-tracked)</span>
        </h3>
        
        <div className="flex rounded-full bg-slate-100 dark:bg-slate-850 p-1 text-xs">
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => setTimeframe(days)}
              className={`px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
                timeframe === days
                  ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {days === 7 ? '1 Week' : days === 30 ? '1 Month' : '3 Months'}
            </button>
          ))}
        </div>
      </div>

      {/* Chart container */}
      <div className="h-72 w-full pr-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.08)" />
            <XAxis 
              dataKey="dateLabel" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
              dy={10}
            />
            <YAxis 
              domain={yAxisDomain}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`}
              tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
              dx={-5}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, paddingTop: 15, fontWeight: 600 }}
            />
            {stores.map((store) => (
              <Bar
                key={store}
                dataKey={store}
                name={store}
                fill={storeColors[store] || storeColors.Default}
                radius={[3, 3, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PriceChart;
