"use client";

import Link from "next/link";
import React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import MentorLog from "@/components/admin/MentorLog";

type Thought = {
  category: string;
  insight: string;
  createdAt?: string;
};

type Telemetry = {
  generatedAt: string;
  sovereign25SlotsRemaining: number;
  openProviderStatus: "green" | "red";
  marzThoughts: Thought[];
};

type ImpactReport = {
  totals?: {
    totalSavingsUsd?: number;
  };
};

type JournalEntry = {
  category: string;
  insight: string;
  createdAt?: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function NeuralDashboardClient({
  initialThoughts,
  initialJournal,
}: {
  initialThoughts: Thought[];
  initialJournal: JournalEntry[];
}) {
  const pinnedWelcomeThought = "[WELCOME NOTE] Legacy of 2026: March 10, 2026 is our Dream Fulfillment Event. We build with grace, protect human dignity, and serve the less fortunate with resilient infrastructure.";
  const [mounted, setMounted] = React.useState(false);
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
  const [thoughts, setThoughts] = useState<Thought[]>(initialThoughts);
  const [nzdSaved, setNzdSaved] = useState(0);
  const [loading, setLoading] = useState(true);
  const [switchOpen, setSwitchOpen] = useState(false);
  const [confirmCode, setConfirmCode] = useState("");
  const [globalLaunchActive, setGlobalLaunchActive] = useState(false);
  const [switchBusy, setSwitchBusy] = useState(false);
  const [neuralLinkActive, setNeuralLinkActive] = useState(false);
  const [neuralLinkBusy, setNeuralLinkBusy] = useState(false);
  const [neuralLinkError, setNeuralLinkError] = useState<string | null>(null);
  const [neuralSpeech, setNeuralSpeech] = useState("Idle. MARZ awaiting Neural Link activation.");
  const [voiceModelLabel, setVoiceModelLabel] = useState("NZ-Aria");
  const [welcomePinned, setWelcomePinned] = useState(true);
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const marzCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const marzImageRef = useRef<HTMLImageElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const telemetrySnapshotRef = useRef<string>("");
  const thoughtsSnapshotRef = useRef<string>(JSON.stringify(initialThoughts));
  const impactSnapshotRef = useRef<number>(0);
  const launchSnapshotRef = useRef<boolean>(false);
  const hasRedirectedRef = useRef(false);
  const hasEstablishedNeuralLinkRef = useRef(false);

  React.useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;

    let isActive = true;

    const loadTelemetry = async () => {
      try {
        const response = await fetch("/api/admin/telemetry", { cache: "no-store" });
        if (response.status === 401 && !hasRedirectedRef.current) {
          const authProbe = await fetch("/api/admin/impact-report", { cache: "no-store" });
          if (authProbe.status === 401) {
            hasRedirectedRef.current = true;
            window.location.replace("/sovereign-access");
            return;
          }
        }

        if (!response.ok) return;
        const payload = (await response.json()) as Telemetry;
        if (!isActive) return;
        const telemetrySnapshot = JSON.stringify(payload);
        if (telemetrySnapshotRef.current !== telemetrySnapshot) {
          telemetrySnapshotRef.current = telemetrySnapshot;
          setTelemetry(payload);
        }

        const thoughtsSnapshot = JSON.stringify(payload.marzThoughts);
        if (thoughtsSnapshotRef.current !== thoughtsSnapshot) {
          thoughtsSnapshotRef.current = thoughtsSnapshot;
          setThoughts(payload.marzThoughts);
        }

        const impactResponse = await fetch("/api/admin/impact-report", { cache: "no-store" });
        if (impactResponse.ok) {
          const impactPayload = (await impactResponse.json()) as ImpactReport;
          const usd = impactPayload?.totals?.totalSavingsUsd ?? 0;
          const nzd = usd * 1.62;
          const rounded = Number(nzd.toFixed(2));
          if (impactSnapshotRef.current !== rounded) {
            impactSnapshotRef.current = rounded;
            setNzdSaved(rounded);
          }
        }

        const switchResponse = await fetch("/api/admin/kill-switch", { cache: "no-store" });
        if (switchResponse.ok) {
          const switchPayload = (await switchResponse.json()) as { globalLaunchActive?: boolean };
          const nextLaunchState = Boolean(switchPayload.globalLaunchActive);
          if (launchSnapshotRef.current !== nextLaunchState) {
            launchSnapshotRef.current = nextLaunchState;
            setGlobalLaunchActive(nextLaunchState);
          }
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    void loadTelemetry();
    const interval = setInterval(() => {
      void loadTelemetry();
    }, 15000);

    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;

    let cancelled = false;

    const seedDirective = async () => {
      try {
        const response = await fetch("/api/marz/seed-memory", {
          method: "POST",
          cache: "no-store",
        });

        if (!response.ok || cancelled) {
          return;
        }
      } catch {
      }
    };

    void seedDirective();

    return () => {
      cancelled = true;
    };
  }, [mounted]);

  const thoughtLines = useMemo(() => {
    const computedLines = (thoughts ?? []).slice(0, 50).map((thought, index) => {
      const timestamp = thought.createdAt
        ? new Date(thought.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : `T+${index + 1}`;
      const normalizedCategory = (thought.category || "STRATEGY").toUpperCase();
      return `[${timestamp}] [${normalizedCategory}] ${thought.insight}`;
    });

    if (welcomePinned) {
      return [pinnedWelcomeThought, ...computedLines];
    }

    return computedLines;
  }, [pinnedWelcomeThought, thoughts, welcomePinned]);

  const drawMarzFrame = React.useCallback((mouthIntensity: number) => {
    const canvas = marzCanvasRef.current;
    const image = marzImageRef.current;
    if (!canvas || !image) return;

    const context = canvas.getContext("2d");
    if (!context) return;
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    const width = canvas.width;
    const height = canvas.height;

    context.clearRect(0, 0, width, height);

    // Calculate the aspect ratio to properly fit the image
    const imageAspect = image.naturalWidth / image.naturalHeight;
    const canvasAspect = width / height;

    let drawWidth = width;
    let drawHeight = height;
    let offsetX = 0;
    let offsetY = 0;

    // Scale the image to cover the canvas while maintaining aspect ratio
    if (imageAspect > canvasAspect) {
      drawHeight = height;
      drawWidth = height * imageAspect;
      offsetX = (width - drawWidth) / 2;
    } else {
      drawWidth = width;
      drawHeight = width / imageAspect;
      offsetY = (height - drawHeight) / 2;
    }

    context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

    // Calculate mouth position relative to the drawn image, not the full canvas
    const clamped = Math.max(0, Math.min(1, mouthIntensity));
    const mouthHeight = (6 + clamped * 28) * (drawHeight / image.naturalHeight); // Scale with image
    const mouthWidth = (36 + clamped * 8) * (drawWidth / image.naturalWidth); // Scale with image
    const mouthX = offsetX + drawWidth * 0.5; // Center horizontally in the drawn image
    const mouthY = offsetY + drawHeight * 0.655; // Position vertically in the drawn image

    context.save();
    context.fillStyle = "rgba(15, 23, 42, 0.72)";
    context.beginPath();
    context.ellipse(mouthX, mouthY, mouthWidth, mouthHeight, 0, 0, Math.PI * 2);
    context.fill();

    context.strokeStyle = "rgba(251, 191, 36, 0.55)";
    context.lineWidth = 2 * (drawWidth / image.naturalWidth); // Scale stroke width with image
    context.beginPath();
    context.ellipse(mouthX, mouthY, mouthWidth, mouthHeight, 0, 0, Math.PI * 2);
    context.stroke();
    context.restore();
  }, []);

  const stopLipSync = React.useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.onended = null;
      audioElementRef.current = null;
    }

    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.disconnect();
      } catch {
      }
      audioSourceRef.current = null;
    }

    if (analyserRef.current) {
      try {
        analyserRef.current.disconnect();
      } catch {
      }
      analyserRef.current = null;
    }

    if (audioContextRef.current) {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }

    setNeuralLinkActive(false);
    drawMarzFrame(0);
  }, [drawMarzFrame]);

  const playNeuralSpeech = React.useCallback(
    async (audioBytes: Uint8Array) => {
      stopLipSync();

      // Create a copy of the buffer to ensure compatibility
      const copy = new Uint8Array(audioBytes.length);
      copy.set(audioBytes);
      const audioBlob = new Blob([copy], { type: "audio/mpeg" });
      const objectUrl = URL.createObjectURL(audioBlob);
      audioUrlRef.current = objectUrl;

      const audioElement = new Audio(objectUrl);
      audioElementRef.current = audioElement;

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.7;

      const source = audioContext.createMediaElementSource(audioElement);
      source.connect(analyser);
      analyser.connect(audioContext.destination);

      audioContextRef.current = audioContext;
      audioSourceRef.current = source;
      analyserRef.current = analyser;

      const frequencyData = new Uint8Array(analyser.frequencyBinCount);
      const renderFrame = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(frequencyData);
        const average = frequencyData.reduce((sum, current) => sum + current, 0) / frequencyData.length;
        const mouthIntensity = Math.min(1, average / 90);
        drawMarzFrame(mouthIntensity);

        if (audioElementRef.current && !audioElementRef.current.paused && !audioElementRef.current.ended) {
          animationFrameRef.current = requestAnimationFrame(renderFrame);
        }
      };

      audioElement.onended = () => {
        stopLipSync();
      };

      setNeuralLinkActive(true);
      await audioElement.play();
      animationFrameRef.current = requestAnimationFrame(renderFrame);
    },
    [drawMarzFrame, stopLipSync]
  );

  const activateNeuralLink = React.useCallback(async () => {
    setNeuralLinkBusy(true);
    setNeuralLinkError(null);

    try {
      const isFirstLink = !hasEstablishedNeuralLinkRef.current;
      const inputText = thoughtLines[0];
      const promptSeed = thoughtLines[0]
        ? `Using this latest neural thought, speak a grounded update: ${thoughtLines[0]}`
        : "Provide a grounded operational update for today.";

      const response = await fetch("/api/marz/neural-link", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          gen_text: String(inputText || "Neural Link Established."),
          prompt: promptSeed,
          firstLink: isFirstLink,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string; details?: string } | null;
        throw new Error(payload?.details || payload?.error || "Neural Link activation failed.");
      }

      const engine = response.headers.get("x-marz-engine");
      const speechHeader = response.headers.get("x-marz-text");
      const audioBuffer = await response.arrayBuffer();

      hasEstablishedNeuralLinkRef.current = true;
      setVoiceModelLabel(engine === "alltalk" ? "AllTalk" : engine === "edge-tts" ? "Edge-TTS" : "Hybrid");
      if (speechHeader) {
        setNeuralSpeech(decodeURIComponent(speechHeader));
      }
      await playNeuralSpeech(new Uint8Array(audioBuffer));
    } catch (error) {
      setNeuralLinkActive(false);
      setNeuralLinkError(error instanceof Error ? error.message : String(error));
      drawMarzFrame(0);
    } finally {
      setNeuralLinkBusy(false);
    }
  }, [drawMarzFrame, neuralSpeech, playNeuralSpeech, thoughtLines]);

  const handleKillSwitch = async () => {
    setSwitchBusy(true);
    try {
      const response = await fetch("/api/admin/kill-switch", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          globalLaunchActive: !globalLaunchActive,
          confirmCode,
        }),
      });

      if (!response.ok) return;
      const payload = (await response.json()) as { globalLaunchActive?: boolean };
      setGlobalLaunchActive(Boolean(payload.globalLaunchActive));
      setSwitchOpen(false);
      setConfirmCode("");
    } finally {
      setSwitchBusy(false);
    }
  };

  useEffect(() => {
    if (!mounted) return;
    if (!terminalRef.current) return;
    terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [mounted, thoughtLines]);

  useEffect(() => {
    if (!mounted) return;
    const canvas = marzCanvasRef.current;
    if (!canvas) return;

    // Set initial canvas dimensions
    canvas.width = 900;
    canvas.height = 1200;

    const image = new Image();
    image.src = "/MARZ_Headshot.png";
    image.crossOrigin = "anonymous"; // Enable CORS for the image
    image.loading = "eager";
    (image as HTMLImageElement & { fetchPriority?: "high" | "low" | "auto" }).fetchPriority = "high";
    image.onload = () => {
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      marzImageRef.current = image;
      drawMarzFrame(0);
    };
    
    image.onerror = () => {
      console.error("Failed to load MARZ headshot image");
    };
  }, [drawMarzFrame, mounted]);

  useEffect(() => {
    return () => {
      stopLipSync();
    };
  }, [stopLipSync]);

  if (!mounted) return <div className="min-h-screen bg-black" />;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-amber-500/20 pb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-amber-300/80">Zenith Command Center</p>
            <h1 className="mt-2 text-3xl font-semibold text-amber-200">Neural Thought Dashboard</h1>
            <p className="mt-2 text-sm text-slate-400">Fortune-grade oversight for sovereign infrastructure operations.</p>
          </div>
          <Link
            href="/services"
            className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-sm font-medium text-amber-200 transition hover:bg-amber-400/20"
          >
            View Public Services
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-amber-500/30 bg-slate-900/70 p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Sovereign 25</p>
            <p className="mt-2 text-3xl font-bold text-cyan-300 animate-pulse">
              {loading ? "--" : telemetry?.sovereign25SlotsRemaining ?? 0}
            </p>
            <p className="mt-1 text-sm text-slate-400">Slots Remaining</p>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-slate-900/70 p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Economic Impact</p>
            <p className="mt-2 text-3xl font-bold text-cyan-300 animate-pulse">
              {loading ? "--" : formatCurrency(nzdSaved).replace("$", "NZ$")}
            </p>
            <p className="mt-1 text-sm text-slate-400">New Zealand Dollars Saved</p>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-slate-900/70 p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">OpenProvider API</p>
            <div className="mt-3 flex items-center gap-3">
              <span
                className={`h-3 w-3 rounded-full ${
                  telemetry?.openProviderStatus === "green"
                    ? "animate-pulse bg-emerald-400 shadow-[0_0_16px_rgba(74,222,128,0.8)]"
                    : "animate-pulse bg-red-400 shadow-[0_0_16px_rgba(248,113,113,0.8)]"
                }`}
              />
              <span className="text-lg font-semibold text-amber-200">
                {loading ? "Checking..." : telemetry?.openProviderStatus === "green" ? "Operational" : "Degraded"}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-slate-900/70 p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Global Kill Switch</p>
            <p className={`mt-2 text-lg font-semibold ${globalLaunchActive ? "text-emerald-300" : "text-amber-200"}`}>
              {globalLaunchActive ? "Launch Active" : "Launch Guarded"}
            </p>
            <button
              onClick={() => setSwitchOpen(true)}
              className="mt-3 rounded-lg border border-amber-400/40 bg-slate-950 px-3 py-2 text-sm font-medium text-amber-200 transition hover:bg-slate-800"
            >
              {globalLaunchActive ? "Deactivate Global Launch" : "Activate Global Launch"}
            </button>
          </div>
        </div>

        <section className="mt-6 rounded-2xl border border-amber-500/30 bg-black/70 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-amber-200">MARZ Neural Presence</h2>
            <button
              onClick={activateNeuralLink}
              disabled={neuralLinkBusy}
              className="rounded-lg border border-amber-400/40 bg-slate-950 px-3 py-2 text-sm font-medium text-amber-200 transition hover:bg-slate-800 disabled:opacity-50"
            >
              {neuralLinkBusy ? "Connecting Neural Link..." : "Activate Neural Link"}
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-amber-500/20 bg-slate-950">
            <div className="marz-sovereign-frame marz-breathe">
              <div className="marz-parallax-layer h-[78vh] w-full">
                <canvas
                  ref={marzCanvasRef}
                  className="h-full w-full object-cover"
                  aria-label="MARZ avatar media canvas"
                />
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-lg border border-amber-500/20 bg-slate-900/60 px-3 py-2 text-sm text-slate-300">
            <span className="font-semibold text-amber-200">Voice Profile:</span> Sovereign Hybrid <span className="font-mono">AllTalk + Edge-TTS</span>
            <span className="ml-3 font-semibold text-amber-200">Model:</span> {voiceModelLabel}
            <span className="ml-3 font-semibold text-amber-200">Status:</span> {neuralLinkActive ? "Neural Link Active" : "Idle"}
          </div>

          <p className="mt-3 text-sm text-slate-400">{neuralSpeech}</p>
          {neuralLinkError && <p className="mt-2 text-sm text-red-300">{neuralLinkError}</p>}
        </section>

        <MentorLog entries={initialJournal} />

        <section className="mt-6 rounded-2xl border border-amber-500/30 bg-black/70 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-amber-200">Marz Autonomous Thoughts</h2>
            <div className="flex items-center gap-3">
              {welcomePinned && (
                <button
                  onClick={() => setWelcomePinned(false)}
                  className="rounded-md border border-amber-500/30 px-2 py-1 text-xs text-amber-200 hover:bg-amber-500/10"
                >
                  Mark Welcome Note Read
                </button>
              )}
              <span className="text-xs text-slate-500">Refresh: 15s</span>
            </div>
          </div>

          <div
            ref={terminalRef}
            className="h-[430px] overflow-y-auto rounded-xl border border-amber-500/20 bg-black px-4 py-3 font-mono text-sm leading-6 text-emerald-300"
          >
            {thoughtLines.length === 0 ? (
              <p className="text-slate-500">Awaiting neural thought stream...</p>
            ) : (
              thoughtLines.map((line, index) => (
                <p key={`${line}-${index}`} className="whitespace-pre-wrap">
                  {line}
                </p>
              ))
            )}
          </div>
        </section>

        {switchOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
            <div className="w-full max-w-md rounded-2xl border border-amber-500/40 bg-slate-950 p-6">
              <h3 className="text-xl font-semibold text-amber-200">Safety Cover Confirmation</h3>
              <p className="mt-2 text-sm text-slate-300">
                Type <span className="font-semibold text-cyan-300">LAUNCH</span> to confirm this global launch state change.
              </p>
              <input
                value={confirmCode}
                onChange={(event) => setConfirmCode(event.target.value)}
                className="mt-4 w-full rounded-xl border border-amber-500/30 bg-slate-900 px-3 py-2 text-slate-100"
                placeholder="LAUNCH"
              />
              <div className="mt-5 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setSwitchOpen(false);
                    setConfirmCode("");
                  }}
                  className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300"
                >
                  Cancel
                </button>
                <button
                  disabled={switchBusy || confirmCode !== "LAUNCH"}
                  onClick={handleKillSwitch}
                  className="rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 px-3 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50"
                >
                  {switchBusy ? "Applying..." : "Confirm Switch"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
