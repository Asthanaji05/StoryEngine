import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>("GEMINI_API_KEY");

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel(
      { model: "gemini-2.0-flash-lite" },
      { apiVersion: "v1beta" },
    );
  }

  /**
   * Extract narrative elements from narration text
   */
  async extractNarrativeElements(narration: string, context?: any) {
    const prompt = this.buildExtractionPrompt(narration, context);

    try {
      console.log(
        "[AiService] Extracting elements for:",
        narration.substring(0, 50) + "...",
      );
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

      console.log("[AiService] Raw extraction response:", text);

      // Clean up markdown formatting if present
      if (text.includes("```json")) {
        text = text.split("```json")[1].split("```")[0];
      } else if (text.includes("```")) {
        text = text.split("```")[1].split("```")[0];
      }

      // Parse JSON response
      return JSON.parse(text.trim());
    } catch (error) {
      console.error("[AiService] Error extracting narrative elements:", error);
      throw new Error(`Failed to extract narrative elements: ${error.message}`);
    }
  }

  /**
   * Build prompt for entity extraction with context-aware resolution
   */
  private buildExtractionPrompt(narration: string, context?: any): string {
    const existingEntities =
      context?.entities?.length > 0
        ? `Existing Story Entities (Use these for resolution/aliasing): ${context.entities.join(", ")}`
        : "No existing entities yet.";

    return `You are a hyper-competent Narrative Intelligence Engine. Your goal is to understand a creator's story as they narrate it naturally.

Narration Snippet: "${narration}"

${existingEntities}
${context?.recentEvents ? `Recent Story Events: ${JSON.stringify(context.recentEvents)}` : ""}

CRITICAL TASK:
Analyze the narration and extract key narrative components. 

ENTITY RESOLUTION RULES:
1. If a character/location/org is mentioned by a partial name (e.g., "Virat") but matches an existing entity ("Virat Asthana"), map it to the EXACT existing name.
2. DO NOT create duplicate entities if they refer to the same person/place.
3. If an entity is new, provide its full, formal name if implied.

Extract and return ONLY a valid JSON object:
{
  "characters": [
    {
      "name": "EXACT match from existing or full new name",
      "mention_phrase": "the specific snippet describing them here",
      "attributes": {
        "description": "brief physical/personality description",
        "traits": ["trait1", "trait2"],
        "current_emotion": "hope/dread/etc",
        "sentiment_score": -10 to +10
      },
      "confidence": 0.0-1.0
    }
  ],
  "locations": [
    {
      "name": "EXACT match or full name",
      "mention_phrase": "snippet",
      "attributes": { "description": "vibe", "type": "city/room/etc" },
      "confidence": 0.0-1.0
    }
  ],
  "organizations": [
    {
      "name": "EXACT match or full name",
      "mention_phrase": "snippet",
      "attributes": { "type": "group/etc", "description": "vibe" },
      "confidence": 0.0-1.0
    }
  ],
  "events": [
    {
      "title": "Short title",
      "description": "Detailed narrative significance",
      "characters_involved": ["names - MUST MATCH RESOLVED NAMES"],
      "location": "name",
      "emotional_tone": "hope/dread/joy/etc",
      "importance": 1-10,
      "is_turning_point": boolean
    }
  ],
  "connections": [
    {
      "from": "Resolved Name A",
      "to": "Resolved Name B",
      "type": "founded/loves/hates/member_of/rivals/located_at",
      "weight": 1-10,
      "emotional_charge": -10 to +10,
      "description": "reason"
    }
  ]
}

Rules:
1. DO NOT invent information not present or strongly implied.
2. Return ONLY JSON. No preamble.`;
  }

  /**
   * Generate intelligent response as narrative listener
   */
  async generateListenerResponse(
    narration: string,
    context?: any,
  ): Promise<string> {
    const prompt = `You are an empathetic, hyper-intelligent story listener. A creator just told you this:

"${narration}"

${context ? `Recent Story Events: ${JSON.stringify(context)}` : ""}

Respond in 1-2 sentences as a supportive consciousness that:
- Acknowledges new characters or entities introduced.
- Reflects the emotional weight and narrative significance.
- Keeps the focus on the creator's vision.
- Tone: Encouraging, insightful, slightly mysterious but deeply attentive.

Your response:`;

    try {
      console.log(
        "[AiService] Generating listener response for:",
        narration.substring(0, 50) + "...",
      );
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log("[AiService] Listener response:", text);
      return text;
    } catch (error) {
      console.error("[AiService] Error generating listener response:", error);
      return "I hear you. Tell me more.";
    }
  }
  /**
   * Brainstorm story title and description options based on context
   */
  async brainstormStoryTheme(context: any) {
    const prompt = `You are a world-class narrative architect. Based on the following world bible and timeline, suggest 3 distinct "Vibes" for this story.
Each vibe should have a compelling title and a 1-sentence evocative description.

World Bible (Characters, Places, etc.): ${JSON.stringify(context.entities)}
Timeline (Key Events): ${JSON.stringify(context.moments)}

Return ONLY a valid JSON array of objects:
[
  { "title": "Option 1 Title", "description": "Evocative summary" },
  { "title": "Option 2 Title", "description": "Evocative summary" },
  { "title": "Option 3 Title", "description": "Evocative summary" }
]

Rules:
1. Make them distinct (e.g., one Noir, one Operatic, one Intimate).
2. Return ONLY JSON.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

      if (text.includes("```json")) {
        text = text.split("```json")[1].split("```")[0];
      } else if (text.includes("```")) {
        text = text.split("```")[1].split("```")[0];
      }

      return JSON.parse(text.trim());
    } catch (error) {
      console.error("[AiService] Error brainstorming theme:", error);
      return [];
    }
  }
  /**
   * Simulate a conversation with a specific character
   */
  async simulateCharacterDialogue(
    characterName: string,
    attributes: any,
    userPrompt: string,
    context: any,
  ) {
    const prompt = `You are playing the role of a character in a story.
    
Character Name: ${characterName}
Character Attributes/Traits: ${JSON.stringify(attributes)}
Recent Story Events: ${JSON.stringify(context.moments)}

The creator (User) asks you: "${userPrompt}"

CRITICAL RULE:
1. Speak ONLY as this character. Use their voice, slang, world-view, and limitations.
2. Do not break character. Do not be an assistant.
3. Keep it brief (2-3 sentences max) unless aksed to elaborate.
4. If the user asks about something you shouldn't know, express confusion or suspicion.

Your Response:`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("[AiService] Error simulating dialogue:", error);
      return `[${characterName} looks at you silently, unable to find the words.]`;
    }
  }
}
