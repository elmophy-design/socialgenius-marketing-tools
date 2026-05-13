# SocialGenius - Production Ready Fullstack AI Marketing Platform 🚀

## Architecture
```
Frontend (React 18)     Backend (Node/Express)    Database (MongoDB)
├── /build (static)     ├── /dist (prod)         └── Railway MongoDB
├── SPA + ErrorBoundary └── API + Health Checks   └── Mongoose ODM
└── npm run build
```

## Production Deployment Checklist ✅

### Backend (Railway - Recommended)
```
1. railway login
2. railway link backend
3. Set env vars:
   DB_URI=...
   JWT_SECRET=...
   PAYSTACK_SECRET_KEY=sk_live_...
   PAYSTACK_PUBLIC_KEY=pk_live_...
   FRONTEND_URL=https://frontend-domain.com
4. railway up
```
**Health**: https://backend.railway.app/health

### Frontend (Netlify/Vercel/Railway Static)
```
1. npm run build
2. Deploy /build folder
3. REACT_APP_API_URL=https://backend-domain.com/api
```
**Error Handling**: Global ErrorBoundary + Sentry-ready

### Health Status
```
Backend: /health ✅ MongoDB connected
Frontend: ErrorBoundary ✅ Prod optimized
Payments: Paystack/PayPal (add live keys)
```

## Local Development
```bash
# Backend
cd backend && npm run dev  # http://localhost:4000/health

# Frontend  
cd frontend && npm start   # http://localhost:3000
```

## Key Production Features
- **Health Checks**: Backend /health + Mongo status
- **Error Handling**: Frontend ErrorBoundary + Backend middleware
- **Payments**: Paystack/Paystack webhooks ready
- **Security**: JWT, CORS, rate limiting
- **Monitoring**: Uptime, memory, DB connection

## Quick Test
```
curl backend/health  # Backend status
npm run build        # Frontend prod bundle
```

**Ready for production deployment!** 🎉
