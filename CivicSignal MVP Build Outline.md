# CivicSignal MVP Build Outline

## Purpose

Build a responsive web app that helps a resident turn a community concern into a clear, editable, source-linked next step. CivicSignal should demonstrate this journey in a short live walkthrough:

**Describe an issue → review an AI-assisted summary → see a suggested service with its evidence → choose what to do next.**

This is a hackathon prototype. It must not claim to submit a report to a government agency or to resolve an issue. Keep the resident in control throughout.

## Product promise

> CivicSignal turns a community concern into a sourced, editable next step, so residents can find the right public service with more clarity and control.

The distinguishing product choices are evidence-linked recommendations, visible uncertainty, resident review before action, and a clear follow-up step. Describe this as our intended distinction, not as a proven claim that competitors lack these features.

## Primary user and demo scenario

- **Primary user:** a resident who sees a local issue and is unsure which public service or decision-maker handles it.
- **Demo scenario:** a resident describes a sample neighborhood concern. The app summarizes and categorizes it, suggests a likely service based on a small directory, displays why it suggested that service and where the information came from, then lets the resident edit the draft and choose a next step.
- Use fictional/sample issue content in the demo. Clearly label sample reports and directory entries as demo data unless the team has checked and sourced real local information.

## MVP scope

### Required

1. Guided issue intake.
2. AI-assisted summary and category suggestion.
3. Service routing from a small, curated directory.
4. Source and rationale displayed alongside each suggested route.
5. Confidence-aware behavior: ask a follow-up, show alternatives, or say it is unsure.
6. Editable report draft with an explicit user-controlled next step.
7. A small demo activity view using synthetic reports.
8. Privacy, data, and prototype-status disclosures.

### Out of scope for the hackathon MVP

- Actually filing reports with a city, campus, or other agency.
- Accounts, identity verification, or collection of contact information.
- Live status updates from agency systems.
- Public comments, voting, or user-to-user messaging.
- Real-time maps, precise geolocation, or exact street addresses.
- Claims that issue routing or resolution has been independently validated.

## Information architecture and screens

### 1. Home — `/`

**Goal:** Explain the value quickly and start the report flow.

- Brand: CivicSignal.
- Headline: “Find the right next step for a community concern.”
- One-sentence explanation that CivicSignal helps organize an issue and find relevant public resources.
- Primary button: **Start a report**.
- Secondary link: **See how it works**.
- Small trust note: AI suggestions are drafts; users review before sharing. Do not enter sensitive personal information.
- Optional preview of a sample sourced service card.

### 2. Issue intake — `/report`

**Goal:** Gather enough context for a useful suggestion without collecting unnecessary personal data.

Fields:
- **What happened?** Required multiline description.
- **Issue type** Optional selector: street or sidewalk, lighting, waste, noise, park or public space, transit, other, not sure.
- **Area** Optional neighborhood or general landmark; do not request precise coordinates or a home address.
- **When did you notice it?** Optional date or “Not sure.”

Behavior:
- Show a reminder not to include names, phone numbers, or other sensitive personal details.
- Validate that the description is not empty.
- Submit button: **Find a next step**.
- Provide a clear loading state and a useful error/retry state.
- Keep form inputs available if the user returns from results.

### 3. Results and review — `/results`

**Goal:** Make the AI output transparent and actionable.

Sections:
- **Suggested summary:** concise draft, editable inline or with an edit control.
- **Suggested category:** editable or changeable.
- **Suggested next step:** primary service recommendation, with agency/service name, short rationale, source title and link, and source freshness label where available.
- **Other possible routes:** show up to two alternatives only when the directory supports them.
- **Confidence state:** use plain labels such as “Likely match,” “More information needed,” or “No clear match.” Do not display a made-up numeric confidence percentage.
- **Clarifying question:** if a missing detail meaningfully changes the route, ask one question before giving a strong recommendation.
- **User actions:** edit draft, copy draft, start over, or open the official resource. Label external links.
- **Submission truth:** state that CivicSignal has not submitted anything. Do not create a success state that implies agency receipt.

When the match is weak, explain what is uncertain and offer search/official directory links or a manual-help path instead of guessing.

### 4. Community pulse — `/community` (lightweight demo screen)

**Goal:** Show how structured reports could help reveal recurring concerns without exposing individual residents.

- Display a small list or simple chart of synthetic sample issues by broad category.
- Add a persistent **Demo data** label.
- Do not show names, contact information, exact addresses, or small groups that could identify a person.
- Include a note that this view illustrates a future capability; sample data is not a measure of actual community conditions.

### 5. About and trust — `/about` or a compact modal/panel

- Explain what AI does: draft summary, suggest category, and search the demo directory.
- Explain what AI does not do: make official decisions, submit issues, or guarantee a result.
- Explain what data the prototype keeps. Prefer session-only state and no backend persistence for MVP.
- Link to sources used in the demo directory.

## Core interaction flow

1. User starts from Home.
2. User describes a concern and optionally adds broad area, issue type, and date.
3. App sends the description through the summarization/routing function (or a clearly labeled deterministic demo fallback).
4. App shows a concise editable summary and likely category.
5. App matches against a small service directory and presents source-backed route(s).
6. User checks and edits the draft, opens the source, copies the report text, or starts over.
7. App clearly states that no official report has been filed.

## AI and routing behavior

Keep AI behind a small replaceable interface, for example `analyzeIssue(input) -> { summary, category, routes, confidenceLabel, clarifyingQuestion }`.

- If an approved model/API is configured, use it for summarization and category suggestions. Validate structured output before rendering it.
- If no model credentials are available, provide a deterministic rule-based demo mode. Label it in the UI as a demo suggestion; do not imply an external AI service is running.
- The model may only select route records from the supplied directory. It must not invent agencies, phone numbers, URLs, response times, policies, or eligibility requirements.
- Store route records with fields such as `id`, `name`, `description`, `issueTypes`, `area`, `url`, `sourceName`, `sourceUrl`, `lastChecked`, and `demoOnly`.
- Return the route record IDs used so the UI can show the underlying source.
- If no record is a reasonable fit, return the “No clear match” state rather than a fabricated route.
- Keep model output separate from verified directory facts in both data and presentation.

## Suggested component outline

- `AppShell`: responsive header, navigation, main content, footer.
- `HomePage`: value proposition and start action.
- `ReportForm`: fields, validation, privacy reminder.
- `AnalysisState`: loading, error, retry.
- `ResultsPage`: summary editor, category, route cards, confidence/fallback, action buttons.
- `SourceCard`: agency/service details and evidence links.
- `CommunityPulsePage`: synthetic aggregate examples and demo label.
- `TrustDisclosure`: AI, privacy, and no-submission disclosures.
- `analyzeIssue`: provider abstraction with demo fallback.
- `serviceDirectory`: small local data file with source metadata.

## Visual and interaction direction

- Calm, civic, and approachable. Use high contrast, clear typography, generous spacing, and restrained teal/navy accents.
- Make the next action obvious, but avoid alarmist colors for routine issues.
- Use plain-language labels; avoid government acronyms unless explained.
- Make forms and controls keyboard accessible, visibly focusable, and labeled for screen readers.
- At mobile widths, stack form fields and route cards; keep primary actions easy to reach.
- Include complete empty, loading, error, low-confidence, and success-like states. The terminal state is “next step prepared,” never “issue resolved.”

## Data and privacy defaults

- No account required.
- No analytics or persistent storage required for MVP.
- Keep form and result data in memory/session state; clear it when the user starts over or closes the demo.
- Do not request names, email, phone, exact address, photos, or sensitive traits.
- Use synthetic records in the community pulse screen.
- Do not send user descriptions to a third-party model unless the team has checked the provider, configured it intentionally, and disclosed that behavior in the UI.

## Definition of done

- A first-time visitor can understand CivicSignal and start in one click.
- A non-empty issue description produces a readable summary and category suggestion.
- At least one sample issue maps to a directory entry and the result displays a working source link.
- An unsupported or ambiguous issue produces a transparent fallback rather than an invented answer.
- The user can edit or copy the draft and can restart the flow.
- The UI never implies that the report was filed or resolved.
- Community examples are labeled synthetic/demo data and contain no personal details.
- The experience works at mobile and desktop widths and supports keyboard navigation.
- The app can be demonstrated without secrets or paid API credentials using the deterministic demo mode.

## Suggested build order

1. Create the app shell, navigation, and responsive visual system.
2. Build the intake form and local state flow.
3. Add the service directory and deterministic analysis fallback.
4. Build the results view with source cards, edit/copy actions, and low-confidence state.
5. Add the synthetic community pulse screen and trust disclosures.
6. Polish loading/error states and rehearse the sample walkthrough.
7. If time permits, connect a model provider through the analysis interface and verify the same fallback and truthfulness rules.

## Demo walkthrough script

1. Start on Home and state the problem: people often do not know where to take a community concern.
2. Enter a fictional/sample issue in plain language.
3. Show the suggested summary and category, then edit one detail.
4. Open the recommended route and point out its source and rationale.
5. Show an ambiguous example and how CivicSignal admits uncertainty.
6. Explain privacy, synthetic community data, and that the prototype prepares a next step but does not submit a report.

## Hackathon alignment

The public SpartHill Hacks Civic Engagement track calls for AI that connects people with services and decision-makers while protecting privacy, building trust, and promoting equitable participation. The event FAQ also emphasizes real community needs, sustainability, trust, privacy, and measurable impact. CivicSignal’s MVP should make those commitments visible in the product rather than leaving them only in the pitch.

References:
- Civic Engagement track: https://sparthillhack2026.vercel.app/about
- Hackathon FAQ: https://sparthillhack2026.vercel.app/faq
- Hackathon timeline: https://sparthillhack2026.vercel.app/timeline

## Instructions for the coding chat

Implement the MVP in the existing project and follow any repository-specific instructions. First inspect the current stack and available files, then use the simplest architecture that supports the flow above. Treat this outline as product behavior and scope; make reasonable UI and implementation choices without adding external integrations that imply real submissions or live agency data. Prioritize an end-to-end demo that works without API credentials.
