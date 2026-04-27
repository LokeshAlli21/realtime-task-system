import { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import TaskService from "../services/task.service";
import SocketService from "../services/socket.service";
import taskService from "../services/task.service";
import authService from "../services/auth.service";

const STATUS_CONFIG = {
  todo: {
    label: "To Do",
    classes: "bg-slate-700 text-slate-300 border border-slate-600",
    next: "in_progress",
    nextLabel: "Start Task →",
  },
  in_progress: {
    label: "In Progress",
    classes: "bg-amber-900/60 text-amber-300 border border-amber-700",
    next: "done",
    nextLabel: "Mark Done ✓",
  },
  done: {
    label: "Done",
    classes: "bg-emerald-900/60 text-emerald-300 border border-emerald-700",
    next: null,
    nextLabel: null,
  },
};

const ACTIVITY_CONFIG = {
  task_created: {
    icon: "✦",
    classes: "text-emerald-400",
    dotClass: "bg-emerald-400",
  },
  task_updated: {
    icon: "↻",
    classes: "text-amber-400",
    dotClass: "bg-amber-400",
  },
  task_deleted: {
    icon: "✕",
    classes: "text-rose-400",
    dotClass: "bg-rose-400",
  },
};

const formatRelativeTime = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

// Avatar initials component
const Avatar = ({ name, size = "sm" }) => {
  const initials = name
    ? name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";
  const colors = [
    "bg-indigo-500",
    "bg-violet-500",
    "bg-cyan-600",
    "bg-pink-500",
    "bg-amber-500",
    "bg-emerald-500",
  ];
  const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;
  const sizeClass = size === "sm" ? "w-6 h-6 text-[10px]" : "w-8 h-8 text-xs";
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-bold text-white shrink-0 ${colors[colorIndex]} ${sizeClass}`}
    >
      {initials}
    </span>
  );
};

// Edit Task Modal
const EditTaskModal = ({ task, users, currentUser, onClose, onSave }) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [status, setStatus] = useState(task.status);
  const [assignedTo, setAssignedTo] = useState(task.assigned_to || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onSave(task.id, {
        title,
        description,
        status,
        assigned_to: assignedTo || null,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest">
            Edit Task
          </h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 text-lg leading-none transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Title</label>
            <input
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Description
            </label>
            <textarea
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">Status</label>
            <select
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Assigned To
            </label>
            <select
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            >
              <option value="">— Unassigned —</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} {u.id === currentUser?.id ? "(you)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 text-sm text-slate-400 border border-slate-700 hover:border-slate-600 rounded-lg py-2.5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || saving}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg py-2.5 transition-colors"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Task Card
const TaskCard = ({ task, users, currentUser, onUpdate, onDelete, onEdit }) => {
  const config = STATUS_CONFIG[task.status];
  const assignedUser = users.find((u) => u.id === task.assigned_to);
  const createdByUser = users.find((u) => u.id === task.created_by);

  const isOwner = currentUser?.id === task.created_by;
  const isAssignee = currentUser?.id === task.assigned_to;
  // Only owner or assignee can advance status; only owner can edit/delete
  const canAdvanceStatus = config.nextLabel && (isOwner || isAssignee);
  const canEdit = isOwner;
  const canDelete = isOwner;

  // Label for assignee: "assigned to you" if it's the current user
  const assigneeLabel =
    assignedUser?.id === currentUser?.id ? "you" : assignedUser?.name;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 group hover:border-slate-700 transition-colors duration-150">
      <h4 className="text-sm font-semibold text-slate-100 mb-1 leading-snug">
        {task.title}
      </h4>
      {task.description && (
        <p className="text-xs text-slate-500 mb-3 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Assignee / Creator row */}
      <div className="space-y-1.5 mb-3">
        {assignedUser ? (
          <div className="flex items-center gap-2">
            <Avatar name={assignedUser.name} size="sm" />
            <span className="text-xs text-slate-400">
              <span className="text-slate-600">assigned to </span>
              {assigneeLabel === "you" ? (
                <span className="text-indigo-400 font-medium">you</span>
              ) : (
                assigneeLabel
              )}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full border border-dashed border-slate-700 inline-flex items-center justify-center text-slate-600 text-[10px]">
              ?
            </span>
            <span className="text-xs text-slate-600">Unassigned</span>
          </div>
        )}
        {createdByUser && (
          <div className="flex items-center gap-2">
            <Avatar name={createdByUser.name} size="sm" />
            <span className="text-xs text-slate-600">
              by{" "}
              {createdByUser.id === currentUser?.id ? (
                <span className="text-slate-500">you</span>
              ) : (
                createdByUser.name
              )}
            </span>
          </div>
        )}
      </div>

      {/* Actions row */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
        {canAdvanceStatus && (
          <button
            onClick={() => onUpdate(task)}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            {config.nextLabel}
          </button>
        )}
        <div className="ml-auto flex items-center gap-2">
          {canEdit && (
            <button
              onClick={() => onEdit(task)}
              className="text-xs text-slate-500 hover:text-amber-400 font-medium transition-colors"
            >
              Edit
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete(task.id)}
              className="text-xs text-slate-600 hover:text-rose-400 font-medium transition-colors"
            >
              Delete
            </button>
          )}
          {!canEdit && !canDelete && (
            <span className="text-xs text-slate-700 italic">View only</span>
          )}
        </div>
      </div>
    </div>
  );
};

// Filter Bar
const FilterBar = ({ filters, setFilters, users }) => {
  const handleChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Status filter */}
      <div className="relative">
        <select
          className="bg-slate-800 border border-slate-700 rounded-lg pl-3 pr-8 py-2 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition appearance-none"
          value={filters.status}
          onChange={(e) => handleChange("status", e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-[10px]">
          ▾
        </span>
      </div>

      {/* Assigned To filter */}
      <div className="relative">
        <select
          className="bg-slate-800 border border-slate-700 rounded-lg pl-3 pr-8 py-2 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition appearance-none"
          value={filters.assigned_to}
          onChange={(e) => handleChange("assigned_to", e.target.value)}
        >
          <option value="">All Assignees</option>
          <option value="unassigned">Unassigned</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-[10px]">
          ▾
        </span>
      </div>

      {/* Clear filters */}
      {(filters.status || filters.assigned_to) && (
        <button
          onClick={() => setFilters({ status: "", assigned_to: "" })}
          className="text-xs text-slate-500 hover:text-rose-400 border border-slate-700 hover:border-rose-800 rounded-lg px-3 py-2 transition-colors"
        >
          Clear ✕
        </button>
      )}

      {/* Active filter indicators */}
      {filters.status && (
        <span className={`text-xs px-2.5 py-1 rounded-full ${STATUS_CONFIG[filters.status]?.classes}`}>
          {STATUS_CONFIG[filters.status]?.label}
        </span>
      )}
      {filters.assigned_to && filters.assigned_to !== "unassigned" && (
        <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-900/60 text-indigo-300 border border-indigo-800">
          {users.find((u) => u.id === filters.assigned_to)?.name ?? ""}
        </span>
      )}
      {filters.assigned_to === "unassigned" && (
        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-700 text-slate-400 border border-slate-600">
          Unassigned
        </span>
      )}
    </div>
  );
};

const Dashboard = () => {
  const { tasks, setTasks } = useContext(AppContext);
  const { user } = useContext(AppContext);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [filters, setFilters] = useState({ status: "", assigned_to: "" });

  const handleLogout = () => {
    localStorage.removeItem("token");
    setTasks([]);
    SocketService.disconnect();
    window.location.href = "/login";
  };

  const loadUsers = useCallback(async () => {
    try {
      const data = await authService.getAllUsers();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadActivities = useCallback(async () => {
    setActivitiesLoading(true);
    try {
      const res = await taskService.getActivities();
      const data = Array.isArray(res) ? res : res?.activities || [];
      setActivities(data);
    } catch (error) {
      console.error("Load activities failed", error);
      setActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  }, []);

  const loadTasks = useCallback(
    async (activeFilters = {}) => {
      // Strip empty values so the service doesn't send blank query params
      const cleanFilters = Object.fromEntries(
        Object.entries(activeFilters).filter(([, v]) => v !== "")
      );
      try {
        const res = await TaskService.getTasks(cleanFilters);
        const data = Array.isArray(res) ? res : res?.tasks || [];
        setTasks(data);
        console.log(data);
        
      } catch (err) {
        console.error("Load tasks failed", err);
        setTasks([]);
      }
    },
    [setTasks]
  );

  // Re-fetch whenever filters change
  useEffect(() => {
    loadTasks(filters);
  }, [filters, loadTasks]);

  useEffect(() => {
    loadActivities();
    loadUsers();
  }, [loadActivities, loadUsers]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    SocketService.connect(token);
    SocketService.onTaskCreated(({ task }) => {
      setTasks((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        return [task, ...safePrev];
      });
      loadActivities();
    });
    SocketService.onTaskUpdated(({ task }) => {
      setTasks((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        return safePrev.map((t) => (t.id === task.id ? task : t));
      });
      loadActivities();
    });
    SocketService.onTaskDeleted(({ taskId }) => {
      setTasks((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        return safePrev.filter((t) => t.id !== taskId);
      });
      loadActivities();
    });
    return () => {
      SocketService.offTaskEvents();
    };
  }, [setTasks, loadActivities]);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setIsCreating(true);
    try {
      await TaskService.createTask({
        title,
        description,
        status: "todo",
        assigned_to: assignedTo || null,
      });
      setTitle("");
      setDescription("");
      setAssignedTo("");
    } catch (err) {
      console.error("Create failed", err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (task) => {
    const next = STATUS_CONFIG[task.status]?.next;
    if (!next) return;
    try {
      await TaskService.updateTask(task.id, { status: next });
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const handleEditSave = async (taskId, data) => {
    try {
      await TaskService.updateTask(taskId, data);
    } catch (err) {
      console.error("Edit save failed", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await TaskService.deleteTask(id);
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const grouped = {
    todo: safeTasks.filter((t) => t.status === "todo"),
    in_progress: safeTasks.filter((t) => t.status === "in_progress"),
    done: safeTasks.filter((t) => t.status === "done"),
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-mono">
      {/* Edit Modal */}
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          users={users}
          currentUser={user}
          onClose={() => setEditingTask(null)}
          onSave={handleEditSave}
        />
      )}

      {/* Header */}
      <header className="border-b border-slate-800 px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Task Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {safeTasks.length} task{safeTasks.length !== 1 ? "s" : ""} total
            {user?.name && (
              <span className="ml-2 text-slate-600">· {user.name}</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 text-xs text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </span>
          <button
            onClick={handleLogout}
            className="text-xs font-medium text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-700 rounded-lg px-3 py-1.5 transition-colors duration-150"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main: two-column split */}
      <div className="flex gap-6 px-8 py-8 max-w-7xl mx-auto">
        {/* LEFT — Tasks */}
        <main className="flex-1 min-w-0 space-y-8">
          {/* Create Task */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">
              New Task
            </h2>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <input
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="Task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
              <input
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />

              {/* Assign To dropdown */}
              <div className="relative">
                <select
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition appearance-none"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                >
                  <option value="">— Assign to (optional) —</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} {u.id === user?.id ? "(you)" : ""}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
                  ▾
                </span>
              </div>

              {/* Assigned user preview */}
              {assignedTo && (
                <div className="flex items-center gap-2 px-1">
                  <Avatar
                    name={users.find((u) => u.id === assignedTo)?.name}
                    size="sm"
                  />
                  <span className="text-xs text-slate-400">
                    Assigning to{" "}
                    <span className="text-slate-200">
                      {users.find((u) => u.id === assignedTo)?.name}
                    </span>
                  </span>
                </div>
              )}

              <button
                onClick={handleCreate}
                disabled={!title.trim() || isCreating}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors duration-150"
              >
                {isCreating ? "Creating..." : "+ Create Task"}
              </button>
            </div>
          </section>

          {/* Task Columns */}
          <section>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Tasks
              </h2>
              <FilterBar
                filters={filters}
                setFilters={setFilters}
                users={users}
              />
            </div>

            {safeTasks.length === 0 ? (
              <div className="text-center py-16 text-slate-600 text-sm">
                {filters.status || filters.assigned_to
                  ? "No tasks match the current filters."
                  : "No tasks yet. Create one above."}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                  <div key={status} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${config.classes}`}
                      >
                        {config.label}
                      </span>
                      <span className="text-xs text-slate-600">
                        {grouped[status].length}
                      </span>
                    </div>
                    <div className="space-y-2 min-h-16">
                      {grouped[status].map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          users={users}
                          currentUser={user}
                          onUpdate={handleUpdate}
                          onDelete={handleDelete}
                          onEdit={setEditingTask}
                        />
                      ))}
                      {grouped[status].length === 0 && (
                        <div className="border border-dashed border-slate-800 rounded-xl h-16 flex items-center justify-center">
                          <span className="text-xs text-slate-700">Empty</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>

        {/* RIGHT — Activity Feed */}
        <aside className="w-72 shrink-0">
          <div className="sticky top-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Activity
              </h2>
              <button
                onClick={loadActivities}
                disabled={activitiesLoading}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-400 border border-slate-700 hover:border-indigo-600 rounded-lg px-2.5 py-1 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span
                  className={`inline-block ${activitiesLoading ? "animate-spin" : ""}`}
                >
                  ↻
                </span>
                Refresh
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              {activitiesLoading ? (
                <div className="flex items-center justify-center py-12 text-slate-600 text-xs">
                  Loading...
                </div>
              ) : activities.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-slate-600 text-xs">
                  No activity yet.
                </div>
              ) : (
                <ul className="divide-y divide-slate-800 max-h-[calc(100vh-12rem)] overflow-y-auto">
                  {activities.map((activity) => {
                    const cfg =
                      ACTIVITY_CONFIG[activity.type] ||
                      ACTIVITY_CONFIG.task_updated;
                    return (
                      <li
                        key={activity.id}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-slate-800/50 transition-colors duration-100"
                      >
                        <span
                          className={`mt-0.5 text-base leading-none font-bold ${cfg.classes}`}
                        >
                          {cfg.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-300 leading-snug truncate">
                            {activity.message}
                          </p>
                          <p className="text-xs text-slate-600 mt-0.5">
                            {formatRelativeTime(activity.created_at)}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Team Members */}
            {users.length > 0 && (
              <div className="mt-6">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
                  Team
                </h2>
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                  <ul className="divide-y divide-slate-800">
                    {users.map((u) => {
                      const assignedCount = safeTasks.filter(
                        (t) => t.assigned_to === u.id && t.status !== "done"
                      ).length;
                      return (
                        <li
                          key={u.id}
                          className="flex items-center gap-3 px-4 py-3"
                        >
                          <Avatar name={u.name} size="md" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-200 truncate">
                              {u.name}
                              {u.id === user?.id && (
                                <span className="ml-1.5 text-[10px] text-indigo-400">
                                  you
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-slate-600 truncate">
                              {u.email}
                            </p>
                          </div>
                          {assignedCount > 0 && (
                            <span className="text-[10px] font-semibold bg-indigo-900/60 text-indigo-300 border border-indigo-800 rounded-full px-2 py-0.5">
                              {assignedCount}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;