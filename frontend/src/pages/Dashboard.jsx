import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import TaskService from "../services/task.service";
import SocketService from "../services/socket.service";

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

const Dashboard = () => {
  const { tasks, setTasks } = useContext(AppContext);
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setTasks([]);
    SocketService.disconnect();
    window.location.href = "/login";
  };

  const handleLogActivities = () => {
    navigate("/log-activities");
  };

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const res = await TaskService.getTasks();
        const data = Array.isArray(res) ? res : res?.tasks || [];
        setTasks(data);
      } catch (err) {
        console.error("Load tasks failed", err);
        setTasks([]);
      }
    };
    loadTasks();
  }, [setTasks]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    SocketService.connect(token);

    SocketService.onTaskCreated(({ task }) => {
      setTasks((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        return [task, ...safePrev];
      });
    });

    SocketService.onTaskUpdated(({ task }) => {
      setTasks((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        return safePrev.map((t) => (t.id === task.id ? task : t));
      });
    });

    SocketService.onTaskDeleted(({ taskId }) => {
      setTasks((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        return safePrev.filter((t) => t.id !== taskId);
      });
    });

    return () => {
      SocketService.offTaskEvents();
    };
  }, [setTasks]);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setIsCreating(true);
    try {
      await TaskService.createTask({ title, description, status: "todo" });
      setTitle("");
      setDescription("");
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
      {/* Header */}
      <header className="border-b border-slate-800 px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Task Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {safeTasks.length} task{safeTasks.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 text-xs text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </span>
          <button
            onClick={handleLogActivities}
            className="text-xs font-medium text-slate-400 hover:text-indigo-400 border border-slate-700 hover:border-indigo-600 rounded-lg px-3 py-1.5 transition-colors duration-150"
          >
            Log Activities
          </button>
          <button
            onClick={handleLogout}
            className="text-xs font-medium text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-700 rounded-lg px-3 py-1.5 transition-colors duration-150"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="px-8 py-8 max-w-5xl mx-auto space-y-10">
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
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">
            Tasks
          </h2>

          {safeTasks.length === 0 ? (
            <div className="text-center py-16 text-slate-600 text-sm">
              No tasks yet. Create one above.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                <div key={status} className="space-y-3">
                  {/* Column header */}
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

                  {/* Cards */}
                  <div className="space-y-2 min-h-16">
                    {grouped[status].map((task) => (
                      <div
                        key={task.id}
                        className="bg-slate-900 border border-slate-800 rounded-xl p-4 group hover:border-slate-700 transition-colors duration-150"
                      >
                        <h4 className="text-sm font-semibold text-slate-100 mb-1 leading-snug">
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                          {config.nextLabel && (
                            <button
                              onClick={() => handleUpdate(task)}
                              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                            >
                              {config.nextLabel}
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(task.id)}
                            className="text-xs text-slate-600 hover:text-rose-400 font-medium transition-colors ml-auto"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
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
    </div>
  );
};

export default Dashboard;