/**
 * Google Gemini Integration for Node.js
 * AI-powered eligibility analysis and rule interpretation
 */

import axios from 'axios';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

class GeminiClient {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.GOOGLE_GEMINI_API_KEY;
    this.model = 'gemini-pro';
  }

  async isConfigured() {
    return !!this.apiKey;
  }

  /**
   * Analyze eligibility using Gemini
   */
  async analyzeEligibility(userProfile, schemeRules) {
    if (!this.apiKey) {
      return { error: 'Gemini API key not configured', fallback: true };
    }

    try {
      const prompt = `
Analyze the following user profile against the scheme eligibility rules and respond with ONLY valid JSON.

USER PROFILE:
${JSON.stringify(userProfile, null, 2)}

SCHEME RULES:
${schemeRules}

Respond with exactly this JSON structure (no markdown, no explanations):
{
  "is_eligible": boolean,
  "eligibility_score": number (0-100),
  "missing_requirements": ["requirement1", "requirement2"],
  "recommendations": ["action1", "action2"],
  "explanation": "brief explanation"
}
`;

      const response = await axios.post(
        `${GEMINI_API_URL}?key=${this.apiKey}`,
        {
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        },
        { timeout: 10000 }
      );

      const responseText = response.data.candidates[0].content.parts[0].text;
      
      // Clean up response (remove markdown code blocks if present)
      const cleanedText = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const result = JSON.parse(cleanedText);
      return result;
    } catch (error) {
      console.error('Gemini eligibility analysis failed:', error.message);
      return { error: error.message, fallback: true };
    }
  }

  /**
   * Extract rules from unstructured text
   */
  async extractRulesFromText(text) {
    if (!this.apiKey) {
      return { error: 'Gemini API key not configured' };
    }

    try {
      const prompt = `
Extract and structure the eligibility rules from the following text and respond with ONLY valid JSON.

TEXT:
${text}

Respond with exactly this JSON structure:
{
  "rules": ["rule1", "rule2"],
  "categories": ["category1"],
  "income_limits": { "min": 0, "max": 800000 },
  "age_limits": { "min": 18, "max": 65 },
  "document_requirements": ["doc1", "doc2"]
}
`;

      const response = await axios.post(
        `${GEMINI_API_URL}?key=${this.apiKey}`,
        {
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        },
        { timeout: 10000 }
      );

      const responseText = response.data.candidates[0].content.parts[0].text;
      const cleanedText = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const result = JSON.parse(cleanedText);
      return result;
    } catch (error) {
      console.error('Gemini rule extraction failed:', error.message);
      return { error: error.message };
    }
  }

  /**
   * Generate action roadmap
   */
  async generateActionRoadmap(userProfile, ineligibleReasons) {
    if (!this.apiKey) {
      return { error: 'Gemini API key not configured' };
    }

    try {
      const prompt = `
Generate a personalized action roadmap to improve eligibility. Respond with ONLY valid JSON.

Current Issues:
${ineligibleReasons.join('\n')}

User Profile:
${JSON.stringify(userProfile, null, 2)}

Respond with exactly this JSON structure:
{
  "steps": [
    { "action": "specific action", "timeline": "2 weeks", "priority": "high" },
    { "action": "another action", "timeline": "1 month", "priority": "medium" }
  ],
  "resources": ["link1", "contact1"],
  "estimated_completion": "3 months"
}
`;

      const response = await axios.post(
        `${GEMINI_API_URL}?key=${this.apiKey}`,
        {
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        },
        { timeout: 10000 }
      );

      const responseText = response.data.candidates[0].content.parts[0].text;
      const cleanedText = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const result = JSON.parse(cleanedText);
      return result;
    } catch (error) {
      console.error('Gemini roadmap generation failed:', error.message);
      return { error: error.message };
    }
  }

  /**
   * Answer chatbot questions
   */
  async answerQuestion(query, context = null) {
    if (!this.apiKey) {
      return { error: 'Gemini API key not configured', fallback: true };
    }

    try {
      const contextStr = context ? JSON.stringify(context) : '';
      
      const prompt = `
You are a helpful assistant for a government scheme eligibility platform. Answer the user's question concisely and accurately.

Context: ${contextStr}

User Query: ${query}

Provide a helpful response in under 200 words.
`;

      const response = await axios.post(
        `${GEMINI_API_URL}?key=${this.apiKey}`,
        {
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        },
        { timeout: 10000 }
      );

      const answer = response.data.candidates[0].content.parts[0].text;

      return {
        query,
        answer,
        model: this.model,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Gemini question failed:', error.message);
      return { error: error.message, fallback: true };
    }
  }

  /**
   * Translate text to regional languages
   */
  async translateText(text, language = 'hi') {
    if (!this.apiKey) {
      return { error: 'Gemini API key not configured' };
    }

    const languageNames = {
      hi: 'Hindi',
      mr: 'Marathi',
      ta: 'Tamil',
      te: 'Telugu'
    };

    try {
      const prompt = `
Translate the following text to ${languageNames[language] || language} while maintaining clarity and meaning. Respond with ONLY the translated text.

Text to translate:
${text}
`;

      const response = await axios.post(
        `${GEMINI_API_URL}?key=${this.apiKey}`,
        {
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        },
        { timeout: 10000 }
      );

      const translated = response.data.candidates[0].content.parts[0].text;
      return { original: text, translated, language };
    } catch (error) {
      console.error('Gemini translation failed:', error.message);
      return { original: text, translated: text, error: error.message };
    }
  }
}

export default GeminiClient;
