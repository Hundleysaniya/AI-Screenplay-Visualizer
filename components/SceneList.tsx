import React from 'react';
import type { Scene } from '../types';
import SceneCard from './SceneCard';

interface SceneListProps {
    scenes: Scene[];
    onGenerateKeyframe: (sceneId: number, editPrompt?: string) => void;
    onLockCharacter: (imageBase64: string) => void;
    characterReferences: string[];
}

const SceneList: React.FC<SceneListProps> = ({ scenes, onGenerateKeyframe, onLockCharacter, characterReferences }) => {
    return (
        <div className="space-y-8">
            {scenes.map((scene, index) => (
                <React.Fragment key={scene.id}>
                    <SceneCard 
                        scene={scene}
                        onGenerateKeyframe={onGenerateKeyframe}
                        onLockCharacter={onLockCharacter}
                        isLocked={characterReferences.includes(scene.keyframe_image_base64 ?? '')}
                    />
                    {index < scenes.length - 1 && scene.transition_prompt && (
                         <div className="flex items-center justify-center">
                            <div className="w-full border-t border-dashed border-gray-600"></div>
                            <span className="px-4 py-1 text-sm font-semibold tracking-wider text-cyan-400 bg-gray-700 rounded-full whitespace-nowrap -translate-y-1/2">
                                {scene.transition_prompt}
                            </span>
                            <div className="w-full border-t border-dashed border-gray-600"></div>
                        </div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

export default SceneList;