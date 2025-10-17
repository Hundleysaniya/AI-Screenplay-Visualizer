import React, { useState, useCallback } from 'react';
import type { Scene } from './types';
import { generateScreenplay, generateVisualsForScene, generateKeyframeImage } from './services/geminiService';
import { downloadTextFile, downloadImagesAsZip } from './utils/fileUtils';
import Header from './components/Header';
import IdeaInput from './components/IdeaInput';
import SceneList from './components/SceneList';
import DownloadControls from './components/DownloadControls';
import CharacterManagement from './components/CharacterImageUpload';

const App: React.FC = () => {
    const [storyIdea, setStoryIdea] = useState<string>('');
    const [screenplay, setScreenplay] = useState<Scene[]>([]);
    const [characterReferences, setCharacterReferences] = useState<{ base64: string }[]>([]);
    const [isLoadingScript, setIsLoadingScript] = useState<boolean>(false);
    const [isLoadingVisuals, setIsLoadingVisuals] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateScript = useCallback(async () => {
        if (!storyIdea.trim()) {
            setError('Please enter a story idea.');
            return;
        }
        setIsLoadingScript(true);
        setError(null);
        setScreenplay([]);
        setCharacterReferences([]);
        
        try {
            const scenes = await generateScreenplay(storyIdea);
            setScreenplay(scenes.map(s => ({ ...s, id: s.scene_number })));
            
            setIsLoadingVisuals(true);
            const visualPromises = scenes.map((scene, index) => 
                generateVisualsForScene(scene, scenes[index + 1])
            );
            const visuals = await Promise.all(visualPromises);
            
            setScreenplay(currentScenes => currentScenes.map((scene, index) => ({
                ...scene,
                visual_prompt: visuals[index].visual_prompt,
                transition_prompt: visuals[index].transition_prompt,
            })));

        } catch (err) {
            console.error(err);
            setError('Failed to generate screenplay. Please check your API key and try again.');
        } finally {
            setIsLoadingScript(false);
            setIsLoadingVisuals(false);
        }
    }, [storyIdea]);
    
    const handleAddReference = (image: { file: File, base64: string }) => {
        if (!characterReferences.some(ref => ref.base64 === image.base64)) {
            setCharacterReferences(prev => [...prev, { base64: image.base64 }]);
        }
    };

    const handleLockCharacter = (imageBase64: string) => {
        if (!characterReferences.some(ref => ref.base64 === imageBase64)) {
            setCharacterReferences(prev => [...prev, { base64: imageBase64 }]);
        }
    };

    const handleRemoveCharacter = (indexToRemove: number) => {
        setCharacterReferences(prev => prev.filter((_, index) => index !== indexToRemove));
    };


    const handleGenerateKeyframe = useCallback(async (sceneId: number, editPrompt?: string) => {
        const sceneIndex = screenplay.findIndex(s => s.id === sceneId);
        if (sceneIndex === -1 || !screenplay[sceneIndex].visual_prompt) return;

        setScreenplay(prev => prev.map(s => s.id === sceneId ? { ...s, isGeneratingImage: true } : s));
        
        try {
            const scene = screenplay[sceneIndex];
            const prompt = scene.visual_prompt!;
            const existingImageBase64 = scene.keyframe_image_base64;
            const refsBase64 = characterReferences.map(ref => ref.base64);

            const imageBase64 = await generateKeyframeImage(
                prompt,
                refsBase64,
                editPrompt ? existingImageBase64 : undefined,
                editPrompt
            );
            
            setScreenplay(prev => prev.map(s => s.id === sceneId ? { ...s, keyframe_image_base64: imageBase64, isGeneratingImage: false } : s));
        } catch (err) {
            console.error(err);
            setError(`Failed to generate keyframe for scene ${sceneId}. Please try again.`);
            setScreenplay(prev => prev.map(s => s.id === sceneId ? { ...s, isGeneratingImage: false } : s));
        }
    }, [screenplay, characterReferences]);

    const handleDownloadScript = () => {
        const scriptContent = screenplay.map(scene => `
## SCENE ${scene.scene_number}
**Setting:** ${scene.setting}

**Action/Dialogue:**
${scene.action_dialogue}
        `).join('\n\n---\n');
        downloadTextFile(scriptContent, 'screenplay.txt');
    };

    const handleDownloadTransitions = () => {
        const transitionsContent = screenplay
            .filter(scene => scene.transition_prompt)
            .map((scene, index) => `
### Transition from Scene ${index + 1} to ${index + 2}
> ${scene.transition_prompt}
            `).join('\n\n');
        downloadTextFile(transitionsContent, 'transitions.md');
    };

    const handleDownloadImages = () => {
        downloadImagesAsZip(screenplay, 'screenplay_keyframes.zip');
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
            <main className="container mx-auto px-4 py-8">
                <Header />
                
                {error && <div className="bg-red-800 border border-red-600 text-white px-4 py-3 rounded-lg relative mb-6" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>}

                <div className="bg-gray-800 shadow-2xl rounded-lg p-6 mb-8 border border-gray-700">
                    <h2 className="text-2xl font-bold text-cyan-400 mb-4">1. The Spark of an Idea</h2>
                    <IdeaInput 
                        value={storyIdea}
                        onChange={(e) => setStoryIdea(e.target.value)}
                        onSubmit={handleGenerateScript}
                        isLoading={isLoadingScript}
                    />
                </div>

                {screenplay.length > 0 && (
                    <div className="bg-gray-800 shadow-2xl rounded-lg p-6 mb-8 border border-gray-700">
                         <h2 className="text-2xl font-bold text-cyan-400 mb-4">2. Character References</h2>
                         <p className="text-sm text-gray-400 mb-4">Upload initial character images or lock them from generated keyframes below. These references will be used to maintain consistency in all subsequent image generations.</p>
                         <CharacterManagement 
                            onImageUpload={handleAddReference} 
                            references={characterReferences}
                            onRemove={handleRemoveCharacter}
                         />
                    </div>
                )}


                {(isLoadingScript || isLoadingVisuals) && (
                    <div className="flex justify-center items-center my-10">
                         <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400"></div>
                         <p className="ml-4 text-lg text-gray-400">
                            {isLoadingScript ? "Generating screenplay..." : "Generating visual prompts..."}
                         </p>
                    </div>
                )}
                
                {screenplay.length > 0 && (
                    <>
                        <div className="bg-gray-800 shadow-2xl rounded-lg p-6 mb-8 border border-gray-700">
                            <h2 className="text-2xl font-bold text-cyan-400 mb-4">3. Download Your Assets</h2>
                            <DownloadControls
                                onDownloadScript={handleDownloadScript}
                                onDownloadTransitions={handleDownloadTransitions}
                                onDownloadImages={handleDownloadImages}
                                hasImages={screenplay.some(s => s.keyframe_image_base64)}
                            />
                        </div>
                        
                        <div className="border-t border-gray-700 pt-8">
                             <h2 className="text-3xl font-bold text-center text-cyan-400 mb-6">4. Your Visual Screenplay</h2>
                             <SceneList 
                                scenes={screenplay}
                                onGenerateKeyframe={handleGenerateKeyframe}
                                onLockCharacter={handleLockCharacter}
                                characterReferences={characterReferences.map(r => r.base64)}
                             />
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default App;