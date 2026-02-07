const VERCEL_API_URL = 'https://api.vercel.com';

async function vercelFetch(endpoint: string, method: 'POST' | 'GET' | 'DELETE', body?: any) {
  const headers: HeadersInit = {
    'Authorization': `Bearer ${process.env.VERCEL_API_TOKEN}`,
    'Content-Type': 'application/json',
  };

  const config: RequestInit = { method, headers };
  if (body) {
    config.body = JSON.stringify(body);
  }

  let url = `${VERCEL_API_URL}${endpoint}`;
  if (process.env.VERCEL_TEAM_ID) {
    url += `?teamId=${process.env.VERCEL_TEAM_ID}`;
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Vercel API request failed.');
  }
  return response.json();
}

/**
 * Adds a domain to a Vercel project.
 * @param projectId The ID of the Vercel project.
 * @param domain The domain name to add.
 */
async function addDomainToProject(projectId: string, domain: string) {
  return vercelFetch(`/v10/projects/${projectId}/domains`, 'POST', { name: domain });
}

export const vercel = {
  addDomainToProject,
};