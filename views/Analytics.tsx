import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import { CATEGORY_COLORS, formatCurrency } from '../constants';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, CartesianGrid } from 'recharts';
import { getSpendingInsights } from '../services/geminiService';
import { Icons } from '../components/Icons';

interface Props {
  expenses: Transaction[];
  currency: string;
}

type TimeRange = 'week' | 'month' | 'year';

const Analytics: React.FC<Props> = ({ expenses: transactions, currency }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState<TimeRange>('week');

  // Filter for ONLY expenses for the analytics view
  const expenses = useMemo(() => transactions.filter(t => t.type === 'expense'), [transactions]);

  // Data for Category Donut
  const categoryData = useMemo(() => Object.entries(
    expenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value: Number(value) })), [expenses]);

  // Data for Area Chart based on Range
  const chartData = useMemo(() => {
    const today = new Date();
    
    if (range === 'week') {
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i)); // Order from oldest to newest
        return d.toISOString().split('T')[0];
      });

      return last7Days.map(dateStr => {
        const d = new Date(dateStr);
        const amount = expenses
          .filter(e => e.date.startsWith(dateStr))
          .reduce((acc, curr) => acc + curr.amount, 0);
        return {
          label: d.toLocaleDateString('en-US', { weekday: 'short' }),
          date: dateStr,
          amount
        };
      });
    }

    if (range === 'month') {
      // Last 30 days grouped
      const days = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        return d.toISOString().split('T')[0];
      });
      return days.map(dateStr => {
        const d = new Date(dateStr);
        const amount = expenses
          .filter(e => e.date.startsWith(dateStr))
          .reduce((acc, curr) => acc + curr.amount, 0);
        return {
          label: d.getDate().toString(), // Just the day number
          date: dateStr,
          amount
        };
      });
    }

    if (range === 'year') {
      const currentYear = today.getFullYear();
      const months = Array.from({ length: 12 }, (_, i) => i);
      return months.map(monthIndex => {
        const amount = expenses
          .filter(e => {
            const d = new Date(e.date);
            return d.getFullYear() === currentYear && d.getMonth() === monthIndex;
          })
          .reduce((acc, curr) => acc + curr.amount, 0);
        return {
          label: new Date(currentYear, monthIndex).toLocaleDateString('en-US', { month: 'short' }),
          amount
        };
      });
    }

    return [];
  }, [expenses, range]);

  const handleGetInsights = async () => {
    setLoading(true);
    const result = await getSpendingInsights(transactions);
    setInsight(result);
    setLoading(false);
  };

  const getRangeLabel = () => {
      switch(range) {
          case 'week': return 'Spending Trend (7 Days)';
          case 'month': return 'Spending Trend (30 Days)';
          case 'year': return 'Spending Trend (Yearly)';
      }
  };

  return (
    <div className="p-6 space-y-8 animate-fade-in pb-24">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Analysis</h1>
      </div>

      {/* Time Range Selector (Apple Style Pills) */}
      <div className="bg-gray-100 p-1 rounded-xl flex relative">
        {(['week', 'month', 'year'] as TimeRange[]).map((r) => (
            <button
                key={r}
                onClick={() => setRange(r)}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg capitalize transition-all z-10 ${
                    range === r ? 'text-slate-900' : 'text-gray-400 hover:text-gray-600'
                }`}
            >
                {r}
            </button>
        ))}
        {/* Animated Background Pill */}
        <div 
            className="absolute top-1 bottom-1 bg-white rounded-lg shadow-sm transition-all duration-300 ease-out"
            style={{
                width: 'calc(33.33% - 8px)',
                left: range === 'week' ? '4px' : range === 'month' ? 'calc(33.33% + 4px)' : 'calc(66.66% + 4px)'
            }}
        />
      </div>

      {/* AI Section */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200">
        <div className="flex items-center gap-2 mb-3">
          <Icons.Sparkles className="w-5 h-5 text-yellow-300" />
          <h2 className="font-bold text-lg">AI Assistant</h2>
        </div>
        
        {!insight ? (
          <div>
            <p className="text-indigo-100 text-sm mb-4">
              Get personalized tips and spending analysis powered by Gemini.
            </p>
            <button 
              onClick={handleGetInsights}
              disabled={loading || expenses.length === 0}
              className="w-full py-3 bg-white/20 backdrop-blur-md rounded-xl text-sm font-semibold hover:bg-white/30 transition-colors flex justify-center items-center gap-2"
            >
              {loading ? (
                <span className="animate-pulse">Analyzing...</span>
              ) : (
                'Analyze My Spending'
              )}
            </button>
          </div>
        ) : (
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-md text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
            <div className="whitespace-pre-line">{insight}</div>
            <button 
              onClick={() => setInsight(null)}
              className="mt-3 text-xs text-indigo-200 hover:text-white underline"
            >
              Close Insights
            </button>
          </div>
        )}
      </div>

      {/* Charts */}
      {expenses.length === 0 ? (
           <div className="text-center py-10">
               <p className="text-gray-400">No expense data to analyze yet.</p>
           </div>
      ) : (
      <div className="space-y-6">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800">{getRangeLabel()}</h3>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                    dataKey="label" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    interval={range === 'month' ? 6 : 0} 
                    padding={{ left: 10, right: 10 }}
                />
                <Tooltip 
                    cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                    formatter={(value: number) => [formatCurrency(value, currency), '']}
                    isAnimationActive={true}
                />
                <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#0ea5e9" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorAmount)" 
                    animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-slate-800 mb-4">Category Breakdown</h3>
          <div className="flex flex-col items-center">
             <div className="h-64 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name as keyof typeof CATEGORY_COLORS] || '#cbd5e1'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                   <div className="text-center">
                     <span className="text-xs font-medium text-gray-400 block">Total</span>
                     <span className="font-bold text-slate-700">
                        {formatCurrency(expenses.reduce((sum, t) => sum + t.amount, 0), currency)}
                     </span>
                   </div>
                </div>
             </div>
             
             {/* Legend */}
             <div className="w-full grid grid-cols-2 gap-3 mt-4">
               {categoryData.map((cat) => (
                 <div key={cat.name} className="flex items-center justify-between text-sm">
                   <div className="flex items-center gap-2">
                     <span className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat.name as keyof typeof CATEGORY_COLORS] || '#cbd5e1' }}></span>
                     <span className="text-gray-600 truncate max-w-[80px]">{cat.name}</span>
                   </div>
                   <span className="font-bold text-slate-700">{formatCurrency(cat.value, currency)}</span>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default Analytics;