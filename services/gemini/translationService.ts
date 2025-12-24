import { GenerateContentResponse } from "@google/genai";
import { Settings } from "../../types";
import { executeWithKeyRotation } from './apiExecutor';

export async function detectLanguage(apiKeys: string[], model: string, text: string, settings: Settings): Promise<string> {
  if (!text.trim()) return 'en'; // Default to English for empty string
  try {
    const payload = {
      model,
      contents: `I am an expert polyglot AI, a specialized model built for one single, precise purpose: to identify the primary language of a given text. I operate with maximum efficiency and precision.

My response consists exclusively of the corresponding two-letter ISO 639-1 code for the detected language. I will not provide any greetings, explanations, or additional characters.

Text: "${text}"`,
    };

    console.log('--- KChat API Call ---');
    console.log('API: detectLanguage (via models.generateContent)');
    console.log('Payload:', payload);
    console.log('----------------------');

    const response = await executeWithKeyRotation<GenerateContentResponse>(apiKeys, (ai) =>
      ai.models.generateContent(payload),
      settings.apiBaseUrl
    );
    const langCode = response.text.trim().toLowerCase();
    // Also accept 3-letter codes, though 2 is standard
    return (langCode.length === 2 || langCode.length === 3) ? langCode : 'en';
  } catch (error) {
    console.error("Error detecting language:", error);
    throw new Error("Language detection failed.");
  }
}

export async function translateText(apiKeys: string[], model: string, text: string, sourceLang: string, targetLang: string, mode: 'natural' | 'literal', settings: Settings): Promise<string> {
  // Corrected: Use one continuous template literal for the entire prompt.
  const naturalPrompt = `I am a master cultural translator, a true native speaker of ${targetLang}. My purpose is to translate text from ${sourceLang} with the fluency and heart of a local. I go beyond literal meaning, infusing the translation with natural, idiomatic expressions and the authentic rhythm of everyday speech.

My sole output is the final, evocative translation. No preambles, no explanations, just the pure translated text.

Text to translate:
${text}
`;

  // Corrected: Use one continuous template literal for the entire prompt.
  const literalPrompt = `I am a high-fidelity linguistic engine. My core function is to perform a standard, literal translation from ${sourceLang} to ${targetLang}. I prioritize direct meaning and structural accuracy, ensuring the original text is conveyed with clinical precision.

My response consists solely of the translated text. There will be no additional context, preambles, or explanations.

Text to translate:
${text}
`;

  const prompt = mode === 'natural' ? naturalPrompt : literalPrompt;

  try {
    const payload = { model, contents: prompt };

    console.log('--- KChat API Call ---');
    console.log('API: translateText (via models.generateContent)');
    console.log('Payload:', payload);
    console.log('----------------------');

    const response = await executeWithKeyRotation<GenerateContentResponse>(apiKeys, (ai) =>
      ai.models.generateContent(payload),
      settings.apiBaseUrl
    );
    return response.text.trim();
  } catch (error) {
    console.error("Error translating text:", error);
    throw new Error("Translation failed.");
  }
}
