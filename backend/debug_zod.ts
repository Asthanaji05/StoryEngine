
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const AttributeSchema = z.object({
    description: z.string().optional().describe("Physical or personality description"),
    traits: z.array(z.string()).optional().describe("Key personality traits"),
    current_emotion: z.string().optional().describe("Emotion shown in this specific narration"),
    sentiment_score: z.number().min(-10).max(10).optional().describe("Sentiment analysis score"),
    type: z.string().optional().describe("Type of location/org if applicable"),
});

const CharacterSchema = z.object({
    name: z.string().describe("The resolved full name of the character."),
    mention_phrase: z.string().describe("The exact phrase used to refer to them."),
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
    characters_involved: z.array(z.string()).describe("Names of characters involved"),
    location: z.string().optional().describe("Location name where it happened"),
    emotional_tone: z.string().describe("e.g. Hopeful, Tense, Tragic"),
    importance: z.number().min(1).max(10).describe("Narrative weight 1-10"),
    is_turning_point: z.boolean().describe("If this changes the story significantly"),
});

const ConnectionSchema = z.object({
    from: z.string().describe("Source entity name"),
    to: z.string().describe("Target entity name"),
    type: z.string().describe("Nature of connection (e.g. loves, hates)"),
    weight: z.number().min(1).max(10).describe("Strength 1-10"),
    emotional_charge: z.number().min(-10).max(10).describe("Positive/Negative charge"),
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
    listener_response: z.string().describe("Empathetic 1-sentence listener response"),
});

const jsonSchema = zodToJsonSchema(AnalysisSchema as any);
console.log(JSON.stringify(jsonSchema, null, 2));
