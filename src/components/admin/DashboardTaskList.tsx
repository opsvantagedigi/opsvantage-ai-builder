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

function getCurrentPhaseLabel(now: Date) {
  const current = PHASES.find((phase) => {
    const start = new Date(`${phase.start}T00:00:00Z`).getTime();
    const end = new Date(`${phase.end}T23:59:59Z`).getTime();
    const target = now.getTime();
    return target >= start && target <= end;
  });

  return current?.label ?? "Phase Tracking";
}

export function DashboardTaskList({
  onThought,
  onUrgentStateChange,
}: {
  onThought: (insight: string) => void;
  onUrgentStateChange: (hasUrgentPending: boolean) => void;
}) {
  const [tasks, setTasks] = useState<DashboardTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [today] = useState(() => new Date());

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

  const currentPhase = useMemo(() => getCurrentPhaseLabel(today), [today]);

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
    <section className="rounded-2xl border border-amber-500/30 bg-black/70 p-5 h-full min-h-[400px]">
      <div className="mb-4 rounded-lg border border-amber-500/20 bg-slate-900/60 px-3 py-2">
        <p className="text-[10px] uppercase tracking-[0.18em] text-amber-300/80">Calendar Strip</p>
        <p className="mt-1 text-sm font-semibold text-amber-200">{currentPhase}</p>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div className="h-full w-1/3 rounded-full bg-amber-300 shadow-[0_0_14px_rgba(251,191,36,0.9)]" />
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-amber-200">Sovereign TODO</h2>
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
