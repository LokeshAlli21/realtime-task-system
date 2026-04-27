import { useState, useCallback, useEffect } from "react";
import taskService from "../services/task.service";

// ─── Constants ────────────────────────────────────────────────────────────────

const ACTIVITY_CONFIG = {
  task_created: {
    icon: "✦",
    classes: "text-emerald-400",
    bg: "bg-emerald-400/10",
    label: "Created",
  },
  task_updated: {
    icon: "↻",
    classes: "text-amber-400",
    bg: "bg-amber-400/10",
    label: "Updated",
  },
  task_deleted: {
    icon: "✕",
    classes: "text-rose-400",
    bg: "bg-rose-400/10",
    label: "Deleted",
  },
};

const TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "task_created", label: "Created" },
  { value: "task_updated", label: "Updated" },
  { value: "task_deleted", label: "Deleted" },
];

const formatRelativeTime = (dateStr) => {
  if (!dateStr) return "";

  // Parse UTC time
  const utcTime = new Date(dateStr).getTime();

  // Add IST offset (5 hours 30 mins)
  const istOffset = (5 * 60 + 30) * 60 * 1000;
  const istTime = utcTime + istOffset;

  const now = Date.now();

  const diff = now - istTime;

  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

// ─── Avatar ───────────────────────────────────────────────────────────────────

const Avatar = ({ name, size = "sm" }) => {
  const initials = name
    ? name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";
  const COLORS = [
    "bg-indigo-500", "bg-violet-500", "bg-cyan-600",
    "bg-pink-500", "bg-amber-500", "bg-emerald-500",
  ];
  const color = COLORS[(name?.charCodeAt(0) ?? 0) % COLORS.length];
  const sz = size === "sm" ? "w-6 h-6 text-[10px]" : "w-8 h-8 text-xs";
  return (
    <span className={`inline-flex items-center justify-center rounded-full font-bold text-white shrink-0 ${color} ${sz}`}>
      {initials}
    </span>
  );
};

// ─── Activity Item ────────────────────────────────────────────────────────────

const ActivityItem = ({ activity }) => {
  const cfg = ACTIVITY_CONFIG[activity.type] ?? ACTIVITY_CONFIG.task_updated;
  const relTime = formatRelativeTime(activity.created_at);

  return (
    <li className="flex items-start gap-3 px-4 py-3 hover:bg-slate-800/50 transition-colors duration-100 group">
      {/* Icon bubble */}
      <span className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${cfg.classes} ${cfg.bg}`}>
        {cfg.icon}
      </span>

      <div className="flex-1 min-w-0">
        {/* Message */}
        <p className="text-xs text-slate-300 leading-snug break-words">
          {activity.message}
        </p>

        {/* Meta row: user + time */}
        <div className="flex items-center gap-2 mt-1.5">
          {activity.user_name && (
            <>
              <Avatar name={activity.user_name} size="sm" />
              <span className="text-[10px] text-slate-500 font-medium">
                {activity.user_name}
              </span>
              <span className="text-slate-700 text-[10px]">·</span>
            </>
          )}
          <span className="text-[10px] text-slate-600">{relTime}</span>

          {/* Type badge */}
          <span className={`ml-auto text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.classes} opacity-0 group-hover:opacity-100 transition-opacity`}>
            {cfg.label}
          </span>
        </div>
      </div>
    </li>
  );
};

// ─── Activity Filters ─────────────────────────────────────────────────────────

const ActivityFilters = ({ filters, setFilters, activities }) => {
  // Derive unique task IDs from loaded activities for the task filter
  const taskOptions = [
    { value: "", label: "All Tasks" },
    ...Array.from(
      new Map(
        activities
          .filter((a) => a.task_id)
          .map((a) => [a.task_id, a])
      ).values()
    ).map((a) => ({
      value: a.task_id,
      // Try to pull the task name from the message, fall back to short ID
      label: (() => {
        const match = a.message.match(/"([^"]+)"/);
        return match ? `"${match[1]}"` : a.task_id.slice(0, 8) + "…";
      })(),
    })),
  ];

  const hasFilters = filters.type || filters.task_id;

  return (
    <div className="px-4 py-3 border-b border-slate-800 space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Type filter */}
        <div className="relative">
          <select
            className="bg-slate-800 border border-slate-700 rounded-lg pl-3 pr-7 py-1.5 text-[11px] text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition appearance-none"
            value={filters.type}
            onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 text-[9px]">▾</span>
        </div>

        {/* Task filter */}
        {taskOptions.length > 1 && (
          <div className="relative">
            <select
              className="bg-slate-800 border border-slate-700 rounded-lg pl-3 pr-7 py-1.5 text-[11px] text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition appearance-none max-w-[140px]"
              value={filters.task_id}
              onChange={(e) => setFilters((f) => ({ ...f, task_id: e.target.value }))}
            >
              {taskOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 text-[9px]">▾</span>
          </div>
        )}

        {/* Clear */}
        {hasFilters && (
          <button
            onClick={() => setFilters({ type: "", task_id: "" })}
            className="text-[11px] text-slate-500 hover:text-rose-400 border border-slate-700 hover:border-rose-800 rounded-lg px-2.5 py-1.5 transition-colors"
          >
            Clear ✕
          </button>
        )}
      </div>

      {/* Active filter chips */}
      {hasFilters && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {filters.type && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${ACTIVITY_CONFIG[filters.type]?.bg ?? "bg-slate-700"} ${ACTIVITY_CONFIG[filters.type]?.classes ?? "text-slate-300"}`}>
              {ACTIVITY_CONFIG[filters.type]?.label ?? filters.type}
            </span>
          )}
          {filters.task_id && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-900/60 text-indigo-300 border border-indigo-800">
              {taskOptions.find((o) => o.value === filters.task_id)?.label ?? filters.task_id.slice(0, 8)}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// ─── ActivityFeed (main export) ───────────────────────────────────────────────

/**
 * Self-contained activity feed panel.
 *
 * Props:
 *   onExternalRefresh  – optional callback called after a refresh
 *                        (use this to let the parent know data changed)
 */
const ActivityFeed = ({ onExternalRefresh }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ type: "", task_id: "" });

  // ── Filtered view (client-side on already-loaded list for task_id,
  //    server-side for type if your API supports it) ────────────────────────
  const visibleActivities = activities.filter((a) => {
    if (filters.type && a.type !== filters.type) return false;
    if (filters.task_id && a.task_id !== filters.task_id) return false;
    return true;
  });

  const loadActivities = useCallback(
    async (serverFilters = {}) => {
      setLoading(true);
      try {
        const res = await taskService.getActivities(serverFilters);
        const data = Array.isArray(res) ? res : res?.activities || [];
        setActivities(data);
        console.log(data);
        
        onExternalRefresh?.();
      } catch (err) {
        console.error("Load activities failed", err);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    },
    [onExternalRefresh]
  );

  // Initial load
  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  // Expose a method so parent can trigger refresh (e.g. after socket events)
  // Pass `refresh` as a prop callback if needed, or use a ref externally.

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Activity
        </h2>
        <button
          onClick={() => loadActivities()}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-400 border border-slate-700 hover:border-indigo-600 rounded-lg px-2.5 py-1 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className={`inline-block transition-transform ${loading ? "animate-spin" : ""}`}>↻</span>
          Refresh
        </button>
      </div>

      {/* Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {/* Filters */}
        <ActivityFilters
          filters={filters}
          setFilters={setFilters}
          activities={activities}
        />

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-12 gap-2 text-slate-600 text-xs">
            <span className="animate-spin inline-block">↻</span>
            Loading…
          </div>
        ) : visibleActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-600 text-xs gap-1">
            <span className="text-2xl text-slate-800">○</span>
            {activities.length === 0 ? "No activity yet." : "No results for current filters."}
          </div>
        ) : (
          <ul className="divide-y divide-slate-800 max-h-80 lg:max-h-[calc(100vh-22rem)] overflow-y-auto">
            {visibleActivities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </ul>
        )}

        {/* Footer count */}
        {visibleActivities.length > 0 && (
          <div className="px-4 py-2 border-t border-slate-800 text-[10px] text-slate-700">
            {visibleActivities.length} event{visibleActivities.length !== 1 ? "s" : ""}
            {visibleActivities.length !== activities.length && ` (of ${activities.length})`}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
export { formatRelativeTime };