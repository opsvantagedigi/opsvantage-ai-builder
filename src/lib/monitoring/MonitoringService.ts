import { MetricServiceClient } from "@google-cloud/monitoring";

type SaturationReading = {
  service: string;
  cpuPercent: number | null;
  gpuPercent: number | null;
  sampledAt: string;
};

type LatencyMap = {
  appToNeuralMs: number | null;
  usToNeuralMs: number | null;
  target: string;
  sampledAt: string;
};

type UptimePulse = {
  availabilityPercent: number;
  successfulRequests: number;
  totalRequests: number;
  sampledAt: string;
};

export type SlaSnapshot = {
  uptime: UptimePulse;
  latency: LatencyMap;
  saturation: SaturationReading[];
};

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function avg(values: number[]): number | null {
  if (values.length === 0) return null;
  const total = values.reduce((sum, value) => sum + value, 0);
  return Number((total / values.length).toFixed(2));
}

export class MonitoringService {
  private readonly projectId: string;
  private readonly metricClient: MetricServiceClient;

  constructor(projectId = process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || "opsvantage-ai-builder") {
    this.projectId = projectId;
    this.metricClient = new MetricServiceClient();
  }

  private async queryTimeSeries(filter: string, minutes = 15) {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - minutes * 60 * 1000);
    const name = this.metricClient.projectPath(this.projectId);

    const [series] = await this.metricClient.listTimeSeries({
      name,
      filter,
      interval: {
        startTime: { seconds: Math.floor(startDate.getTime() / 1000) },
        endTime: { seconds: Math.floor(endDate.getTime() / 1000) },
      },
      view: "FULL",
    });

    return series;
  }

  private async sumMetric(filter: string, minutes = 15): Promise<number> {
    try {
      const series = await this.queryTimeSeries(filter, minutes);
      let sum = 0;

      for (const row of series) {
        for (const point of row.points ?? []) {
          const value = point.value;
          const numeric =
            toNumber(value?.doubleValue) ??
            toNumber(value?.int64Value) ??
            toNumber(value?.distributionValue?.mean);

          if (numeric !== null) {
            sum += numeric;
          }
        }
      }

      return Number(sum.toFixed(2));
    } catch {
      return 0;
    }
  }

  private async avgMetric(filter: string, minutes = 15): Promise<number | null> {
    try {
      const series = await this.queryTimeSeries(filter, minutes);
      const readings: number[] = [];

      for (const row of series) {
        for (const point of row.points ?? []) {
          const value = point.value;
          const numeric =
            toNumber(value?.doubleValue) ??
            toNumber(value?.int64Value) ??
            toNumber(value?.distributionValue?.mean);
          if (numeric !== null) {
            readings.push(numeric);
          }
        }
      }

      return avg(readings);
    } catch {
      return null;
    }
  }

  async getUptimePulse(serviceName: string): Promise<UptimePulse> {
    const baseFilter = `resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"${serviceName}\"`;
    const totalRequests = await this.sumMetric(`metric.type=\"run.googleapis.com/request_count\" AND ${baseFilter}`);
    const errorRequests = await this.sumMetric(
      `metric.type=\"run.googleapis.com/request_count\" AND metric.labels.response_code_class=\"5xx\" AND ${baseFilter}`
    );

    const successfulRequests = Math.max(0, totalRequests - errorRequests);
    const availabilityPercent =
      totalRequests > 0 ? Number(((successfulRequests / totalRequests) * 100).toFixed(3)) : 100;

    return {
      availabilityPercent,
      successfulRequests,
      totalRequests,
      sampledAt: new Date().toISOString(),
    };
  }

  async getNeuralLatencyMap(appBaseUrl: string): Promise<LatencyMap> {
    const localDiagnosticUrl = `${appBaseUrl.replace(/\/$/, "")}/api/diagnostics/neural-cross-region-latency?ts=${Date.now()}`;
    const usProbeUrl = process.env.SLA_US_TO_EU_DIAGNOSTIC_URL?.trim();

    const appProbe = await fetch(localDiagnosticUrl, { cache: "no-store" })
      .then((response) => response.json())
      .catch(() => null) as { elapsedMs?: number; target?: string } | null;

    let usToNeuralMs: number | null = null;
    if (usProbeUrl) {
      usToNeuralMs = await fetch(`${usProbeUrl}?ts=${Date.now()}`, { cache: "no-store" })
        .then((response) => response.json())
        .then((payload: { elapsedMs?: number }) => toNumber(payload.elapsedMs))
        .catch(() => null);
    }

    return {
      appToNeuralMs: toNumber(appProbe?.elapsedMs),
      usToNeuralMs,
      target: String(appProbe?.target ?? "unknown"),
      sampledAt: new Date().toISOString(),
    };
  }

  async getResourceSaturation(serviceNames: string[]): Promise<SaturationReading[]> {
    const output: SaturationReading[] = [];

    for (const serviceName of serviceNames) {
      const baseFilter = `resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"${serviceName}\"`;

      const cpuRatio = await this.avgMetric(`metric.type=\"run.googleapis.com/container/cpu/utilizations\" AND ${baseFilter}`);

      const gpuRatio =
        await this.avgMetric(`metric.type=\"run.googleapis.com/container/gpu/utilizations\" AND ${baseFilter}`) ??
        await this.avgMetric(`metric.type=\"run.googleapis.com/container/accelerator/duty_cycle\" AND ${baseFilter}`);

      output.push({
        service: serviceName,
        cpuPercent: cpuRatio === null ? null : Number((cpuRatio * 100).toFixed(2)),
        gpuPercent: gpuRatio === null ? null : Number((gpuRatio * 100).toFixed(2)),
        sampledAt: new Date().toISOString(),
      });
    }

    return output;
  }

  async getSlaSnapshot(appBaseUrl: string): Promise<SlaSnapshot> {
    const frontendService = process.env.SLA_FRONTEND_SERVICE || "opsvantage-ai-builder";
    const neuralService = process.env.SLA_NEURAL_SERVICE || "marz-neural-core";

    const [uptime, latency, saturation] = await Promise.all([
      this.getUptimePulse(frontendService),
      this.getNeuralLatencyMap(appBaseUrl),
      this.getResourceSaturation([frontendService, neuralService]),
    ]);

    return {
      uptime,
      latency,
      saturation,
    };
  }
}
