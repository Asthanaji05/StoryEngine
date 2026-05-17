import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

// --- Zod Schemas ---

const AttributeSchema = z.object({
  description: z
    .string()
    .optional()
    .describe("Physical or personality description"),
  traits: z.array(z.string()).optional().describe("Key personality traits"),
  current_emotion: z
    .string()
    .optional()
    .describe("Emotion shown in this specific narration"),
  sentiment_score: z
    .number()
    .min(-10)
    .max(10)
    .optional()
    .describe("Sentiment analysis score"),
  type: z.string().optional().describe("Type of location/org if applicable"),
});

const CharacterSchema = z.object({
  name: z.string().describe("The resolved full name of the character."),
  mention_phrase: z
    .string()
    .describe("The exact phrase used to refer to them."),
  attributes: AttributeSchema,
  confidence: z.number().min(0).max(1).describe("Confidence score 0.0-1.0"),
});

const SimpleElementSchema = z.object({
  name: z.string().describe("The resolved full name."),
  mention_phrase: z.string().describe("The exact phrase used."),
  attributes: AttributeSchema,
  confidence: z.number().min(0).max(1).describe("Confidence score 0.0-1.0"),
});

const EventSchema = z.object({
  title: z.string().describe("Short title for the event"),
  description: z.string().describe("Detailed significance of the event"),
  characters_involved: z
    .array(z.string())
    .describe("Names of characters involved"),
  location: z.string().optional().describe("Location name where it happened"),
  emotional_tone: z.string().describe("e.g. Hopeful, Tense, Tragic"),
  importance: z.number().min(1).max(10).describe("Narrative weight 1-10"),
  is_turning_point: z
    .boolean()
    .describe("If this changes the story significantly"),
});

const ConnectionSchema = z.object({
  from: z.string().describe("Source entity name"),
  to: z.string().describe("Target entity name"),
  type: z.string().describe("Nature of connection (e.g. loves, hates)"),
  weight: z.number().min(1).max(10).describe("Strength 1-10"),
  emotional_charge: z
    .number()
    .min(-10)
    .max(10)
    .describe("Positive/Negative charge"),
  description: z.string().describe("Reason for the connection"),
});

const AnalysisSchema = z.object({
  extracted: z.object({
    characters: z.array(CharacterSchema).default([]),
    locations: z.array(SimpleElementSchema).default([]),
    organizations: z.array(SimpleElementSchema).default([]),
    events: z.array(EventSchema).default([]),
    connections: z.array(ConnectionSchema).default([]),
  }),
  listener_response: z
    .string()
    .describe("Empathetic 1-sentence listener response"),
});

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
    // Use the latest model that supports structured output well
    this.model = this.genAI.getGenerativeModel(
      { model: "gemini-2.0-flash-lite" },
      { apiVersion: "v1beta" },
    );
  }

  /**
   * Analyze narration to extract elements and generate a response in a single pass.
   */
  async analyzeNarration(narration: string, context?: any) {
    const existingEntities =
      context?.entities?.length > 0
        ? `Existing Story Entities: ${context.entities.join(", ")}`
        : "No existing entities yet.";

    const prompt = `You are a hyper-competent Narrative Intelligence Engine. 
    
    TASK: Analyze the narration and extract key narrative components (characters, locations, events, connections).
    Also generate a brief, empathetic 1-sentence "listener_response" acknowledging the developments.

    Narration: "${narration}"
    ${existingEntities}
    ${context?.recentEvents ? `Recent Story Events: ${JSON.stringify(context.recentEvents)}` : ""}

    CRITICAL: 
    1. If a character/location matches an existing entity name, use that EXACT name.
    2. Do not invent details not present in the text.
    `;

    try {
      console.log("[AiService] Analyzing narration with Structured Output...");

      const jsonSchema = zodToJsonSchema(AnalysisSchema as any, {
        $refStrategy: "none",
      });
      // Helper to clean schema for Gemini
      const cleanSchema = (schema: any) => {
        if (!schema || typeof schema !== "object") return;
        delete schema.$schema;
        delete schema.additionalProperties;

        // Recursively clean children
        if (schema.properties) {
          Object.values(schema.properties).forEach(cleanSchema);
        }
        if (schema.items) {
          cleanSchema(schema.items);
        }
        if (schema.anyOf) {
          schema.anyOf.forEach(cleanSchema);
        }
        if (schema.allOf) {
          schema.allOf.forEach(cleanSchema);
        }
        if (schema.oneOf) {
          schema.oneOf.forEach(cleanSchema);
        }
      };

      cleanSchema(jsonSchema);

      const result = await this.model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: jsonSchema,
        },
      });

      const responseText = result.response.text();
      // Ensure we parse and validate with Zod to be safe
      const parsed = AnalysisSchema.parse(JSON.parse(responseText));

      return parsed;
    } catch (error) {
      console.error("[AiService] Analysis failed:", error);
      // Fallback for safety
      return {
        extracted: {
          characters: [],
          locations: [],
          organizations: [],
          events: [],
          connections: [],
        },
        listener_response: "I'm listening. Please continue.",
      };
    }
  }

  // ... (Keep existing extraction logic for backwards compatibility if needed, but analyzeNarration replaces it) ...
  // Keeping simulateCharacterDialogue and brainstorm as they are distinct interactions,
  // though they could also be upgraded to schemas later.

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
]`;

    try {
      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      // Simple clean for now
      const clean = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      return JSON.parse(clean);
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
2. Keep it brief (2-3 sentences max).
3. If the user asks about something you shouldn't know, express confusion.

Your Response:`;

    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error("[AiService] Error simulating dialogue:", error);
      return `[${characterName} looks at you silently.]`;
    }
  }
}
