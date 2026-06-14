const StatCard = ({ title, value, footnote, icon, trend }) => (
  <div className="group rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-600">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{title}</p>
        <p className="mt-4 text-3xl font-semibold text-slate-900">{value}</p>
      </div>
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-50 text-xl text-indigo-600">
          {icon}
        </div>
      )}
    </div>

    <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
      <span>{footnote}</span>
      {trend && (
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${trend.up ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
          {trend.up ? '▲' : '▼'} {trend.label}
        </span>
      )}
    </div>

    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
      <div
        className={`h-full rounded-full ${trend?.up ? 'bg-gradient-to-r from-indigo-500 to-indigo-600' : 'bg-gradient-to-r from-amber-400 to-rose-500'}`}
        style={{ width: trend?.value || '64%' }}
      />
    </div>
  </div>
);

export default StatCard;
