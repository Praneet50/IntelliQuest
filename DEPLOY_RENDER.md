# Deployment Guide: Render.com

This guide walks you through deploying IntelliQuest to Render.com.

## Prerequisites

1. GitHub account with IntelliQuest repository pushed
2. MongoDB Atlas account with cluster (free tier available)
3. Render.com account
4. Gemini API key from Google

## Step 1: Set up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user with username and password
4. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/intelliquest`
5. Keep this safe—you'll need it

## Step 2: Generate Secrets

Generate strong values for:

```bash
# Generate JWT secret (use any 32+ character random string)
openssl rand -base64 32
```

Save all these values before deploying.

## Step 3: Deploy Backend

1. Go to [Render Dashboard](https://render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Fill in:
   - **Name**: intelliquest-backend
   - **Root Directory**: backend
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. Before deploying, click **Advanced** and add Environment Variables:

   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/intelliquest
   GEMINI_API_KEY=your-gemini-key
   JWT_SECRET=your-generated-secret
   JWT_EXPIRE=30d
   FRONTEND_URL=https://your-frontend-url.onrender.com
   CORS_ORIGINS=https://your-frontend-url.onrender.com
   ALLOW_MOCK_QUESTIONS=false
   ENABLE_PDF_OCR=true
   ```

6. Click **Deploy** and wait for completion
7. Copy your backend URL (e.g., https://intelliquest-backend.onrender.com)

## Step 4: Deploy Frontend

1. Click **New +** → **Static Site**
2. Connect your GitHub repository
3. Fill in:
   - **Name**: intelliquest-frontend
   - **Root Directory**: frontend/IntelliQuest
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: dist
   - **Plan**: Free

4. Add Environment Variables:

   ```
   VITE_API_BASE_URL=https://intelliquest-backend.onrender.com
   ```

   (Replace with your actual backend URL)

5. Click **Deploy**

## Step 5: Verify Deployment

1. Wait for both services to finish deploying (may take 5-10 minutes)
2. Visit your frontend URL and test:
   - User registration
   - Login
   - File upload
   - Question generation

## Environment Variables Reference

### Backend (.env)

- `DATABASE_URL`: MongoDB connection string
- `GEMINI_API_KEY`: Your Google Gemini API key
- `JWT_SECRET`: Secret for JWT tokens (generate with openssl)
- `FRONTEND_URL`: Your frontend Render URL
- `CORS_ORIGINS`: Allowed origins (comma-separated)
- `PORT`: Should be 10000 for Render free tier
- `NODE_ENV`: Set to "production"

### Frontend

- `VITE_API_BASE_URL`: Your backend Render URL

## Important Notes

### Render Free Tier Limitations

- **Spins down after 15 minutes of inactivity** - First request after spin-down takes 30s
- **Storage**: No persistent file storage across deployments
- **OCR**: May not work on free tier due to system dependencies

### Production Improvements

For production, consider:

1. Upgrade to paid Render plan (prevents spin-down)
2. Use AWS S3 or similar for persistent file storage
3. Set up error logging (Sentry, LogRocket)
4. Enable HTTPS (automatic on Render)
5. Add rate limiting
6. Monitor database performance

### Troubleshooting

**Backend won't start:**

- Check all environment variables are set
- Verify MONGODB_URI format
- Check logs in Render dashboard

**Frontend won't load:**

- Verify VITE_API_BASE_URL is correct
- Check browser console for errors
- Ensure backend is running

**Questions won't generate:**

- Verify GEMINI_API_KEY is valid
- Check Gemini quota on Google Cloud Console
- Review backend logs

**OCR not working:**

- Free tier Render doesn't include OCR dependencies
- Upgrade to paid plan or disable OCR: `ENABLE_PDF_OCR=false`

## Updating Your Deployment

To update after code changes:

1. Push to GitHub
2. Go to Render Dashboard
3. Click your service → **Deployments**
4. Click **Deploy latest commit**

Or enable auto-deploy in service settings.
