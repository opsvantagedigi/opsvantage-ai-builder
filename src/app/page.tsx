import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-8">
      <main className="flex flex-col items-center justify-center text-center max-w-4xl space-y-12">
        <div className="space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent pb-2">
            OpsVantage AI Builder
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto">
            Build, deploy, and scale AI-powered websites in minutes with our intelligent streamlined platform.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link
            href="/login"
            className="rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-blue-700 hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20"
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-zinc-800 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-zinc-700 hover:scale-105 active:scale-95 border border-zinc-700"
          >
            Create Account
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg px-8 py-4 text-lg font-semibold text-gray-300 transition-all hover:text-white"
          >
            Go to Dashboard &rarr;
          </Link>
        </div>

        <div className="pt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
            <h3 className="text-xl font-bold mb-2 text-blue-400">AI-Powered</h3>
            <p className="text-gray-400">Generate content, layouts, and structures automatically using advanced AI models.</p>
          </div>
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
            <h3 className="text-xl font-bold mb-2 text-purple-400">Sanity CMS</h3>
            <p className="text-gray-400">Seamless integration with Sanity for robust, scalable content management.</p>
          </div>
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
            <h3 className="text-xl font-bold mb-2 text-green-400">Neon DB</h3>
            <p className="text-gray-400">Serverless PostgreSQL database for instant scaling and branching.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
