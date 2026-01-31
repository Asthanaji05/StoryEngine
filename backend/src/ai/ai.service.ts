import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
  }

  /**
   * Extract narrative elements from narration text
   */
  async extractNarrativeElements(narration: string, context?: any) {
    const prompt = this.buildExtractionPrompt(narration, context);

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON response
      return JSON.parse(text);
    } catch (error) {
      console.error('Error extracting narrative elements:', error);
      throw new Error('Failed to extract narrative elements');
    }
  }

  /**
   * Build prompt for entity extraction
   */
  private buildExtractionPrompt(narration: string, context?: any): string {
    return `You are a hyper-competent Narrative Intelligence Engine. Your goal is to understand a creator's story as they narrate it naturally.

Narration Snippet: "${narration}"

${context ? `Previous Story Context: ${JSON.stringify(context)}` : ''}

CRITICAL TASK:
Analyze the narration and extract key narrative components. Be intelligent about implied connections (e.g., if someone "forms a gang with friends", those friends are characters, and the gang is an organization).

Extract and return ONLY a valid JSON object:
{
  "characters": [
    {
      "name": "character name",
      "attributes": {
        "description": "brief physical/personality description",
        "traits": ["trait1", "trait2"],
        "internal_conflict": "optional brief description"
      },
      "confidence": 0.0-1.0
    }
  ],
  "locations": [
    {
      "name": "location name",
      "attributes": {
        "description": "ambiance/sensory details",
        "type": "city/room/planet/etc"
      },
      "confidence": 0.0-1.0
    }
  ],
  "organizations": [
    {
      "name": "organization name",
      "attributes": {
        "type": "gang/company/group/etc",
        "description": "purpose/vibe"
      },
      "confidence": 0.0-1.0
    }
  ],
  "events": [
    {
      "title": "Short title (e.g., 'The Founding of Toman')",
      "description": "Detailed narrative significance",
      "characters_involved": ["names"],
      "location": "name",
      "emotional_tone": "hope/dread/joy/etc",
      "importance": 1-10,
      "is_turning_point": boolean
    }
  ],
  "connections": [
    {
      "from": "Entity A",
      "to": "Entity B",
      "type": "founded/loves/hates/member_of/rivals/located_at",
      "weight": 1-10,
      "emotional_charge": -10 to +10,
      "description": "reason for connection"
    }
  ]
}

Rules:
1. DO NOT invent information not present or strongly implied.
2. If an entity was mentioned before, keep its name consistent.
3. Be specific about Emotional Tone and Significance.
4. Return ONLY the JSON object. No preamble or markdown blocks.`;
  }

  /**
   * Generate intelligent response as narrative listener
   */
  async generateListenerResponse(narration: string, context?: any): Promise<string> {
    const prompt = `You are an empathetic story listener. A creator just told you this in their story:

"${narration}"

${context ? `Story context: ${JSON.stringify(context)}` : ''}

Respond in 1-2 sentences as a supportive listener who:
- Reflects their narrative intent
- Shows you understand the emotional weight
- Never suggests what should happen next (that's their story)

Your response:`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating listener response:', error);
      return 'I hear you. Tell me more.';
    }
  }
}
