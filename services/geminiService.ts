import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { RawScene, Scene } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateScreenplay(storyIdea: string): Promise<RawScene[]> {
    const model = 'gemini-2.5-pro';
    
    const prompt = `
        You are a professional screenplay writer. Your task is to take a story idea and turn it into a screenplay.
        The screenplay must be broken down into individual scenes. Each scene should represent approximately 8 seconds of screen time.
        Format your response as a JSON object containing a single key "scenes". The value should be an array of scene objects.
        Each scene object must have the following keys:
        - "scene_number": An integer for the scene number, starting from 1.
        - "setting": A string describing the location and time (e.g., "INT. COFFEE SHOP - DAY").
        - "action_dialogue": A string describing the actions and any dialogue within the scene. Keep it concise for an 8-second duration.

        Here is the story idea:
        ---
        ${storyIdea}
        ---
        Generate the screenplay now.
    `;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    scenes: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                scene_number: { type: Type.INTEGER },
                                setting: { type: Type.STRING },
                                action_dialogue: { type: Type.STRING }
                            },
                            required: ["scene_number", "setting", "action_dialogue"]
                        }
                    }
                }
            }
        }
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    return result.scenes;
}

export async function generateVisualsForScene(
    scene: RawScene, 
    nextScene?: RawScene
): Promise<{ visual_prompt: string; transition_prompt: string }> {
    const model = 'gemini-2.5-flash';
    
    const visualPromptTask = `
        You are a visual artist creating a keyframe for a movie scene. Based on the following scene description, create a detailed and concise visual prompt for an AI image generator. The prompt should capture the mood, characters, setting, and key action.
        ---
        Scene Setting: ${scene.setting}
        Scene Action/Dialogue: ${scene.action_dialogue}
        ---
        Generate the visual prompt.
    `;
    
    const visualResponsePromise = ai.models.generateContent({ model, contents: visualPromptTask });

    let transitionResponsePromise: Promise<any> = Promise.resolve({ text: '' });
    if (nextScene) {
        const transitionPromptTask = `
            You are a film editor. Describe a cinematic transition between the following two scenes.
            ---
            From Scene:
            Setting: ${scene.setting}
            Action/Dialogue: ${scene.action_dialogue}
            ---
            To Scene:
            Setting: ${nextScene.setting}
            Action/Dialogue: ${nextScene.action_dialogue}
            ---
            Generate a concise transition prompt (e.g., "MATCH CUT to a spinning wheel", "SMASH CUT to black", "SLOW DISSOLVE to the next scene").
        `;
        transitionResponsePromise = ai.models.generateContent({ model, contents: transitionPromptTask });
    }

    const [visualResponse, transitionResponse] = await Promise.all([visualResponsePromise, transitionResponsePromise]);

    return {
        visual_prompt: visualResponse.text.trim(),
        transition_prompt: transitionResponse.text.trim() || 'CUT TO:',
    };
}

export async function generateKeyframeImage(
    prompt: string,
    characterReferencesBase64: string[] = [],
    existingImageBase64?: string,
    editPrompt?: string,
): Promise<string> {
    const model = 'gemini-2.5-flash-image';
    
    const parts: any[] = [];
    let textPrompt: string;

    if (existingImageBase64 && editPrompt) {
        // EDITING MODE: Use existing image and edit prompt
        parts.push({
            inlineData: {
                data: existingImageBase64,
                mimeType: 'image/png'
            }
        });
        textPrompt = editPrompt;
        // Optionally add character references during edit too
        characterReferencesBase64.forEach(refBase64 => {
             parts.push({
                inlineData: { data: refBase64, mimeType: 'image/jpeg' }
            });
        });
        if(characterReferencesBase64.length > 0) {
            textPrompt = `Using the reference characters, apply this edit: ${editPrompt}`;
        }

    } else {
        // GENERATION MODE: Use character references or just the prompt
        characterReferencesBase64.forEach(refBase64 => {
            parts.push({
                inlineData: {
                    data: refBase64,
                    mimeType: 'image/jpeg' 
                }
            });
        });

        if (characterReferencesBase64.length > 0) {
            textPrompt = `Using the character(s) in the provided image(s) as a reference, create an image for the following prompt: ${prompt}`;
        } else {
            textPrompt = prompt;
        }
    }
    
    parts.push({ text: textPrompt });

    const response = await ai.models.generateContent({
        model,
        contents: { parts },
        config: {
            responseModalities: [Modality.IMAGE],
        }
    });

    const firstPart = response.candidates?.[0]?.content?.parts?.[0];
    if (firstPart && firstPart.inlineData) {
        return firstPart.inlineData.data;
    }

    throw new Error('No image data returned from API.');
}