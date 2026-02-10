import { CloudBuildClient } from '@google-cloud/cloudbuild';

/**
 * Utility functions for interacting with Google Cloud Build
 */
export class GCloudBuild {
  private client: CloudBuildClient;

  constructor() {
    this.client = new CloudBuildClient();
  }

  /**
   * Submit a build to Google Cloud Build
   * @param projectId The Google Cloud Project ID
   * @param source Source configuration for the build
   * @returns Build ID
   */
  async submitBuild(
    projectId: string,
    source: {
      repoSource?: {
        projectId: string;
        repoName: string;
        branchName?: string;
        tagName?: string;
        commitSha?: string;
      };
      storageSource?: {
        bucket: string;
        object: string;
      };
    }
  ): Promise<string> {
    const [operation] = await this.client.createBuild({
      projectId,
      build: {
        source,
        steps: [
          {
            name: 'node:20',
            entrypoint: 'npm',
            args: ['install'],
          },
          {
            name: 'node:20',
            entrypoint: 'npm',
            args: ['run', 'build'],
          },
          {
            name: 'node:20',
            entrypoint: 'npm',
            args: ['test'],
          },
        ],
        options: {
          env: ['NODE_ENV=production'],
        },
      },
    });

    // The operation.name contains the build ID
    const buildId = operation.name.split('/').pop() || '';
    console.log(`Build submitted with ID: ${buildId}`);
    
    return buildId;
  }

  /**
   * Get the status of a build
   * @param projectId The Google Cloud Project ID
   * @param buildId The build ID to check
   * @returns Build status
   */
  async getBuildStatus(projectId: string, buildId: string): Promise<any> {
    const [build] = await this.client.getBuild({
      projectId,
      id: buildId,
    });

    return {
      id: build.id,
      status: build.status,
      createTime: build.createTime,
      startTime: build.startTime,
      finishTime: build.finishTime,
      logUrl: build.logUrl,
    };
  }

  /**
   * List recent builds
   * @param projectId The Google Cloud Project ID
   * @returns List of recent builds
   */
  async listBuilds(projectId: string): Promise<any[]> {
    const [builds] = await this.client.listBuilds({
      projectId,
    });

    return builds.map(build => ({
      id: build.id,
      status: build.status,
      createTime: build.createTime,
      tags: build.tags,
    }));
  }
}

/**
 * Example usage
 */
export async function example() {
  const gcb = new GCloudBuild();
  
  // Example: Submit a build from a GitHub repo
  const buildId = await gcb.submitBuild('your-project-id', {
    repoSource: {
      projectId: 'your-project-id',
      repoName: 'opsvantage-ai-builder',
      branchName: 'main',
    }
  });
  
  console.log(`Submitted build: ${buildId}`);
  
  // Check build status after a delay
  setTimeout(async () => {
    const status = await gcb.getBuildStatus('your-project-id', buildId);
    console.log('Build status:', status);
  }, 30000); // Check after 30 seconds
}