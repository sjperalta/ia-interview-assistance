Build a mobile app called “Interview AI Assistant” using React Native (Expo) + Supabase + DeepSeek API.

GOAL:
Create a real-time interview assistant that listens for interviewer questions, transcribes speech instantly, sends questions to DeepSeek, and displays concise responses to the user.

TECH STACK:
- Frontend: React Native with Expo
- Backend: Supabase (Auth only)
- AI Model: DeepSeek API
- Speech-to-Text: Deepgram or Whisper API
- Text-to-Speech: Expo Speech
- State Management: Zustand or React Query
- Local Storage: AsyncStorage
- Architecture: Feature-based modular architecture

CORE FEATURES:

1. Authentication
- Email/password login with Supabase Auth
- Persist session

2. Live Interview Screen
- Microphone permission request
- Start / Stop listening button
- Real-time status:
  - Listening
  - Detecting speech
  - Transcribing
  - Thinking

3. Voice Activity Detection
- Detect when interviewer starts speaking
- Capture audio chunk
- Stop when silence detected

4. Instant Transcription
- Convert audio to text using STT provider
- Show transcript on screen

5. DeepSeek AI Response
- Send transcript to DeepSeek
- Return short interview answers in bullet points

6. Response UI
Show:

Question:
[transcript]

Suggested Answer:
- concise bullets
- natural wording
- easy to read fast

7. Whisper Mode
Optional button:
- Read answer quietly using Expo Speech

8. Local History
Store previous sessions locally using AsyncStorage:
- question
- answer
- created_at

FEATURE-BASED FRONTEND ARCHITECTURE:

/src
  /app
    navigation
    providers
    store
    theme

  /shared
    components
    hooks
    utils
    constants
    services

  /features
    /auth
      screens
      hooks
      services

    /interview
      screens
      components
      hooks
      services
      store

    /speech
      services
      hooks

    /history
      screens
      services
      hooks

    /settings
      screens
      hooks

CODING RULES:
- TypeScript everywhere
- Feature owns its logic
- Shared only reusable code
- Components small and reusable
- Hooks for business logic
- Service files for API calls

UX REQUIREMENTS:
- Clean dark modern UI
- Fast interactions
- Minimal distractions
- Mobile-first

AI PROMPT RULES:
Return answers:
- concise
- human sounding
- max 3 bullet points
- optimized for interviews

DELIVER:
1. Full feature-based folder structure
2. React Native Expo app
3. Supabase auth setup
4. DeepSeek integration service
5. Local history storage
6. Reusable clean code
7. Setup instructions

Focus on MVP first.