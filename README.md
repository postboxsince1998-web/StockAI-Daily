# StockAI Daily 📈
> **"Understand What Changed Today."**

Welcome to **StockAI Daily**, a beginner-friendly Indian stock-market daily analysis application.

---

## 🌟 Overview

- **Daily Market Analysis**: Plain-English explanations of NIFTY 50, SENSEX, BANK NIFTY, and key sector movements.
- **Stock Health Meter (0–100)**: Simple educational scoring based on profitability, growth, debt, and stability.
- **1-Minute Quick Recap**: A concise daily bullet-point summary of key stock events.
- **100% Free Data**: Uses Yahoo Finance public EOD endpoints and public RSS news feeds (no paid subscriptions needed).
- **Teacher AI Assistant**: Built-in Financial Teacher AI that answers questions in simple English out-of-the-box.

---

## 🚀 ZERO-COST CLOUD DEPLOYMENT GUIDE

Follow these simple steps to put your application online with **₹0 monthly cost** and **zero reliance on your local computer**.

### STEP 1: Push Code to GitHub
1. Open your terminal in `C:\Stock AI Daily`.
2. Push your repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Prepare StockAI Daily for Zero-Cost Cloud Deployment"
   git remote add origin https://github.com/YOUR_USERNAME/StockAI-Daily.git
   git push -u origin main
   ```

### STEP 2: Create a Free Persistent Database (Supabase)
1. Go to **[Supabase.com](https://supabase.com)** and click **Sign Up** (Sign in with your GitHub account).
2. Click **New Project**, name it `stockai-daily`, set a Database Password, and select region **Mumbai (India)**.
3. Once created, go to **Project Settings -> Database -> Connection String** and copy the URI (URI format starts with `postgresql://`).

### STEP 3: Migrate Local Data to Cloud Database
1. Open `.env` in your local project folder.
2. Add your Supabase connection string:
   ```env
   DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_PROJECT_ID].supabase.co:5432/postgres
   ```
3. Run the automated data migration script:
   ```bash
   npm run migrate-cloud
   ```
   *(This copies all your historical prices, market reports, news, and company records to your cloud database!)*

### STEP 4: Deploy Web Service on Render (Free Web Hosting)
1. Go to **[Render.com](https://render.com)** and sign in with GitHub.
2. Click **New +** -> **Web Service**.
3. Connect your `StockAI-Daily` GitHub repository.
4. Set the following settings:
   - **Name**: `stockai-daily`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build:frontend`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Under **Environment Variables**, add:
   - `DATABASE_URL`: *(Your Supabase connection string)*
   - `DATA_MODE`: `free`
6. Click **Create Web Service**. Render will generate your public HTTPS URL (e.g. `https://stockai-daily.onrender.com`).

### STEP 5: Set Up Automatic Daily Analysis (GitHub Actions)
1. Open your `StockAI-Daily` repository on GitHub.
2. Go to **Settings -> Secrets and variables -> Actions -> New repository secret**.
3. Name: `DATABASE_URL` | Value: *(Your Supabase connection string)*.
4. That's it! GitHub Actions will now automatically run `npm run daily-analysis` every trading day (Mon-Fri) at **4:30 PM IST** and update your live cloud database!

---

## ⚡ Manual Daily Analysis Trigger
You can also manually trigger the analysis anytime from your GitHub repository:
👉 **GitHub Repo -> Actions -> Daily StockAI Analysis Pipeline -> Run workflow**

---

## ⚠️ Disclaimer
*StockAI Daily provides educational market information and AI-generated explanations. It is NOT financial advice and does not guarantee investment returns.*
