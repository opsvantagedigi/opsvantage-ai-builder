/**
 * 📡 VERCEL ATLAS: Domain binding and deployment configuration
 *
 * Integrates with Vercel API to:
 * - Bind custom domains to projects
 * - Validate domain configuration
 * - Manage DNS and SSL records
 */

const VERCEL_API = 'https://api.vercel.com';
const PROJECT_ID = process.env.VERCEL_PROJECT_ID;
const TEAM_ID = process.env.VERCEL_TEAM_ID;
const VERCEL_TOKEN = process.env.VERCEL_API_TOKEN;

interface VercelDomainResponse {
  domain: string;
  apexNameservers: string[];
  nameservers: string[];
  intendedNameservers: string[];
  creator: {
    email: string;
    username: string;
    uid: string;
  };
  dateAdded: number;
  ssl: {
    type: string;
    expiresAt: number;
    autoRenew: boolean;
  };
  isExternal: boolean;
  isVercelCertified: boolean;
  verified: boolean;
  verification: Array<{
    type: string;
    domain: string;
    value: string;
  }>;
}

interface VercelAddDomainRequest {
  domain: string;
  redirect?: string;
  gitBranch?: string;
}

export interface DomainConfigStatus {
  domain: string;
  verified: boolean;
  nameservers: string[];
  requiredNameservers: string[];
  needsConfiguration: boolean;
  sslStatus?: 'pending' | 'valid' | 'expired';
}

/**
 * Add a custom domain to a Vercel project
 */
export async function addDomain(domain: string, redirect?: string): Promise<VercelDomainResponse> {
  if (!VERCEL_TOKEN || !PROJECT_ID) {
    throw new Error(
      'Missing Vercel configuration: VERCEL_API_TOKEN and VERCEL_PROJECT_ID required'
    );
  }

  const url = TEAM_ID
    ? `${VERCEL_API}/v10/projects/${PROJECT_ID}/domains?teamId=${TEAM_ID}`
    : `${VERCEL_API}/v10/projects/${PROJECT_ID}/domains`;

  const payload: VercelAddDomainRequest = { domain };
  if (redirect) {
    payload.redirect = redirect;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Vercel API error: ${error.error?.message || 'Failed to add domain'}`);
    }

    const data = await response.json() as VercelDomainResponse;
    console.log(`[MARZ] Domain ${domain} added to Vercel project`);
    return data;
  } catch (error) {
    console.error('[MARZ] Failed to add domain:', error);
    throw error;
  }
}

/**
 * Check the configuration status of a domain
 */
export async function checkDomainConfig(domain: string): Promise<DomainConfigStatus> {
  if (!VERCEL_TOKEN || !PROJECT_ID) {
    throw new Error(
      'Missing Vercel configuration: VERCEL_API_TOKEN and VERCEL_PROJECT_ID required'
    );
  }

  const url = TEAM_ID
    ? `${VERCEL_API}/v9/projects/${PROJECT_ID}/domains/${domain}?teamId=${TEAM_ID}`
    : `${VERCEL_API}/v9/projects/${PROJECT_ID}/domains/${domain}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        // Domain not found - not configured yet
        return {
          domain,
          verified: false,
          nameservers: [],
          requiredNameservers: getDefaultNameservers(),
          needsConfiguration: true,
        };
      }
      throw new Error(`Vercel API error: ${response.statusText}`);
    }

    const data = await response.json() as VercelDomainResponse;

    // Determine SSL status
    let sslStatus: 'pending' | 'valid' | 'expired' = 'pending';
    if (data.ssl?.expiresAt) {
      const expiryDate = new Date(data.ssl.expiresAt);
      if (expiryDate > new Date()) {
        sslStatus = 'valid';
      } else {
        sslStatus = 'expired';
      }
    }

    return {
      domain,
      verified: data.verified,
      nameservers: data.nameservers || [],
      requiredNameservers: data.intendedNameservers || getDefaultNameservers(),
      needsConfiguration: !data.verified,
      sslStatus,
    };
  } catch (error) {
    console.error('[MARZ] Failed to check domain config:', error);
    throw error;
  }
}

/**
 * Get the default Vercel nameservers
 */
function getDefaultNameservers(): string[] {
  return [
    'ns1.vercel-dns.com',
    'ns2.vercel-dns.com',
  ];
}

/**
 * Remove a domain from a Vercel project
 */
export async function removeDomain(domain: string): Promise<void> {
  if (!VERCEL_TOKEN || !PROJECT_ID) {
    throw new Error(
      'Missing Vercel configuration: VERCEL_API_TOKEN and VERCEL_PROJECT_ID required'
    );
  }

  const url = TEAM_ID
    ? `${VERCEL_API}/v9/projects/${PROJECT_ID}/domains/${domain}?teamId=${TEAM_ID}`
    : `${VERCEL_API}/v9/projects/${PROJECT_ID}/domains/${domain}`;

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Vercel API error: ${response.statusText}`);
    }

    console.log(`[MARZ] Domain ${domain} removed from Vercel project`);
  } catch (error) {
    console.error('[MARZ] Failed to remove domain:', error);
    throw error;
  }
}

/**
 * Get all domains for a project
 */
export async function listDomains(): Promise<VercelDomainResponse[]> {
  if (!VERCEL_TOKEN || !PROJECT_ID) {
    throw new Error(
      'Missing Vercel configuration: VERCEL_API_TOKEN and VERCEL_PROJECT_ID required'
    );
  }

  const url = TEAM_ID
    ? `${VERCEL_API}/v9/projects/${PROJECT_ID}/domains?teamId=${TEAM_ID}`
    : `${VERCEL_API}/v9/projects/${PROJECT_ID}/domains`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Vercel API error: ${response.statusText}`);
    }

    const data = await response.json() as { domains: VercelDomainResponse[] };
    return data.domains || [];
  } catch (error) {
    console.error('[MARZ] Failed to list domains:', error);
    throw error;
  }
}
