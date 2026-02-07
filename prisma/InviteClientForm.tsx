'use client';

import { useState } from 'react';

interface InviteClientFormProps {
  workspaceId: string;
}

/**
 * A form for an agency to invite a client workspace to be managed.
 */
export function InviteClientForm({ workspaceId }: InviteClientFormProps) {
  const [clientSlug, setClientSlug] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientWorkspaceSlug: clientSlug }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invitation.');
      }

      setSuccessMessage(`Invitation sent to workspace "${clientSlug}"! The owner must accept it.`);
      setClientSlug('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 border rounded-lg max-w-lg mx-auto my-10 bg-white shadow">
      <h3 className="text-lg font-semibold mb-4">Manage a New Client</h3>
      <p className="text-sm text-gray-600 mb-4">
        Enter the slug of the client's workspace to send a management invitation.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={clientSlug}
          onChange={(e) => setClientSlug(e.target.value)}
          placeholder="client-workspace-slug"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          disabled={isLoading}
        />

        {error && <p className="text-sm text-red-600">Error: {error}</p>}
        {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}

        <button type="submit" disabled={isLoading || !clientSlug} className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
          {isLoading ? 'Sending Invitation...' : 'Invite Client to Manage'}
        </button>
      </form>
    </div>
  );
}