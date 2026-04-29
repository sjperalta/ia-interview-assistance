## ia-assistant (Expo)

### Setup

1. Install dependencies

```bash
npm install
```

2. Create your local env file

- Copy `.dev.example` to `.env`

```bash
cp .dev.example .env
```

- Fill in the values in `.env` (do **not** commit real keys)

3. Run the app

```bash
npm run start
```

### Environment variables

This app uses Expo public env vars (prefixed with `EXPO_PUBLIC_`) for client-side access.

#### `EXPO_PUBLIC_DEEPSEEK_API_KEY`

- **What it is**: API key used by `services/deepseek` to generate interview answers.
- **How to get it**: Create an API key in DeepSeek and paste it into `.env`.

Example:

```bash
EXPO_PUBLIC_DEEPSEEK_API_KEY=sk_your_deepseek_key
```

#### `EXPO_PUBLIC_DEEPGRAM_API_KEY`

- **What it is**: API key used by `features/speech` to transcribe audio (Deepgram STT).
- **How to get it**: Create an API key in Deepgram and paste it into `.env`.

Example:

```bash
EXPO_PUBLIC_DEEPGRAM_API_KEY=dg_your_deepgram_key
```

### Security note

Anything under `EXPO_PUBLIC_*` is bundled into the client app. Treat these keys as **exposed**:
- Prefer restricted keys with minimal permissions.
- Rotate keys if they were ever committed or shared.

