# Story Engine - Evolution Roadmap (North Star Alignment)

## 🏁 The Commitment
"If we can't build a story notebook that's better than Notes + ChatGPT in 15 minutes for casual storytellers, we don't deserve to build the grand vision."

---

## Phase 1: Foundation & Invisible Consciousness ✅
- [x] **Stable Auth**: ES256 JWT validation with Supabase.
- [x] **Sacred Narration**: Raw user input is preserved unchanged in `raw_narrations`.
- [x] **AI Listener**: Gemini 2.0 Flash providing empathetic feedback.
- [x] **Entity Extraction**: Accuracy-focused extraction of Characters, Locations, and Orgs.

## Phase 2: Visual Truth (Establishing Trust) 🎙️
- [x] **Dynamic Timeline**: Sequence-based event placements.
- [x] **Nexus Graph**: Force-directed relationship visualization.
- [x] **Entity Dossier**: structured profiles with historical mentions.
- [x] **Trust Filter**: AI Confirmation loop for extractions.
- [x] **Inline Editing**: Users can correct AI suggestions before they become facts.
- [x] **Real-time Sync**: The UI updates dynamically as narrations are processed.
- [x] **Character Journey View & Sentiment Arc**: A vertical timeline showing a single character's emotional arc and key events.
- [x] **Entity Resolution**: The system can map aliases (e.g., "The Doctor") to a canonical entity (e.g., "Doctor Who").
- [ ] **Rewind & Correction**: Interface to edit "Narrative Truth" (Current Focus: UI/UX for editing AI's "Narrative Truth").

## Phase 3: The Narrative Partner (Co-Creation) 🎭
### [ ] Task 3.1: Rewind & Correction (Sovereignty) 🛠️
- [ ] Backend: Update element/moment endpoints (`PATCH /elements/:id`, `PATCH /moments/:id`).
- [ ] Frontend: "Master Edit" mode in Entity Dossier to fix AI-confirmed facts.
- [ ] Validation: Prevent narrative paradoxes during manual edits.

### [ ] Task 3.2: Intelligent Interview (Void Breaker) 🎙️
- [ ] AI Service: `generateFollowupQuestion` based on extracted entities.
- [ ] UI: "Deepen Context" prompt in narration sidebar.
- [ ] Logic: Only trigger when narration is sparse or a new entity is "mysterious".

### [ ] Task 3.3: Context-Aware Suggestions (The Ghostwriter) 👻
- [ ] AI Service: `getStoryIdeas` using RAG over `narrative_elements`.
- [ ] UI: "What if..." floating suggestions.

## Phase 4: Mastery & Professionalism 📄
- [ ] **Story Gamification**: XP for depth, badges for consistency.
- [ ] **Professional Export**: World Bible (Markdown), Screenplay, or Novel formats.
- [ ] **Living World Mode**: Talk to your characters using their established history.

---

## 🛠️ Active Architectural Tasks
- [x] **Centralized baseApi**: RTK Query injection structure.
- [x] **Entity Resolution**: Aliasing system (map "Virat" -> "Virat Asthana").
- [ ] **Nexus Propagation**: Ensure connection changes reflect in the graph instantly.
- [ ] **RAG Preparation**: Vectorizing `raw_narrations` for "Long-term Story Memory".
