# Google Cloud Build Setup

This guide explains how to set up and use Google Cloud Build for deploying the OpsVantage AI Builder application.

## Prerequisites

1. Install Google Cloud SDK:
   ```bash
   # For Windows
   https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe
   
   # Or using Chocolatey
   choco install googlecloudsdk
   ```

2. Authenticate with Google Cloud:
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

3. Enable required APIs:
   ```bash
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable artifactregistry.googleapis.com
   ```

## Deployment Steps

### 1. Prepare your environment

Make sure you have the following environment variables set:

```bash
export PROJECT_ID=your-google-cloud-project-id
export REGION=us-central1  # or your preferred region
```

### 2. Deploy using Cloud Build

You can trigger a build and deployment using:

```bash
# Method 1: Using npm script
npm run gcloud:deploy

# Method 2: Direct gcloud command
gcloud builds submit --config cloudbuild.yaml .
```

### 3. Manual deployment steps (alternative)

If you prefer to build and deploy manually:

```bash
# Build the container image
gcloud builds submit --tag gcr.io/$PROJECT_ID/opsvantage-ai-builder

# Deploy to Cloud Run
gcloud run deploy opsvantage-ai-builder \
  --image gcr.io/$PROJECT_ID/opsvantage-ai-builder \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL=...,NEXTAUTH_SECRET=...,GOOGLE_API_KEY=...
```

## Cloud Build Configuration

The `cloudbuild.yaml` file defines the build steps:

1. Install dependencies using npm
2. Run tests to ensure code quality
3. Build the Next.js application
4. Containerize the application
5. Push the container to Google Container Registry
6. Deploy to Google Cloud Run

## Environment Variables

For production deployment, you'll need to set these environment variables:

- `DATABASE_URL`: Your PostgreSQL database connection string
- `NEXTAUTH_SECRET`: Secret for NextAuth.js
- `NEXTAUTH_URL`: The production URL of your application
- `GOOGLE_API_KEY`: Google API key for Gemini integration
- `STRIPE_SECRET_KEY`: Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret
- `SANITY_WRITE_TOKEN`: Sanity CMS write token
- `OPENPROVIDER_USERNAME`: OpenProvider username
- `OPENPROVIDER_PASSWORD`: OpenProvider password

## Troubleshooting

### Common Issues:

1. **Permission Errors**: Make sure your Google Cloud account has the necessary roles:
   - Cloud Build Service Account
   - Storage Admin
   - Service Account User
   - Cloud Run Admin

2. **Build Failures**: Check the build logs in the Google Cloud Console under Cloud Build > History

3. **Deployment Failures**: Verify all required environment variables are set during deployment

### Useful Commands:

```bash
# View build logs
gcloud builds list
gcloud builds log BUILD_ID

# Check deployed services
gcloud run services list

# View application logs
gcloud run services logs read SERVICE_NAME --region=REGION
```

## CI/CD Pipeline

The Cloud Build configuration supports automated deployments when pushing to specific branches:

1. Push to `main` branch triggers a production build
2. Build steps are defined in `cloudbuild.yaml`
3. Successful builds are automatically deployed to Cloud Run

You can customize the trigger by setting up Cloud Build Triggers in the Google Cloud Console.