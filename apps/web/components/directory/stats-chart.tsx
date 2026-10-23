/** 30-day profile-view bars. Pure CSS (no chart library); values are exposed to assistive tech via the list. */
export function StatsChart({ days }: { days: { date: string; count: number }[] }) {
  const max = Math.max(1, ...days.map((d) => d.count));
  return (
    <div>
      <ul className="flex h-32 items-end gap-[3px]" aria-label="Profile views per day, last 30 days">
        {days.map((d) => (
          <li key={d.date} className="flex h-full flex-1 items-end" title={`${d.date}: ${d.count} view${d.count === 1 ? "" : "s"}`}>
            <span
              className="block w-full bg-brand-600"
              style={{ height: `${Math.max(d.count ? 6 : 2, (d.count / max) * 100)}%`, opacity: d.count ? 1 : 0.25 }}
            />
            <span className="sr-only">
              {d.date}: {d.count}
            </span>
          </li>
        ))}
      </ul>
      <div className="t-eyebrow mt-2 flex justify-between text-[10px] text-current/55">
        <span>{days[0]?.date}</span>
        <span>{days[days.length - 1]?.date}</span>
      </div>
    </div>
  );
}
