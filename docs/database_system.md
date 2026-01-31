# Story Engine - Database System

This document outlines the architectural rationale and schema of the Story Engine database. Our database is designed to treat user input as **sacred** while maintaining a highly structured **narrative model** that the AI can traverse and visualize.

---

## 1. Core Principles
- **Narration is Sacred**: We never modify or delete `raw_narrations`. They are the immutable log of the creator's intent.
- **Relational Intelligence**: The "truth" of the story is stored in a graph-like structure (`narrative_elements` + `narrative_connections`) to allow for deep-dive analysis.
- **Timeline Logic**: Every event and connection is normalized to a `0.0` to `1.0` position, allowing for non-linear storytelling and easy visualization.

---

## 2. Table Schema

### 2.1 `profiles`
Extends Supabase Auth to store decorative user data.
- `id` (UUID, PK): References `auth.users`.
- `display_name` (Text): Public name of the creator.
- `avatar_url` (Text): Profile image link.

### 2.2 `stories`
The root container for a story world.
- `id` (UUID, PK): Unique identifier.
- `user_id` (UUID): Owner of the story.
- `title` (Text): Name of the story.
- `genre` (Text): Used as a constraint for AI tone (e.g., "Cyberpunk", "Fantasy").
- `language` (Text): Default 'en'.

### 2.3 `raw_narrations` (The Sacred Log) 🎙️
Every word written or spoken by the user.
- `id` (UUID, PK): Unique identifier.
- `story_id` (UUID): Parent story.
- `content` (Text): The raw user input.
- `sequence_number` (Integer): Absolute order of narration.
- `listener_response` (Text): The AI's empathetic response to this specific snippet.
- `extracted` (JSONB): A snapshot of the AI's understanding at the exact moment of narration.

### 2.4 `narrative_elements` (The Atoms) 👤
Canonical records for characters, locations, and organizations.
- `id` (UUID, PK): Unique identifier.
- `element_type` (Text): 'character', 'location', or 'organization'.
- `name` (Text): The formal name of the entity.
- `attributes` (JSONB): Dynamic data like `traits`, `hair_color`, `fears`.
- `confidence_score` (Float): AI's certainty that this element is distinct and real.

### 2.5 `story_moments` (The Timeline) ⏳
Discrete events extracted from the narration.
- `id` (UUID, PK): Unique identifier.
- `title` (Text): Short summary (e.g., "The Betrayal").
- `timeline_position` (Float): 0.0 to 1.0 (The "When").
- `characters_involved` (UUID[]): Array of IDs from `narrative_elements`.
- `emotional_signature` (JSONB): The intensity of emotions (e.g., `{ "fear": 8, "intensity": 9 }`).

### 2.6 `narrative_connections` (The Nexus) 🕸️
Relationships between narrative elements.
- `id` (UUID, PK): Unique identifier.
- `from_id` & `to_id` (UUID): Source and Target elements.
- `connection_type` (Text): e.g., 'rivals', 'loves', 'member_of'.
- `weight` (Integer): Strength of the relationship (0-10).
- `emotional_charge` (Integer): Positive vs. Negative charge (-10 to +10).

### 2.7 `entity_mentions` (The Journey) 📂
Granular log of every time an element appeared in the narration.
- `id` (UUID, PK): Unique identifier.
- `element_id` (UUID): Which entity was mentioned.
- `narration_id` (UUID): In which specific narration.
- `mention_context` (Text): The specific phrase or snippet where they appeared.
- `emotional_state` (JSONB): How the character was feeling *specifically in this scene*.

---

## 3. Data Flow Rationale
When a user narrates:
1. **Append** to `raw_narrations`.
2. **AI Analysis** looks for entities and events.
3. **Merge/Update** `narrative_elements`: If "Virat" is mentioned but "Virat Asthana" exists, we resolve them to the same ID.
4. **Log** `entity_mentions`: This allows us to reconstruct a character's "Journey" in the Dossier tab without duplicating their main record.
5. **Update Graph**: `narrative_connections` are updated to reflect shifting alliances.

This structure allows the engine to be both a **listening partner** (via narrations) and a **world archaeologist** (via elements and connections).
