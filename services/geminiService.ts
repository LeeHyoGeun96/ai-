import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AspectRatio, ReferenceImage } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const splitStoryIntoScenes = async (story: string, characterLabels: string[], backgroundLabels: string[]): Promise<string[]> => {
  try {
    const detailedPrompt = `You are an expert prompt engineer for the Gemini 2.5 Flash Image model. Your task is to break down the following story into a sequence of scenes.

You have been provided with a list of character labels and background labels. When generating the prompt for EACH scene, you MUST decide which character and background from the lists are relevant and include them using the exact format: [CHARACTER: label_name] and/or [BACKGROUND: label_name]. If no specific reference is needed for a scene, do not include the tags.

Available Character Labels: ${characterLabels.join(', ') || 'None'}
Available Background Labels: ${backgroundLabels.join(', ') || 'None'}

For EACH scene, generate a highly detailed image generation prompt following this structure:
1.  **Reference Tags:** Start with [CHARACTER: label] or [BACKGROUND: label] if applicable.
2.  **Action/Goal:** Clearly state what is happening.
3.  **Subject & Attributes:** Describe the main subject's specific actions, expressions, and interactions in this scene. Rely on the reference image for appearance, but describe the dynamic elements.
4.  **Environment & Lighting:** Describe the scene's lighting, atmosphere, and camera angle.
5.  **Style & Finishing:** Define the artistic style.

Combine these into a single, cohesive paragraph for each scene's prompt.

Here is the story: "${story}"`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: detailedPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
            description: "A highly detailed prompt for a storyboard scene, including [CHARACTER: label] or [BACKGROUND: label] tags where appropriate."
          },
        },
      },
    });

    const jsonString = response.text;
    const scenes = JSON.parse(jsonString);
    return Array.isArray(scenes) ? scenes : [];
  } catch (error) {
    console.error("Error splitting story into scenes:", error);
    return [];
  }
};

const generateReferenceImage = async (prompt: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        const firstPart = response.candidates?.[0]?.content?.parts[0];
        if (firstPart && 'inlineData' in firstPart && firstPart.inlineData) {
            return firstPart.inlineData.data;
        }
        return null;
    } catch (error) {
        console.error("Error generating reference image:", error);
        return null;
    }
};

export const createCharacterReference = async (story: string): Promise<ReferenceImage | null> => {
    try {
        console.log("AI is creating a character reference...");
        const descriptionPrompt = `Read the following story and create a single, detailed visual description of the main character. This description will be used to generate a reference image. Focus on consistent physical traits, clothing, and overall appearance. The output should be a single, descriptive prompt for an image generator. Describe the character in a neutral pose, full body, plain background.

Story: "${story}"`;

        const descResponse = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: descriptionPrompt,
        });
        const characterDescription = descResponse.text;
        console.log("Generated Character Description:", characterDescription);

        if (!characterDescription) return null;

        const base64 = await generateReferenceImage(characterDescription + ", full body character sheet, plain white background, neutral pose, detailed face.");
        if (!base64) return null;

        return {
            id: self.crypto.randomUUID(),
            label: "주요 캐릭터",
            file: new File([], "ai-character.png", { type: 'image/png' }),
            base64,
            mimeType: 'image/png'
        };

    } catch (error) {
        console.error("Error creating character reference:", error);
        return null;
    }
}

export const createBackgroundReference = async (story: string): Promise<ReferenceImage | null> => {
    try {
        console.log("AI is creating a background reference...");
        const descriptionPrompt = `Read the following story and create a single, detailed visual description of the primary setting or background. This description will be used to generate a reference image. Focus on the environment, mood, and key architectural or natural elements. The output should be a single, descriptive prompt for an image generator. Describe the scene without any characters.

Story: "${story}"`;
        
        const descResponse = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: descriptionPrompt,
        });
        const backgroundDescription = descResponse.text;
        console.log("Generated Background Description:", backgroundDescription);

        if (!backgroundDescription) return null;

        const base64 = await generateReferenceImage(backgroundDescription + ", empty scene, no people, wide angle view.");
        if (!base64) return null;

        return {
            id: self.crypto.randomUUID(),
            label: "주요 배경",
            file: new File([], "ai-background.png", { type: 'image/png' }),
            base64,
            mimeType: 'image/png'
        };
    } catch (error) {
        console.error("Error creating background reference:", error);
        return null;
    }
}


export const generateImageForScene = async (
  prompt: string,
  aspectRatio: AspectRatio,
  stylePrompt: string,
  characters: ReferenceImage[],
  backgrounds: ReferenceImage[],
): Promise<string | null> => {
    try {
        let finalPrompt = prompt;
        const parts: any[] = [];
        
        // Match character and background from prompt
        const charRegex = /\[CHARACTER: (.*?)]/g;
        const bgRegex = /\[BACKGROUND: (.*?)]/g;
        
        const charMatch = charRegex.exec(finalPrompt);
        if (charMatch) {
            const charLabel = charMatch[1];
            const character = characters.find(c => c.label === charLabel);
            if (character) {
                parts.push({ text: "Use the provided character image as a strong reference for the main character's appearance."});
                parts.push({ inlineData: { data: character.base64, mimeType: character.mimeType } });
            }
        }

        const bgMatch = bgRegex.exec(finalPrompt);
         if (bgMatch) {
            const bgLabel = bgMatch[1];
            const background = backgrounds.find(b => b.label === bgLabel);
            if (background) {
                parts.push({ text: "Use the provided background image as a strong reference for the scene's environment."});
                parts.push({ inlineData: { data: background.base64, mimeType: background.mimeType } });
            }
        }
        
        // Clean tags from prompt
        finalPrompt = finalPrompt.replace(charRegex, '').replace(bgRegex, '').trim();

        if (stylePrompt) {
            finalPrompt += ` Official style override: ${stylePrompt}.`;
        }
        parts.unshift({ text: finalPrompt });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        const firstPart = response.candidates?.[0]?.content?.parts[0];
        if (firstPart && 'inlineData' in firstPart && firstPart.inlineData) {
            return firstPart.inlineData.data;
        }
        return null;
    } catch (error) {
        console.error("Error generating image:", error);
        return null;
    }
};

export const convertImageToSketch = async (base64Image: string, mimeType: string): Promise<string | null> => {
    try {
        const parts: any[] = [
            { inlineData: { data: base64Image, mimeType } },
            { text: "Convert this image into a clean, black and white line art sketch. Maintain the original composition and aspect ratio." }
        ];

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        const firstPart = response.candidates?.[0]?.content?.parts[0];
        if (firstPart && 'inlineData' in firstPart && firstPart.inlineData) {
            return firstPart.inlineData.data;
        }
        return null;
    } catch (error) {
        console.error("Error converting to sketch:", error);
        return null;
    }
};