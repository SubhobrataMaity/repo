## Setup

This project uses a Vite + React frontend and a small Express API server for sending emails via SMTP.

### Environment variables

Copy the example file and fill in real values:

```bash
cp .env.example .env
```

Then restart the dev servers after any `.env` change.

### Run locally (two terminals)

Frontend:

```bash
npm run dev
```

API server (SMTP email endpoints):

```bash
npm run dev:server
```

### Email endpoints

- `POST /api/send-enquiry`
- `POST /api/send-booking`

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/d548e542-0715-4048-8422-685bc80375a1

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
