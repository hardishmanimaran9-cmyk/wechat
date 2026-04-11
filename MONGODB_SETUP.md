# 🗄️ MongoDB Atlas Setup Guide (Step-by-Step)

This guide will help you set up MongoDB Atlas (a free cloud database) for Chatwe.
**No installation needed on your computer** — everything runs in the cloud!

---

## Step 1: Create a MongoDB Atlas Account

1. Go to **[https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)**
2. Click **"Try Free"** (top right corner)
3. Fill in:
   - **First Name**: Your name
   - **Last Name**: Your last name
   - **Email**: Your email address
   - **Password**: Choose a strong password
4. Check the terms of service box
5. Click **"Create your Atlas account"**
6. **Verify your email** by clicking the link sent to your inbox

---

## Step 2: Create a Free Cluster

After signing in, Atlas will guide you through setup:

1. **Choose a plan**: Select **"M0 FREE"** (completely free, no credit card needed!)
2. **Choose a cloud provider**: Select **"AWS"** (or any, doesn't matter)
3. **Choose a region**: Pick the one **closest to you** for faster speed
   - Example: If you're in India, pick `ap-south-1 (Mumbai)`
   - Example: If you're in USA, pick `us-east-1 (Virginia)`
4. **Cluster name**: You can leave it as "Cluster0" or rename to "ChatweCluster"
5. Click **"Create Deployment"**
6. ⏳ Wait 1-3 minutes for the cluster to be created

---

## Step 3: Create a Database User

This is the username and password your app will use to connect to the database.

1. After cluster creation, a popup will appear asking to create a user
2. **Or** go to: **Database Access** (left sidebar menu)
3. Click **"+ Add New Database User"**
4. Choose **"Password"** authentication
5. Enter:
   - **Username**: `chatweAdmin` (or any name you like)
   - **Password**: Click **"Autogenerate Secure Password"** and **COPY IT SOMEWHERE SAFE!**
   
   ⚠️ **IMPORTANT**: Copy and save this password! You'll need it later.
   
6. Under **"Database User Privileges"**: Select **"Atlas admin"** or **"Read and write to any database"**
7. Click **"Add User"**

---

## Step 4: Whitelist Your IP Address

MongoDB Atlas only allows connections from approved IP addresses (for security).

1. Go to **"Network Access"** (left sidebar menu)
2. Click **"+ Add IP Address"**
3. Click **"Allow Access from Anywhere"** (adds `0.0.0.0/0`)
   
   ⚠️ This allows any IP — fine for development, but tighten security for production!
   
4. Click **"Confirm"**
5. ⏳ Wait about 1 minute for changes to take effect

---

## Step 5: Get Your Connection String

This is the URL your app uses to connect to the database.

1. Go to **"Database"** (left sidebar menu)
2. Find your cluster and click **"Connect"**
3. Select **"Drivers"** (Connect your application)
4. Make sure:
   - **Driver**: Node.js
   - **Version**: 6.7 or later (latest)
5. You'll see a connection string that looks like this:

```
mongodb+srv://chatweAdmin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

6. **Copy this string**
7. **Replace `<password>`** with the actual password you created in Step 3
8. **Add the database name** before the `?`:

```
mongodb+srv://chatweAdmin:YOUR_ACTUAL_PASSWORD@cluster0.xxxxx.mongodb.net/chatwe?retryWrites=true&w=majority
```

Notice we added `/chatwe` — this tells MongoDB to use a database named "chatwe".

---

## Step 6: Add Connection String to Your App

1. Open the file `server/.env`
2. Replace the `MONGO_URI` line with your actual connection string:

```env
MONGO_URI=mongodb+srv://chatweAdmin:YOUR_ACTUAL_PASSWORD@cluster0.xxxxx.mongodb.net/chatwe?retryWrites=true&w=majority
JWT_SECRET=chatwe_super_secret_key_change_this_in_production_2024
PORT=5000
CLIENT_URL=http://localhost:5173
```

3. Save the file

---

## Step 7: Test the Connection

1. Open a terminal in the `server` folder
2. Run:

```bash
npm install
npm run dev
```

3. If everything is correct, you should see:

```
✅ MongoDB Connected: cluster0-xxxxx.mongodb.net
🚀 Chatwe Server running on port 5000
```

🎉 **Congratulations! Your database is connected!**

---

## ❌ Common Errors and Fixes

### Error: `MongoServerError: bad auth`
**Cause**: Wrong username or password in your connection string.
**Fix**: 
1. Go to MongoDB Atlas → Database Access
2. Click the edit button (pencil icon) next to your user
3. Click "Edit Password" and set a new password
4. Update the password in your `.env` file
5. Make sure there are NO special characters in the password that need encoding (like `@`, `#`, `%`)

---

### Error: `MongooseServerSelectionError: connection timed out`
**Cause**: Your IP address is not whitelisted.
**Fix**:
1. Go to MongoDB Atlas → Network Access
2. Click "+ Add IP Address"
3. Click "Allow Access from Anywhere"
4. Wait 1 minute and try again

---

### Error: `ENOTFOUND` or `getaddrinfo failed`
**Cause**: No internet connection or wrong cluster URL.
**Fix**:
1. Check your internet connection
2. Make sure the connection string is copied correctly
3. Check if there are extra spaces in the `.env` file

---

### Error: `MongoParseError: Invalid connection string`
**Cause**: The connection string format is wrong.
**Fix**:
1. Make sure the string starts with `mongodb+srv://`
2. Make sure there are no extra spaces at the beginning or end
3. Make sure the password doesn't contain unescaped special characters
4. Try re-copying the connection string from Atlas

---

### Error: `querySrv ENODATA`
**Cause**: DNS resolution issue, usually a network/firewall problem.
**Fix**:
1. Try using a different internet connection (e.g., mobile hotspot)
2. Try changing your DNS to Google's DNS (8.8.8.8)
3. If on a company/school network, it may be blocking the connection

---

### My data isn't showing in Atlas!
**Fix**: 
1. Go to Atlas → Database → Browse Collections
2. Look for the "chatwe" database
3. You should see "users" and "messages" collections after creating accounts and sending messages

---

## 💡 Tips

- **Free tier limits**: M0 free tier gives you 512 MB storage — more than enough for development and small projects
- **Never commit `.env`**: Add `.env` to your `.gitignore` file to keep your credentials safe
- **Production**: For production, change `0.0.0.0/0` in Network Access to your server's specific IP address
