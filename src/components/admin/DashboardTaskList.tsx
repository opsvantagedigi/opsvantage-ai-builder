"use client";

import { useEffect, useMemo, useState } from "react";

type Priority = "high" | "normal";

type DashboardTask = {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
};

type Phase = {
  id: string;
  label: string;
  start: string;
  end: string;
};

const DEFAULT_TASKS: DashboardTask[] = [
  { id: "visual-cockpit-refactor", title: "Visual Cockpit Refactor", completed: true, priority: "normal" },
  { id: "marz-greeting-fix", title: "MARZ Greeting Fix", completed: false, priority: "high" },
  { id: "neural-link-payload-normalization", title: "Neural Link Payload Normalization", completed: true, priority: "normal" },
  { id: "phase-bar-alignment", title: "Phase Bar Alignment", completed: false, priority: "normal" },
];

const PHASES: Phase[] = [
  { id: "phase-1", label: "Phase 1: Visual Lockdown", start: "2026-02-10", end: "2026-02-20" },
  { id: "phase-2", label: "Phase 2: Neural Stability", start: "2026-02-21", end: "2026-03-05" },
  { id: "phase-3", label: "Phase 3: Launch Readiness", start: "2026-03-06", end: "2026-03-20" },
];

export function DashboardTaskList({
  onThought,
  onUrgentStateChange,
  title = "Sovereign TODO List",
}: {
  onThought: (insight: string) => void;
  onUrgentStateChange: (hasUrgentPending: boolean) => void;
  title?: string;
}) {
  const [tasks, setTasks] = useState<DashboardTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadTasks = async () => {
      try {
        const response = await fetch("/api/admin/todos", { cache: "no-store" });
        if (!response.ok) throw new Error("No remote task source");

        const payload = (await response.json()) as DashboardTask[] | { tasks?: DashboardTask[] };
        const remoteTasks = Array.isArray(payload) ? payload : payload.tasks;

        if (active && Array.isArray(remoteTasks) && remoteTasks.length > 0) {
          setTasks(remoteTasks);
          return;
        }
      } catch {
      }

      if (active) {
        setTasks(DEFAULT_TASKS);
      }
    };

    void loadTasks().finally(() => {
      if (active) {
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const urgentPending = useMemo(
    () => tasks.some((task) => task.priority === "high" && !task.completed),
    [tasks]
  );

  useEffect(() => {
    onUrgentStateChange(urgentPending);
  }, [onUrgentStateChange, urgentPending]);

  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        const nextCompleted = !task.completed;
        onThought(nextCompleted ? `> Task Completed: ${task.title}` : `> Task Reopened: ${task.title}`);
        return { ...task, completed: nextCompleted };
      })
    );
  };

  return (
    <section className="rounded-2xl border border-amber-500/30 bg-slate-900/50 backdrop-blur-md p-5 h-full min-h-[300px]">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-amber-200">{title}</h2>
        <span className="text-xs text-slate-500">Real-time Task Tracking</span>
      </div>

      <div className="space-y-2">
        {loading ? (
          <p className="text-sm text-slate-400">Syncing tasks...</p>
        ) : (
          tasks.map((task) => (
            <button
              key={task.id}
              type="button"
              onClick={() => toggleTask(task.id)}
              className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                task.completed
                  ? "border-emerald-500/40 bg-emerald-900/20 text-emerald-300"
                  : task.priority === "high"
                    ? "border-red-500/40 bg-red-950/40 text-red-200"
                    : "border-amber-500/20 bg-slate-900/50 text-slate-200"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className={task.completed ? "line-through opacity-70" : ""}>{task.title}</span>
                <span className="text-[10px] uppercase tracking-[0.12em]">
                  {task.priority === "high" ? "High" : "Normal"}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </section>
  );
}
