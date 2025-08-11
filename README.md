# MASTER HACKER - Secure Serverless Tool

Features:
- Hacking-style frontend (dark + green + red + yellow)
- Serverless proxy endpoints for AbstractAPI (keeps API key secret)
- Endpoints: /api/phone, /api/email, /api/emailrep, /api/vat, /api/iban

How to deploy:
1. Create a GitHub repo and push these files (preserve folder structure: `css/`, `js/`, `api/`).
2. Import repo into Vercel (New Project → Import Git Repository).
3. In Vercel Project Settings → Environment Variables add:
   - `ABSTRACT_API_KEY` = <your-abstractapi-key>
4. Deploy. After build, open the site URL.

Quick tests (after deploy):
- `https://<your-site>/api/email?q=hackingmasterk47@gmail.com`
- `https://<your-site>/api/phone?q=%2B923001234567`