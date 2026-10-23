# CivicSignal — San José local demo

Run `node server.js` from this folder, then open <http://127.0.0.1:4173/>. Node.js 18+ is recommended. The default local mode binds only to `127.0.0.1`; do not deploy the local mode as a public service.

Residents can describe an issue, answer one focused follow-up at a time or opt out, review and edit the draft, and explicitly confirm a local save. The original wording and polished draft are saved together in `data/reports.json`. Exact address storage requires separate consent; reports containing recognizable email addresses or phone numbers are rejected until those details are removed. Nothing is submitted to an agency. The private **Reports** page groups confirmed records by issue type and shows their local department assignments or **Needs review** status.

Routes come from a small curated directory of City of San José and VTA service pages in `service-directory.js`. This is local triage guidance, not a live government integration. A city-only location for an asset-specific issue prompts for a landmark or cross street; residents can continue without one, but the route remains **Needs review**.

## Local configuration

Copy `.env.example` to `.env.local` and set `CIVICSIGNAL_ADMIN_PASSWORD` there. This file is ignored by Git. The local tracker password for this demo is already configured in that file; do not commit or publish it. The password is a lightweight local gate, not production authentication.

`IBM_BOB_API_KEY` also belongs in `.env.local`, never in `public/` or a browser request. However, setting the key alone does **not** activate AI. The exact IBM Bob inference endpoint, model or team identifier, authentication headers, and request/response schema are still needed. `analysis.js` marks the server-side integration boundary. Until that contract is known, the app clearly labels its deterministic analysis as **local demo**; it does not call IBM and cannot claim AI-verified mistakes.

The key shared in chat has not been copied into files. Because it was exposed in conversation, rotate it and use an inference-scoped replacement when the API contract is available.

## Data and testing

The real tracker file is `data/reports.json`; it is ignored by Git because records may contain precise locations. Back it up before clearing or migrating data. For isolated tests, set `CIVICSIGNAL_REPORTS_FILE` to a separate absolute JSON path. You may also set `PORT` to avoid the default `4173`.

Run `node --test test/flow.test.js` to test both the local save flow and the hosted demo's no-storage boundary.

## Public hosted preview

The repository's root `render.yaml` describes a Render web service. In Render, choose **New → Blueprint**, connect this GitHub repository, and approve the Blueprint. The service runs from `civicsignal_render/`, binds to Render's `PORT` on `0.0.0.0`, and redeploys when `main` changes. The free tier may spin down after inactivity, so the first visit can be slow.

The Blueprint sets `CIVICSIGNAL_MODE=hosted-demo`. In this mode `/api/analyze` still provides deterministic local-demo suggestions, but `/api/reports` and `/api/admin/reports` always reject requests; the page hides saving and the private tracker. **Do not add the local admin password or an IBM key to this public preview.** Use fictional examples, not real resident details. A shared report workflow needs durable storage, genuine authentication, abuse controls, and a separate security review before enabling collection.
