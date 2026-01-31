[1] AI's ONLY job: Identify potential entities and events.
User's job: Confirm or correct EVERYTHING.


User: "Mikey forms Toman with his friends"

[AI Processing - SIMPLE VERSION]
1. Entity Recognition: ["Mikey", "Toman", "friends"]
2. Event Detection: "forms" → action creating organization
3. Store as PENDING suggestions:
   - Entity: Mikey (character, confidence: 0.9)
   - Entity: Toman (organization, confidence: 0.8)
   - Event: "Organization formation" (timeline_position: 0.3)

[User Interface]
"Here's what I understood. Please confirm:"
✓ Mikey (character)
✓ Toman (organization)
✓ Event: "Toman formed" at position 30%

[ONLY AFTER USER CONFIRMS]
Update narrative_elements, story_moments


[2] Now AI can start connecting dots, but STILL requires confirmation:

User (later): "Toman disbands the same day"

[AI Processing - SMARTER VERSION]
1. Recognize "Toman" exists (confirmed entity)
2. Recognize "disbands" → status change event
3. Check timeline: Same day as formation
4. Store suggestions:
   - Event: "Toman disbanded" (position: 0.3)
   - Entity Update: Toman.status = "disbanded"
   - FLAG: "Potential narrative paradox: formed/disbanded same day"

[User Interface - WITH CONTEXT]
"Wait, Toman disbanded on the same day it was formed?"
- ✓ Yes, that's dramatic
- ✗ No, fix the timeline
- Add note: "Actually, it was disbanded secretly"

[User chooses "Yes, that's dramatic"]
AI asks: "This creates an emotional arc from hope to despair. Track this?"

[3]  Intelligent Assistance 

AI can now suggest:
1. "Mikey's leadership trait increased here"
2. "This breaks the pattern of him being reckless"
3. "In Indian gang stories, this would be followed by..."

But STILL: "Do you want to track Mikey's leadership growth?"
[Track] [Ignore] [Modify]


[4]  HOW WE MAP TO PAST SCENES WITHOUT "AI MAGIC"
The Secret: Index Everything User Confirms

[5] The "Find Past Scenes" Feature:
text
User asks: "What did we say about Mikey's leadership?"

[System Response - NO AI, just facts]
"Mikey's leadership mentioned in:
1. Scene 3: 'Mikey took charge naturally' (your words)
2. Scene 7: 'The others looked to Mikey for direction'
3. Scene 12: 'Even when scared, Mikey led them'

Would you like to see these scenes?"

THE HARD CONSTRAINTS WE MAINTAIN
Constraint 1: No Auto-Populated Emotional Scores
sql
-- WRONG in Phase 1:
emotional_signature jsonb -- { "fear": 8, "intensity": 9 }

-- RIGHT in Phase 1:
user_noted_emotions text[] -- User manually tags emotions
-- Later: "Would you like to mark this as a fearful moment?" [Tag Fear]
Constraint 2: No Auto-Generated Relationship Weights
sql
-- WRONG in Phase 1:
weight integer -- AI calculates 0-10

-- RIGHT in Phase 1:
relationship_strength text -- User selects: 'weak', 'medium', 'strong'
-- Later: "Mikey and Draken seem close. How would you describe their bond?"
Constraint 3: Timeline is User-Ordered, Not AI-Ordered
sql
-- WRONG:
timeline_position float -- AI calculates 0.0-1.0

-- RIGHT:
timeline_order integer -- User drags and drops events
-- Later: "This feels like a midpoint. Move it here?" [Drag suggestion]

