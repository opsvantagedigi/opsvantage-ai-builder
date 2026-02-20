/*
 * Cloud Function (draft): Billing Pub/Sub budget alert -> kill marz-neural-core
 *
 * Trigger: Pub/Sub topic from Cloud Billing Budgets notifications.
 * Action: set Cloud Run max instances to 0 for service marz-neural-core.
 *
 * Equivalent CLI intent:
 *   gcloud run services update marz-neural-core --max-instances 0 --region europe-west4
 */

const { GoogleAuth } = require('google-auth-library');

function decodeMessage(pubsubMessage) {
  const dataB64 = pubsubMessage && pubsubMessage.data;
  if (!dataB64) return null;
  try {
    const text = Buffer.from(dataB64, 'base64').toString('utf8');
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function isAtOrAboveBudget(payload) {
  if (!payload) return false;

  // Common field in budget notifications
  const exceeded = Number(payload.alertThresholdExceeded);
  if (Number.isFinite(exceeded) && exceeded >= 1) return true;

  // Fallback heuristic if amounts are present
  const cost = Number(payload.costAmount);
  const budget = Number(payload.budgetAmount);
  if (Number.isFinite(cost) && Number.isFinite(budget) && budget > 0) {
    return cost / budget >= 1;
  }

  return false;
}

async function patchCloudRunMaxInstances({ projectId, region, serviceName }) {
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });
  const client = await auth.getClient();
  const accessTokenResponse = await client.getAccessToken();
  const accessToken = typeof accessTokenResponse === 'string' ? accessTokenResponse : accessTokenResponse?.token;
  if (!accessToken) {
    throw new Error('Unable to obtain access token');
  }

  const base = `https://${region}-run.googleapis.com`;
  const resource = `${base}/apis/serving.knative.dev/v1/namespaces/${projectId}/services/${serviceName}`;

  // Patch the service template scaling annotation.
  // Note: Cloud Run also supports service-level scaling fields, but annotations are broadly compatible.
  const patch = {
    spec: {
      template: {
        metadata: {
          annotations: {
            'autoscaling.knative.dev/maxScale': '0',
          },
        },
      },
    },
  };

  const res = await fetch(resource, {
    method: 'PATCH',
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/merge-patch+json',
    },
    body: JSON.stringify(patch),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Cloud Run patch failed (${res.status}): ${body.slice(0, 500)}`);
  }

  return true;
}

// Gen 2 Cloud Functions signature
exports.killNeuralCoreOnBudget = async (pubsubMessage, context) => {
  const payload = decodeMessage(pubsubMessage);
  console.log('[billing-kill-switch] received', {
    hasPayload: Boolean(payload),
    threshold: payload ? payload.alertThresholdExceeded : undefined,
    budget: payload ? payload.budgetAmount : undefined,
    cost: payload ? payload.costAmount : undefined,
  });

  if (!isAtOrAboveBudget(payload)) {
    console.log('[billing-kill-switch] budget not yet at 100%; no action');
    return;
  }

  const projectId = process.env.GCP_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;
  const region = process.env.CLOUD_RUN_REGION || 'europe-west4';
  const serviceName = process.env.CLOUD_RUN_SERVICE || 'marz-neural-core';

  if (!projectId) {
    throw new Error('Missing GCP_PROJECT/GOOGLE_CLOUD_PROJECT');
  }

  console.log('[billing-kill-switch] Killing service (max instances -> 0)', {
    projectId,
    region,
    serviceName,
  });

  await patchCloudRunMaxInstances({ projectId, region, serviceName });
  console.log('[billing-kill-switch] Done');
};
