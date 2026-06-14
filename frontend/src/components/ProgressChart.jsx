import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const ProgressChart = ({ data }) => {
  const fallbackData = [
    { week: 'Mon', progress: 68, practice: 20 },
    { week: 'Tue', progress: 72, practice: 30 },
    { week: 'Wed', progress: 80, practice: 42 },
    { week: 'Thu', progress: 76, practice: 35 },
    { week: 'Fri', progress: 82, practice: 50 },
    { week: 'Sat', progress: 88, practice: 65 },
    { week: 'Sun', progress: 93, practice: 72 },
  ];

  const chartData = data?.length ? data : fallbackData;

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0.08} />
            </linearGradient>
            <linearGradient id="practiceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#10B981" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} domain={[0, 100]} />
          <Tooltip
            contentStyle={{
              background: '#0F172A',
              border: '1px solid #334155',
              borderRadius: 12,
            }}
            labelStyle={{ color: '#F8FAFC' }}
            itemStyle={{ color: '#F8FAFC' }}
          />
          <Area type="monotone" dataKey="progress" stroke="#6366F1" strokeWidth={3} fill="url(#progressGradient)" />
          <Area type="monotone" dataKey="practice" stroke="#10B981" strokeWidth={3} fill="url(#practiceGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProgressChart;
