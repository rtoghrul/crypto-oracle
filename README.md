# ⚡ Crypto Oracle — AI Intelligence Dashboard

Real-time crypto intelligence: news, whale tracking, political analysis, trending tokens, and AI investment signals.

---

## 🚀 Deploy to Vercel (FREE — 5 minutes)

### STEP 1 — Get your OpenRouter API Key

1. Go to **https://openrouter.ai**
2. Sign up or log in
3. Click **"Keys"** in the left menu
4. Click **"Create Key"** → copy the key (starts with `sk-or-...`)
5. ⚠️ Save it somewhere safe — you won't see it again

---

### STEP 2 — Upload code to GitHub

1. Go to **https://github.com** → sign up / log in
2. Click **"New repository"** (green button, top right)
3. Name it `crypto-oracle`, set to **Public**, click **Create**
4. On the next screen, click **"uploading an existing file"**
5. Drag and drop ALL files from this folder into the upload area
6. Click **"Commit changes"**

---

### STEP 3 — Deploy on Vercel

1. Go to **https://vercel.com** → sign up with your GitHub account
2. Click **"Add New Project"**
3. Find and select your `crypto-oracle` repository → click **Import**
4. Before clicking Deploy, click **"Environment Variables"**
5. Add:
   - **Name:** `OPENROUTER_API_KEY`
   - **Value:** paste your OpenRouter key from Step 1
6. Click **Add** then click **Deploy**
7. Wait ~60 seconds... 🎉 Your site is live!

Vercel gives you a URL like: `https://crypto-oracle-yourname.vercel.app`

---

## 💻 Run Locally (Optional)

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env.local
# Edit .env.local and paste your API key

# 3. Start development server
npm run dev

# 4. Open http://localhost:3000
```

---

## 📁 Project Structure

```
crypto-oracle/
├── pages/
│   ├── index.js          ← Main UI
│   ├── _app.js           ← App wrapper
│   └── api/
│       └── analyze.js    ← Backend API (keeps key secret)
├── styles/
│   └── globals.css       ← All styles
├── .env.example          ← Template for API key
├── .gitignore            ← Keeps .env.local out of GitHub
└── package.json
```

---

## 🔐 Security

Your API key is stored as a Vercel **Environment Variable** — it lives on the server and is NEVER exposed to users visiting your site. The `.gitignore` file ensures it's never accidentally pushed to GitHub.

---

## ✨ Features

- 📡 **Crypto News** — Real-time AI-analyzed news briefings
- 🐋 **Whale Tracker** — Large holder movement analysis  
- 🏛️ **Politics & Macro** — Regulatory and macro environment
- 🔥 **New Tokens** — Emerging projects with potential
- ⚡ **AI Signal** — BULLISH / BEARISH / NEUTRAL with reasoning
- 🕐 **History** — Click any past analysis to revisit it
- ⌨️ **Quick Scans** — One-click common queries

---

## ⚠️ Disclaimer

This tool is for informational purposes only. Not financial advice. Always do your own research. Crypto involves significant risk.
