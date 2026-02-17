"use client";

import { useReportWebVitals } from "next/web-vitals";

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    const name = String(metric.name ?? "");
    if (name !== "CLS" && name !== "LCP") return;

    void fetch("/api/metrics/vitals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        path: typeof window !== "undefined" ? window.location.pathname : undefined,
      }),
      keepalive: true,
    }).catch(() => {
      // best-effort
    });
  });

  return null;
}
