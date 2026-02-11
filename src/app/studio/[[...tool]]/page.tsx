import nextDynamic from "next/dynamic";

const StudioClient = nextDynamic(() => import("./studio-client"), {
  ssr: false,
});

export const dynamic = "force-dynamic";

export default function StudioPage() {
  return <StudioClient />;
}
