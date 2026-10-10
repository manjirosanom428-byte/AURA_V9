# AURA V9 — Website + Android launch guide (Tanglish)

## Ippo project-la irukkura improvements
- PWA manifest + AURA V9 SVG icon.
- Service worker static page cache; API requests offline cache pannaadhu.
- AI backend supports a cloud OpenAI-compatible chat-completions API through server environment variables, with local Ollama fallback.
- Hollow Purple overlay exists in the chat UI; this is a visual effect, not a real AI model feature.

## Website deploy (phone browser)
1. ZIP extract panni project files-ai GitHub repo `AURA_V9`-la upload/update pannu.
2. GitHub-la `.env`, real API keys, `aura-data.json`, passwords upload panna koodadhu. `.env.example` template mattum safe.
3. Render dashboard → New + → Web Service → GitHub repo connect.
4. Build command: `npm install`; Start command: `npm start`.
5. Render Environment settings-la `OPENAI_API_KEY` add pannu; `OPENAI_MODEL` = `gpt-4o-mini` (or account-ku available-aana compatible model), `OPENAI_BASE_URL` = `https://api.openai.com/v1`. API key-ku billing/usage limits provider side-la configure pannu. Key-ai chat-la share pannaadhe.
6. Deploy aana URL-la `/api/test` open panni `AURA V9 API is working!` varudha paaru. App-la register/login test pannu; then chat test pannu.

## Data persistence / security caveats
- Current app stores users/conversations in `aura-data.json`; Render filesystem may reset across deploy/restarts unless persistent disk configured. For real users, move to managed database before relying on history.
- Current auth flow is a prototype, not production-grade session security. Do not use sensitive/private data. Add secure sessions, rate limiting, validation, CSRF protections where appropriate, and database migration before public launch.
- If no `OPENAI_API_KEY` is set, server falls back to Ollama at `127.0.0.1:11434`; on cloud that usually fails unless Ollama is hosted on the same machine. Set the cloud provider variables for hosted chat.

## Install website on Android
1. Website must be deployed over HTTPS.
2. Android Chrome-la site URL open pannu → menu (⋮) → `Install app` / `Add to Home screen` if offered.
3. Idhu PWA/home-screen app. Signed native APK illa; offline mode-la AI/API work aagaadhu.

## Native Android APK
- This ZIP still does not contain a completed native Android APK or Android Studio project. APK build requires a separate Capacitor/native Android project and Android build tooling (or a trusted cloud build service), followed by device testing and signing.
- Native background wake-word, contacts permission + call flow, confirmed call-connection detection, Quick Settings tile, and native call controls require native Android implementation and user-granted permissions. They are NOT implemented by this web/PWA update.

## Not yet complete
Voice wake word/background listening; real contact lookup and call connection status; full two-way voice-call UI/language selector; image/video/music generation APIs and daily quota enforcement; Android Quick Settings tile; durable database and secure production sessions. These require provider choices, credentials where applicable, native code, and testing.
