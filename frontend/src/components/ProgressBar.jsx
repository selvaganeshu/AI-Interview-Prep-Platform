export default function ProgressBar({ value = 0, max = 100 }) {
  const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  return (
    <div>
      <div className="w-full bg-gray-200 h-4 rounded">
        <div className="bg-green-500 h-4 rounded" style={{ width: `${pct}%` }} />
      </div>
      <div className="text-sm mt-1">{pct}%</div>
    </div>
  );
}
