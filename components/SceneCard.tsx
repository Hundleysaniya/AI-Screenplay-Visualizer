import React, { useState } from 'react';
import type { Scene } from '../types';
import Spinner from './Spinner';
import { LockClosedIcon } from './icons';

interface SceneCardProps {
    scene: Scene;
    onGenerateKeyframe: (sceneId: number, editPrompt?: string) => void;
    onLockCharacter: (imageBase64: string) => void;
    isLocked: boolean;
    onImageClick: (base64: string) => void;
}

const SceneCard: React.FC<SceneCardProps> = ({ scene, onGenerateKeyframe, onLockCharacter, isLocked, onImageClick }) => {
    const [editPrompt, setEditPrompt] = useState('');

    const handleDownloadImage = () => {
        if (!scene.keyframe_image_base64) return;
        const a = document.createElement('a');
        a.href = `data:image/png;base64,${scene.keyframe_image_base64}`;
        a.download = `scene_${scene.scene_number.toString().padStart(3, '0')}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };
    
    return (
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-cyan-500/20 hover:border-cyan-700">
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Side: Script & Prompts */}
                <div>
                    <div className="mb-4">
                        <span className="text-sm font-bold text-cyan-400 bg-gray-700 px-3 py-1 rounded-full">SCENE {scene.scene_number}</span>
                        <h3 className="text-xl font-semibold mt-2 text-gray-200">{scene.setting}</h3>
                    </div>
                    <div className="mb-4 p-4 bg-gray-900 rounded-lg border border-gray-700">
                        <h4 className="font-semibold text-gray-400 mb-1">Action & Dialogue</h4>
                        <p className="text-gray-300">{scene.action_dialogue}</p>
                    </div>
                    {scene.visual_prompt && (
                        <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
                            <h4 className="font-semibold text-gray-400 mb-1">Keyframe Prompt</h4>
                            <p className="text-gray-300 italic">"{scene.visual_prompt}"</p>
                        </div>
                    )}
                </div>

                {/* Right Side: Image Generation */}
                <div className="flex flex-col items-center justify-center bg-gray-900 p-4 rounded-lg border border-gray-700">
                    {scene.keyframe_image_base64 ? (
                        <div className="w-full group relative">
                            <img 
                                src={`data:image/png;base64,${scene.keyframe_image_base64}`} 
                                alt={`Keyframe for Scene ${scene.scene_number}`}
                                className="w-full h-auto object-cover rounded-md cursor-pointer"
                                onClick={() => onImageClick(scene.keyframe_image_base64!)}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button onClick={handleDownloadImage} className="px-3 py-2 text-sm bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors">Download</button>
                                <button 
                                    onClick={() => onLockCharacter(scene.keyframe_image_base64!)}
                                    disabled={isLocked}
                                    className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-500 disabled:bg-teal-700 disabled:cursor-not-allowed transition-colors"
                                >
                                    <LockClosedIcon className="w-4 h-4" />
                                    {isLocked ? 'Locked' : 'Lock Character'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full h-64 flex flex-col items-center justify-center text-center text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p>Generate keyframe to see it here.</p>
                        </div>
                    )}
                    
                    {scene.keyframe_image_base64 && (
                        <div className="w-full mt-4">
                            <label htmlFor={`edit-prompt-${scene.id}`} className="block text-sm font-medium text-gray-400 mb-1">
                                Make a change to the keyframe
                            </label>
                            <textarea
                                id={`edit-prompt-${scene.id}`}
                                value={editPrompt}
                                onChange={(e) => setEditPrompt(e.target.value)}
                                placeholder="e.g., Change the character's shirt to red, add rain."
                                className="w-full h-20 p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-shadow duration-200 resize-none placeholder-gray-500"
                                disabled={scene.isGeneratingImage}
                            />
                        </div>
                    )}

                    <button
                        onClick={() => onGenerateKeyframe(scene.id, scene.keyframe_image_base64 ? editPrompt : undefined)}
                        disabled={scene.isGeneratingImage || !scene.visual_prompt || (!!scene.keyframe_image_base64 && !editPrompt)}
                        className="mt-4 w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-teal-500 transition-colors"
                    >
                        {scene.isGeneratingImage ? (
                            <>
                                <Spinner /> {scene.keyframe_image_base64 ? 'Regenerating...' : 'Generating Keyframe...'}
                            </>
                        ) : ( scene.keyframe_image_base64 ? 'Regenerate Keyframe' : 'Generate Keyframe' )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SceneCard;