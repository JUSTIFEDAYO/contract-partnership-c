# Deploy to Render + Cloudinary Integration Guide

## 📋 Prerequisites

Before you start, make sure you have:

1. ✅ **GitHub Account** - [github.com](https://github.com)
2. ✅ **Render Account** - [render.com](https://render.com)
3. ✅ **Cloudinary Account** - Already set up (we have your credentials)

---

## 🚀 Step 1: Prepare Your Project for GitHub

### 1.1 Create a GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. **Repository name:** `contract-partnership-form`
3. **Description:** Contract Partnership Form with Cloudinary
4. **Public** (select this)
5. Click **Create repository**

### 1.2 Initialize Git & Push Files

In VS Code Terminal (in your project folder):

```bash
git init
git add .
git commit -m "Initial commit: contract partnership form"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/contract-partnership-form.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

---

## 🌐 Step 2: Deploy to Render

### 2.1 Connect GitHub to Render

1. Go to [render.com](https://render.com)
2. Click **Sign up** (or login)
3. Click **GitHub** to sign up with GitHub
4. Authorize Render to access your GitHub account

### 2.2 Create a New Web Service

1. Click **New +** → **Web Service**
2. **Connect a repository** → Select your `contract-partnership-form` repo
3. Click **Connect**

### 2.3 Configure the Service

Fill in these settings:

- **Name:** `contract-partnership-form`
- **Environment:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Plan:** Free (or Paid if you want)

### 2.4 Add Environment Variables

Before deploying, add your Cloudinary credentials:

1. Scroll down to **Environment Variables**
2. Click **Add Environment Variable**
3. Add these three variables:

```
CLOUDINARY_CLOUD_NAME = dspag2aww
CLOUDINARY_API_KEY = 576135641335578
CLOUDINARY_API_SECRET = QGBFL9uUfnUGQvlEyKZ6WTCPC3c
```

Click **Add** for each one.

### 2.5 Deploy

1. Click **Create Web Service**
2. Wait for deployment (5-10 minutes)
3. You'll see a URL like: `https://contract-partnership-form-xxxx.onrender.com`

**That's your live form!** 🎉

---

## ✅ Step 3: Test Your Live Form

1. Open the URL provided by Render
2. Fill out the form completely
3. Draw your signature
4. Submit

### What Happens:

- ✅ ID document uploads to **Cloudinary**
- ✅ Signature uploads to **Cloudinary**
- ✅ Form data saved locally on Render
- ✅ Success modal appears

### View Your Files on Cloudinary:

1. Go to [cloudinary.com/console](https://cloudinary.com/console)
2. Login with your account
3. Go to **Media Library**
4. You'll see your uploaded files in `contract-partnership-forms` folder

---

## 📝 Important Notes

### Environment Variables vs Hardcoded

- **In Development (Local):** Server uses hardcoded Cloudinary credentials
- **In Production (Render):** Server uses environment variables (more secure)

### Security Best Practices

⚠️ **IMPORTANT:** Your Cloudinary API Secret is now in environment variables on Render, which is secure. However:

1. **Never commit secrets to GitHub** (we didn't - they're only in Render env vars)
2. **Rotate API keys** if you share them publicly
3. **Use environment variables** in production (Render does this automatically)

### File Storage

**Cloudinary:**
- Stores ID documents
- Stores signatures
- Publicly accessible URLs

**Render (Local):**
- Keeps JSON submission records
- Location: `submissions/` folder
- Temporary file system (resets on redeploy)

---

## 🔧 Environment Variables Setup

### What Each Variable Does:

```
CLOUDINARY_CLOUD_NAME  = "dspag2aww"
  └─ Identifies your Cloudinary account

CLOUDINARY_API_KEY     = "576135641335578"
  └─ Allows uploads to your account

CLOUDINARY_API_SECRET  = "QGBFL9uUfnUGQvlEyKZ6WTCPC3c"
  └─ Authenticates with Cloudinary
```

### For Local Development

If you want to test locally with Cloudinary:

1. Create a `.env` file in your project:
```
CLOUDINARY_CLOUD_NAME=dspag2aww
CLOUDINARY_API_KEY=576135641335578
CLOUDINARY_API_SECRET=QGBFL9uUfnUGQvlEyKZ6WTCPC3c
```

2. Install dotenv:
```bash
npm install dotenv
```

3. At the top of `server.js`, add:
```javascript
require('dotenv').config();
```

4. Now it reads from `.env` file locally

---

## 🐛 Troubleshooting

### "Build failed on Render"

**Solution:** Check your build logs:
1. Go to Render dashboard
2. Select your service
3. Click **Logs**
4. Look for errors

Common issues:
- Missing `npm install` 
- Typo in start command
- Missing cloudinary package

### "Form won't submit"

**Check:**
1. Browser console (F12) for errors
2. Render logs for backend errors
3. Cloudinary API key is correct

### "Images not uploading"

**Check:**
1. Environment variables are set correctly in Render
2. Cloudinary credentials are valid
3. File is under 10MB

### "Signature not saving"

**Check:**
1. You drew on the canvas (not just clicked)
2. Certification checkbox is checked
3. Browser allows local storage

---

## 📊 Monitoring Your Deployment

### Check Server Status

Visit: `https://your-render-url.com/api/health`

Should return:
```json
{
  "status": "OK",
  "timestamp": "2024-02-17T10:30:00Z",
  "environment": "production"
}
```

### View Render Logs

1. Go to Render dashboard
2. Select your service
3. Click **Logs** tab
4. Watch real-time logs as users submit forms

### Check Cloudinary Usage

1. Go to [cloudinary.com/console](https://cloudinary.com/console)
2. Check **Stats & Usage**
3. See all uploaded files and bandwidth used

---

## 🔄 Update Your Form

If you need to make changes:

1. Edit files locally
2. Commit to GitHub:
```bash
git add .
git commit -m "Update form design"
git push origin main
```

3. Render automatically redeploys (watch the logs)

---

## 💡 Pro Tips

### 1. Custom Domain
- Render allows custom domains (paid plans)
- Register domain at GoDaddy/Namecheap
- Point to Render URL

### 2. Email Notifications
- Render can email you on deployment failures
- Settings → Email Preferences

### 3. Auto-Deploy
- Every GitHub push triggers a new deploy
- Disable: Service Settings → Auto-Deploy

### 4. Database
- For production: Add MongoDB/PostgreSQL
- Currently storing JSON files (no database)

### 5. Backup Submissions
- Download JSON from Render regularly
- Or integrate with Google Drive/Dropbox

---

## 📱 Your Live Form URL

Once deployed, your form will be available at:

```
https://contract-partnership-form-xxxx.onrender.com
```

Share this link with users! They can fill the form from anywhere.

---

## 🎉 You're Live!

Your contract partnership form is now:
- ✅ **Live on Render** (accessible worldwide)
- ✅ **Images on Cloudinary** (secure cloud storage)
- ✅ **Automated deployment** (changes sync with GitHub)
- ✅ **Free tier** (starting with Render Free plan)

**Congratulations!** 🚀

---

## 📞 Support Resources

- **Render Help:** [render.com/docs](https://render.com/docs)
- **Cloudinary Docs:** [cloudinary.com/documentation](https://cloudinary.com/documentation)
- **Node.js Deployment:** [nodejs.org/en/knowledge/](https://nodejs.org/en/knowledge/)

---

## Next Steps

1. ✅ Push to GitHub
2. ✅ Deploy to Render
3. ✅ Test the form
4. ✅ View files in Cloudinary
5. ✅ Share the live URL

You're all set! 🎊
