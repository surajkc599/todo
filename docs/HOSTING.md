# Hosting & Deployment Strategy

## Overview

Todo App v1 uses a **cloud-native, serverless-first** approach with minimal DevOps overhead:

| Component | Platform | Free Tier | Auto-Scaling | Notes |
|-----------|----------|-----------|--------------|-------|
| **Frontend** | Vercel | ✅ Yes | ✅ Yes | Push to GitHub → auto-deploy |
| **Backend** | Render | ✅ Yes | ✅ Yes | Includes free PostgreSQL |
| **Database** | PostgreSQL | ✅ Yes (free tier) | Limited | 256 MB free tier on Render |

## Why This Strategy?

### Decision Rationale

**Rejected Alternatives:**
- **AWS/GCP/Azure:** Over-engineered for v1, significant DevOps overhead
- **Heroku:** Pricing increased; no longer viable for free tier projects
- **Separate services (Lambda, RDS, S3):** Requires complex CI/CD, IAM, and monitoring

**Chosen: Render + Vercel**
- ✅ **Single invoice** — All backend services on one platform
- ✅ **Free tiers** — Both platforms offer generous free tier for small projects
- ✅ **One-command deploys** — Git-based deployments with auto-rollback
- ✅ **Built-in database** — PostgreSQL included, no separate setup
- ✅ **Industry standard** — Vercel for frontend, similar platforms for backend

---

## Frontend Deployment (Vercel)

### Setup

1. **Connect Git Repository**
   ```bash
   # Push code to GitHub
   git push origin main
   ```

2. **Import Project on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project" → Select your GitHub repo
   - Set root directory: `frontend`
   - Environment: Node.js

3. **Configure Environment Variables**
   ```env
   VITE_API_URL=https://your-backend-api.render.com/api
   ```

4. **Deploy**
   - Vercel auto-deploys on git push to `main`
   - URL: `https://yourtodo.vercel.app`

### Production Build

```bash
cd frontend
npm run build  # Creates optimized dist/ folder
# Vercel automatically runs this during deploy
```

### Monitoring

- **Vercel Dashboard** → Project → Analytics
- **Logs** → Function logs, build logs visible in dashboard

---

## Backend Deployment (Render)

### Platform Choice: Render vs Railway

| Feature | Render | Railway |
|---------|--------|---------|
| Free PostgreSQL | ✅ 256 MB | ✅ 512 MB |
| Node.js support | ✅ Yes | ✅ Yes |
| Free tier hours | 750 hrs/mo | 5 hrs/mo* |
| Auto-deploy from Git | ✅ Yes | ✅ Yes |
| Cold starts | ~30s | <1s |
| Pricing | Pay-as-you-go after free tier | Per-minute billing |

*Railway free tier is limited; typically requires payment after trial.

**Recommendation for v1:** **Render** (more generous free tier, predictable pricing)

### Setup on Render

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Connect Repository**
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Select `backend` directory as root

3. **Configure Service**
   - **Name:** `todo-api` (or your choice)
   - **Environment:** Node
   - **Build Command:** `npm install && npm run prisma:generate && npm run build`
   - **Start Command:** `npm run start`
   
   **Build Command Breakdown:**
   - `npm install` — Install dependencies
   - `npm run prisma:generate` — Generate Prisma client
   - `npm run build` — **Compile TypeScript to JavaScript** (critical step!)

4. **Create PostgreSQL Database**
   - In Render dashboard: "New +" → "PostgreSQL"
   - **Database:** `todo-db`
   - **Version:** Latest
   - **Region:** Same as web service

5. **Link Database to Backend**
   - In web service settings → "Environment"
   - Render auto-provides `DATABASE_URL`
   - Add custom env vars:
     ```env
     NODE_ENV=production
     PORT=3001
     ```

6. **Deploy**
   ```bash
   # Push to GitHub main branch
   git push origin main
   # Render auto-deploys immediately
   ```

   - URL: `https://todo-api.onrender.com`

### Setup on Railway

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy Backend**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repo, connect
   - Set root directory: `backend`

3. **Configure Build & Start**
   - **Build Command:** `npm install && npm run prisma:generate && npm run build`
   - **Start Command:** `npm run start`
   - Set in project settings → Variables or Railway.toml

4. **Configure Environment**
   - Add `NODE_ENV=production`
   - Add `PORT=3001`

4. **Add PostgreSQL**
   - In project dashboard: "Add Service" → "Database" → "PostgreSQL"
   - Railway auto-provides `DATABASE_URL`

5. **Deploy**
   - Railway auto-deploys on git push
   - URL: Auto-generated (usually `project-production.up.railway.app`)

---

## Database Migrations in Production

### Local Development

```bash
cd backend
npm run prisma:migrate:dev -- --name add_feature
# Creates migration in prisma/migrations/
```

### Production Deployment

Render/Railway automatically run migrations on deployment via build command:

```bash
npm run prisma:generate && npm run prisma:migrate:deploy
```

**Important:** Never modify the database schema directly in production. Always:
1. Create migration locally
2. Test in local dev database
3. Commit migration to git
4. Push to GitHub → Platform auto-runs migration

---

## Environment Variables

### Frontend (.env.local)

```env
VITE_API_URL=http://localhost:3001/api  # Local dev
VITE_API_URL=https://todo-api.onrender.com/api  # Production
```

### Backend (.env)

**Local Development:**
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/todo_dev
```

**Production (Render):**
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:password@render-hostname:5432/todo_db
```

Render provides `DATABASE_URL` automatically. No manual setup needed.

---

## CORS Configuration for Production

### Production URLs

- **Frontend:** `https://yourtodo.vercel.app`
- **Backend:** `https://todo-api.onrender.com`

### Backend CORS Setup

Update `backend/src/middleware/cors.ts`:

```typescript
const allowedOrigins = [
  'http://localhost:5173',                 // Local dev
  'http://localhost:3001',                 // Local dev
  'https://yourtodo.vercel.app',          // Production frontend
];

const corsOptions = {
  origin: (origin: string | undefined, callback: Function) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};
```

---

## Deployment Checklist

### Before First Deploy

- [ ] Database schema finalized and tested locally
- [ ] All environment variables documented
- [ ] Frontend build tested: `npm run build && npm run preview`
- [ ] Backend runs in production mode: `NODE_ENV=production npm start`
- [ ] API endpoints tested with production database
- [ ] CORS origins configured for production URLs

### Deploy Frontend

- [ ] Create Vercel account and connect GitHub
- [ ] Set `VITE_API_URL` environment variable
- [ ] Trigger deploy (git push auto-deploys)
- [ ] Verify deployment at `https://yourtodo.vercel.app`

### Deploy Backend

- [ ] Create Render (or Railway) account
- [ ] Create PostgreSQL database
- [ ] Connect backend repository
- [ ] Set environment variables
- [ ] Trigger deploy (git push auto-deploys)
- [ ] Verify deployment at `https://todo-api.onrender.com` (or Railway URL)

### Post-Deployment

- [ ] Test frontend → backend API calls
- [ ] Verify database migrations ran
- [ ] Check logs for errors
- [ ] Monitor for 24 hours
- [ ] Set up error tracking (optional: Sentry, LogRocket)

---

## Cost Analysis

### Free Tier (v1 Launch)

| Service | Free Tier | Cost |
|---------|-----------|------|
| Vercel Frontend | 100 GB bandwidth/mo | **$0** |
| Render Backend | 750 hrs/mo + 256 MB DB | **$0** |
| **Total** | — | **$0/month** |

### Small Scale (1K monthly users)

| Service | Usage | Cost |
|---------|-------|------|
| Vercel | ~10 GB bandwidth | ~$5-10/mo |
| Render | ~100 hrs compute | ~$10-15/mo |
| **Total** | — | **~$15-25/mo** |

### Medium Scale (10K monthly users)

| Service | Usage | Cost |
|---------|-------|------|
| Vercel | ~50 GB bandwidth | ~$20-30/mo |
| Render | ~400 hrs compute + DB upgrade | ~$30-50/mo |
| **Total** | — | **~$50-80/mo** |

---

## Monitoring & Logs

### Render Dashboard

- **Metrics:** CPU, memory, bandwidth
- **Logs:** Last 100 lines visible in web service settings
- **Alerts:** Email on deployment success/failure

### Vercel Dashboard

- **Analytics:** Build times, deployment status, real-time analytics
- **Logs:** Build logs, function logs, edge logs
- **Alerts:** Deployment failure emails

### Manual Monitoring

```bash
# Check backend logs
curl https://todo-api.onrender.com/health

# Check frontend availability
curl https://yourtodo.vercel.app
```

---

## Scaling Strategy

### v1 (Current)
- Single Render instance + shared PostgreSQL
- ~100-500 concurrent users
- Manual scaling via Render dashboard

### v2 (If needed)
- Render auto-scaling for backend
- PostgreSQL upgrade to paid tier
- CDN for static assets (Vercel handles this)

### v3 (Enterprise)
- Multi-region Render instances
- Read replicas for database
- Dedicated PostgreSQL cluster
- Consider AWS/GCP for cost optimization

---

## Troubleshooting

### "Cannot find module `/dist/index.js`" (Build Error)
- **Cause:** Build command didn't include `npm run build` step
- **Fix:** Update Render Build Command to: `npm install && npm run prisma:generate && npm run build`
- **Verify:** Check that TypeScript compilation happened in build logs
- **Note:** TypeScript must be compiled to JavaScript before `npm run start` can run

### "Cannot connect to database"
- Check `DATABASE_URL` is set in Render env vars
- Verify PostgreSQL service is running
- Check IP allowlist in database settings

### "CORS error in production"
- Verify frontend URL is added to `CORS_ORIGINS`
- Restart backend service after env var changes
- Check browser console for exact origin being blocked

### "Build fails on Render"
- Check build logs in Render dashboard
- Verify `npm run build` works locally first
- Ensure all dependencies are in `package.json` (not just `devDependencies`)

### "Database migration fails"
- Check migration file is committed to git
- Verify local migration works first
- Check database permissions (may need manual intervention)

### "Cold start is slow"
- Normal for free tier instances (~30s on Render)
- Consider paid tier for better performance
- Implement health check to prevent suspension

---

## Next Steps

1. **Test locally** with Docker Compose
2. **Create accounts** on Vercel and Render
3. **Deploy backend** first (database setup takes ~2 min)
4. **Deploy frontend** and test end-to-end
5. **Monitor logs** for 24 hours
6. **Document** any custom setup in this file
