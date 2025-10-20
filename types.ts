export interface Scene {
    id: number;
    scene_number: number;
    setting: string;
    action: string;
    dialogue_vo: string;
    visual_prompt?: string;
    transition_prompt?: string;
    keyframe_image_base64?: string;
    isGeneratingImage?: boolean;
}

export interface RawScene {
    scene_number: number;
    setting: string;
    action: string;
    dialogue_vo: string;
}

export interface ScreenplayData {
    title: string;
    thumbnail_prompt: string;
    scenes: RawScene[];
}