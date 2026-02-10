// Mock Vercel client for domain management
// This is a placeholder implementation to satisfy the build
// In a real implementation, this would connect to the Vercel API

export const vercel = {
  addDomainToProject: async (projectId: string, domain: string) => {
    console.log(`Mock: Adding domain ${domain} to Vercel project ${projectId}`);
    // In a real implementation, this would make an API call to Vercel
    // For now, we're just mocking the functionality
    return Promise.resolve({
      name: domain,
      apexName: domain.replace(/^www\./, ''),
      projectId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      state: 'Ready',
      gitBranch: null,
      redirect: null,
      redirectStatusCode: null,
      verified: true,
      pendingVerification: false,
    });
  },

  removeDomainFromProject: async (projectId: string, domain: string) => {
    console.log(`Mock: Removing domain ${domain} from Vercel project ${projectId}`);
    return Promise.resolve({ success: true });
  },

  getDomainInfo: async (domain: string) => {
    console.log(`Mock: Getting info for domain ${domain}`);
    return Promise.resolve({
      name: domain,
      verified: true,
      pendingVerification: false,
    });
  },
};