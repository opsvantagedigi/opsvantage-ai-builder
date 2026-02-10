# OpsVantage AI Builder: Deployment Guide

This guide provides instructions for deploying the application to various platforms.

## 🛠️ Deployment Preparation

Before deploying, ensure `NEXTAUTH_SECRET` is properly configured.

1.  **Generate a Secret**: Run `openssl rand -base64 32` in your terminal to create a secure key.
2.  **Add Environment Variable**:
    *   Add the following variable to your deployment platform:
        *   **Key**: `NEXTAUTH_SECRET`
        *   **Value**: [The secret you generated]

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
