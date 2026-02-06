'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * A form component for creating a new workspace.
 * It calls the `/api/workspaces` endpoint.
 */
export function CreateWorkspaceForm() {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!name.trim()) {
      setError('Workspace name cannot be empty.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create workspace.');
      }

      const newWorkspace = await response.json();

      // On success, refresh the current route to reflect the new data.
      // In a real app, you might redirect to the new workspace:
      // router.push(`/dashboard/${newWorkspace.slug}`);
      router.refresh();

      // Optionally, clear the form and show a success message (e.g., with a toast notification).
      setName('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 border rounded-lg max-w-lg mx-auto my-10 bg-white shadow">
      <h2 className="text-xl font-semibold mb-4">Create a New Workspace</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="workspaceName" className="block text-sm font-medium text-gray-700 mb-1">
            Workspace Name
          </label>
          <input
            id="workspaceName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Acme Inc."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
        </div>

        {error && <p className="mb-4 text-sm text-red-600">Error: {error}</p>}

        <button type="submit" disabled={isLoading} className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
          {isLoading ? 'Creating...' : 'Create Workspace'}
        </button>
      </form>
    </div>
  );
}