'use client'
 
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body className="antialiased">
        <div className="flex h-screen flex-col items-center justify-center bg-gray-50 text-gray-900 font-sans">
            <div className="max-w-md text-center p-8">
                <h2 className="text-3xl font-bold mb-4 text-gray-800">Critical Error</h2>
                <p className="mb-8 text-gray-600">The application encountered a critical error and cannot render.</p>
                <button
                    onClick={() => reset()}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Reload Application
                </button>
            </div>
        </div>
      </body>
    </html>
  )
}
