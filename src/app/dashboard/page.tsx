import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"

export default async function DashboardPage() {
  let session = null
  try {
    session = await getServerSession(authOptions)
  } catch (err) {
    // If session retrieval fails, redirect to login to recover gracefully
    console.error('getServerSession error:', err)
    redirect('/login')
  }

  if (!session) redirect('/login')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-lg text-center">
        <h1 className="text-2xl font-semibold mb-4">
          Welcome to your Dashboard
        </h1>

        <p className="text-gray-600 mb-6">
          You are now logged in. This is where your onboarding wizard will begin.
        </p>

        <a
          href="/onboarding"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded"
        >
          Start Onboarding
        </a>
      </div>
    </div>
  )
}
