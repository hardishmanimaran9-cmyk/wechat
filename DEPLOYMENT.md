# 🚀 Chatwe — Deployment Guide

This guide covers running the app locally and deploying to production.

---

## 📋 Prerequisites

Before starting, make sure you have:
- **Node.js** (v18 or later): [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **A MongoDB Atlas account** (follow `MONGODB_SETUP.md`)

---

## 🖥️ Running Locally

### Step 1: Clone or download the project

If you've downloaded the project, navigate to the `wechat` folder.

### Step 2: Set up the Backend

```bash
# Open a terminal and navigate to the server folder
cd server

# Install all dependencies
npm install

# Make sure your .env file has the correct MONGO_URI
# (see MONGODB_SETUP.md for how to get this)

# Start the development server
npm run dev
```

You should see:
```
✅ MongoDB Connected: cluster0-xxxxx.mongodb.net
🚀 Chatwe Server running on port 5000
```

### Step 3: Set up the Frontend

```bash
# Open a NEW terminal window and navigate to the client folder
cd client

# Install all dependencies
npm install

# Start the development server
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### Step 4: Open the App

1. Open your browser and go to: **http://localhost:5173**
2. Create an account on the Signup page
3. Log in and start chatting!

**To test real-time chat:**
1. Open **two browser tabs** (or use one regular + one incognito window)
2. Create two separate accounts
3. Send a chat request from one account to the other
4. Accept the request
5. Start chatting in real-time! 🎉

---

## ☁️ Deploying Backend to Render

[Render](https://render.com) offers free hosting for Node.js backends.

### Step 1: Push code to GitHub

1. Create a new repository on GitHub
2. Push your `server` folder to it:

```bash
cd server
git init
git add .
git commit -m "Initial commit - Chatwe backend"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/chatwe-server.git
git push -u origin main
```

### Step 2: Create a Render account

1. Go to [https://render.com](https://render.com)
2. Sign up with GitHub

### Step 3: Deploy on Render

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `chatwe-server`
   - **Region**: Choose the closest to you
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: Free

4. Click **"Advanced"** and add **Environment Variables**:
   - `MONGO_URI` = your MongoDB Atlas connection string
   - `JWT_SECRET` = a strong secret key (different from development!)
   - `CLIENT_URL` = your frontend URL (you'll get this after deploying frontend)
   - `PORT` = 5000

5. Click **"Create Web Service"**
6. ⏳ Wait for the build to complete (3-5 minutes)
7. Your backend URL will look like: `https://chatwe-server.onrender.com`

---

## ☁️ Deploying Frontend to Vercel

[Vercel](https://vercel.com) is great for deploying React apps.

### Step 1: Update API URL

Before deploying, update the API URL in `client/src/utils/api.js`:

```javascript
const API = axios.create({
  baseURL: 'https://chatwe-server.onrender.com/api',
  // Replace with your actual Render backend URL
});
```

Also update the socket URL in `client/src/context/SocketContext.jsx`:

```javascript
const newSocket = io('https://chatwe-server.onrender.com', {
  // Replace with your actual Render backend URL
});
```

### Step 2: Push frontend to GitHub

```bash
cd client
git init
git add .
git commit -m "Initial commit - Chatwe frontend"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/chatwe-client.git
git push -u origin main
```

### Step 3: Deploy on Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click **"Add New..."** → **"Project"**
4. Import your `chatwe-client` repository
5. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Click **"Deploy"**
7. ⏳ Wait for the build (1-2 minutes)
8. Your frontend URL will look like: `https://chatwe-client.vercel.app`

### Step 4: Update CORS on Backend

Go back to Render and update the `CLIENT_URL` environment variable:
```
CLIENT_URL=https://chatwe-client.vercel.app
```

---

## 🔧 Environment Variables Reference

### Backend (`server/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/chatwe` |
| `JWT_SECRET` | Secret key for JWT tokens | `my_super_secret_key_12345` |
| `PORT` | Backend server port | `5000` |
| `CLIENT_URL` | Frontend URL (for CORS) | `http://localhost:5173` |

---

## 🛡️ CORS Configuration

CORS (Cross-Origin Resource Sharing) allows your frontend to communicate with your backend.

The backend is already configured to handle CORS. Just make sure:
1. The `CLIENT_URL` in `.env` matches your frontend's actual URL
2. In production, never use `*` for CORS origin

**Development**: `CLIENT_URL=http://localhost:5173`
**Production**: `CLIENT_URL=https://chatwe-client.vercel.app`

---

## ❌ Common Deployment Issues

### "Cannot connect to backend" from frontend
- Check that `CLIENT_URL` is set correctly in Render environment variables
- Make sure the API URL in `api.js` matches your Render URL
- Check browser console for CORS errors

### "Application error" on Render
- Check your Render logs for error messages
- Make sure all environment variables are set
- Make sure `MONGO_URI` is correct

### Socket.IO not connecting in production
- Make sure the socket URL in `SocketContext.jsx` points to your Render URL
- Render's free tier may sleep after inactivity — first connection may take 30+ seconds

### Build fails on Vercel
- Make sure all imports are correct (case-sensitive on Linux!)
- Check that no dependencies are missing from `package.json`

---

## 📁 .gitignore

Make sure to create a `.gitignore` file in both `server/` and `client/`:

**server/.gitignore:**
```
node_modules/
.env
```

**client/.gitignore:**
```
node_modules/
dist/
.env
```

---

## 🎉 You're Done!

Your Chatwe application is now live! Share the Vercel URL with friends to start chatting.
