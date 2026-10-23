# SparthillIBM2026

This repository contains the CivicSignal San José-area prototype and its planning documents. The app is in [`civicsignal_render/`](civicsignal_render/); see its [README](civicsignal_render/README.md) for setup, current capabilities, and limitations.

Run locally with Node.js:

```powershell
cd civicsignal_render
node server.js
```

Open <http://127.0.0.1:4173/>. The current analysis is a clearly labeled local demo; IBM Bob is not connected. Copy `civicsignal_render/.env.example` to `civicsignal_render/.env.local` for local settings. Never commit API keys, passwords, or resident reports. Each teammate's local reports file is separate; this repository does not provide shared storage or production authentication.

For a shareable, no-storage web preview, use the root [`render.yaml`](render.yaml) with Render Blueprints. The hosted preview intentionally disables saving and the private tracker; see the app README for deployment steps.
