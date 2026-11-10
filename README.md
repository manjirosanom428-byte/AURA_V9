# AURA V9

AURA V9 is a browser-based personal AI assistant with a Node.js/Express backend.

## Current features
- Username registration and login (bcrypt password hashing).
- Chat history and new-chat controls.
- AI provider configuration through server environment variables.
- Language-matching instructions for Tamil, Tanglish, English, Hindi, Telugu, Malayalam, Kannada and other languages supported by the chosen model.
- Browser speech input/output and a two-way **Better Call** voice-conversation prototype.
- PDF text extraction in the browser (PDF.js); the user explicitly chooses when to send extracted text to AURA.
- Video transcript helper: user supplies captions/transcript for AURA to analyse.
- PWA manifest, icon and basic static-shell service worker.
- AURA visual effects and music search shortcuts.

## Run locally
1. Install Node.js.
2. Run `npm install`.
3. Copy `.env.example` values into your local environment (do not commit real secrets).
4. Configure `OPENAI_API_KEY`, `OPENAI_MODEL`, and optionally `OPENAI_BASE_URL`.
5. Run `npm start`.
6. Open `http://localhost:3000`.

If no cloud API key is configured, the server attempts local Ollama at `127.0.0.1:11434`; this fallback is not automatically available on cloud hosts.

## Deploy
- Build command: `npm install`
- Start command: `npm start`
- Set provider credentials only in the host's private environment-variable settings.
- Open `/api/test` to check that the server responds.

## Important limitations before public launch
- This is a prototype, not a production-secure service. API routes currently identify users using a client-supplied user ID; secure server sessions, authorization, rate limiting, CSRF protection, input validation and security review are required before handling private data or opening public registration.
- User and conversation data currently lives in `aura-data.json`. Use a managed database and persistent storage before relying on long-term history.
- Better Call uses browser Speech Recognition and Speech Synthesis. Browser support, microphone permission and HTTPS are required; language detection is approximate. It is an AI voice conversation, not a telephone call.
- PDF.js extracts selectable text from PDFs. Scanned/image-only PDFs need OCR and are not supported by this reader yet. Up to 80 pages and 18,000 characters are sent when the user chooses Ask AURA.
- Video analysis currently uses transcript/captions pasted by the user. AURA does not automatically retrieve YouTube captions or analyse arbitrary video streams.
- PWA installation is supported where the browser offers it. A signed native Android APK, native wake-word service, floating overlay, Quick Settings tile, native contacts/call integration and background microphone service are not included yet.
- Features have not been certified through a production security audit or full Android device test.

## Privacy
Do not upload confidential documents or sensitive personal information until the production-security and data-storage limitations above are addressed.

## Android APK build (prepared)

The repository includes a Capacitor configuration and a manual GitHub Actions workflow at **Actions → Build AURA V9 Android APK → Run workflow**.

1. Enter the HTTPS URL of the deployed AURA V9 backend when starting the workflow.
2. Wait for the Android build to finish.
3. Open the workflow run and download the `AURA-V9-Android-debug` artifact.
4. Extract the artifact ZIP to obtain `app-debug.apk`.

The workflow packages the current website files into a local Android app shell and routes `/api/*` requests to the backend URL supplied at build time. A real deployed backend URL is required; do not use a guessed or expired URL.

This produces a **debug/testing APK**, not a Play Store release. A signed release build, native microphone/wake-word service, floating overlay, contacts integration and full device testing are separate tasks. Browser Speech Recognition may not be available in Android WebView, so Better Call must be tested and may need a native speech plugin.
