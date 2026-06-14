import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

const TopicRadarChart = ({ data }) => {
  const fallbackData = [
    { topic: 'Algorithms', level: 58 },
    { topic: 'System Design', level: 68 },
    { topic: 'Behavioral', level: 76 },
    { topic: 'Data Structures', level: 64 },
    { topic: 'Communication', level: 82 },
  ];

  const chartData = data?.length ? data : fallbackData;

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="topic" tick={{ fill: '#94A3B8', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tickCount={5} tick={{ fill: '#94A3B8', fontSize: 12 }} />
          <Radar name="Weakness" dataKey="level" stroke="#EF4444" fill="#EF4444" fillOpacity={0.18} />
          <Tooltip
            contentStyle={{
              background: '#0F172A',
              border: '1px solid #334155',
              borderRadius: 12,
            }}
            labelStyle={{ color: '#F8FAFC' }}
            itemStyle={{ color: '#F8FAFC' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopicRadarChart;
