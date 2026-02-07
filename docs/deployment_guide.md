# OpsVantage AI Builder: Deployment Guide

This guide provides instructions for fixing the current Vercel deployment and migrating to alternative platforms as a backup or permanent solution.

## 🛠️ Fixing Vercel (The "Quick Fix")

The current deployment is failing because `NEXTAUTH_SECRET` is missing in production.

1.  **Generate a Secret**: Run `openssl rand -base64 32` in your terminal to create a secure key.
2.  **Add to Vercel**:
    *   Go to your **Vercel Dashboard**.
    *   Select the **opsvantage-ai-builder** project.
    *   Navigate to **Settings** > **Environment Variables**.
    *   Add a new variable:
        *   **Key**: `NEXTAUTH_SECRET`
        *   **Value**: [The secret you generated]
3.  **Redeploy**: Go to the **Deployments** tab and trigger a "Redeploy" for the latest production branch.

---

## 🚀 Alternative 1: Netlify (Recommended)

Netlify is the most robust alternative for Next.js applications.

### Setup Steps:
1.  **Connect Repo**: Log in to [Netlify](https://app.netlify.com/) and click **"Add new site"** > **"Import an existing project"**.
2.  **Authorize GitHub**: Select your repository.
3.  **Build Settings**:
    *   **Build Command**: `npm run build`
    *   **Publish Directory**: `.next` (Netlify usually detects this automatically).
4.  **Environment Variables**: You MUST add the following variables during setup:
    *   `DATABASE_URL`: Your Neon PostgreSQL connection string.
    *   `NEXTAUTH_SECRET`: The secret generated above.
    *   `NEXTAUTH_URL`: Your Netlify site URL (e.g., `https://your-site.netlify.app`).
    *   `SANITY_API_READ_TOKEN`: Your Sanity token.
    *   `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
    *   `NOWPAYMENTS_API_KEY`.

---

## 🚂 Alternative 2: Railway.app (Full-Stack Power)

Railway is excellent if you prefer a platform that manages everything in one simple dashboard.

### Setup Steps:
1.  **New Project**: Go to [Railway](https://railway.app/) and click **"New Project"**.
2.  **Deploy from Repo**: Select your GitHub repo.
3.  **Variables**: Add the same environment variables as listed in the Netlify section.
4.  **Automatic Build**: Railway will detect the `package.json` and run the build automatically.

---

## ✅ Post-Deployment Verification

Once deployed, verify the following:
1.  **Login**: Ensure you can sign in (checks NextAuth + Database).
2.  **Dashboard**: Ensure data loads from the database.
3.  **Images**: Ensure project images display (checks Sanity/Cloudinary).
