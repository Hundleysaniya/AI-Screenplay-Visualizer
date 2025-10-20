import React, { useState, useCallback } from 'react';
import type { Scene } from './types';
import { generateScreenplay, generateVisualsForScene, generateKeyframeImage, generateCharacterImage } from './services/geminiService';
import { downloadTextFile, downloadImagesAsZip } from './utils/fileUtils';
import Header from './components/Header';
import IdeaInput from './components/IdeaInput';
import SceneList from './components/SceneList';
import DownloadControls from './components/DownloadControls';
import CharacterManagement from './components/CharacterImageUpload';
import ImageModal from './components/ImageModal';
import Settings from './components/Settings';
import ScreenplayHeader from './components/ScreenplayHeader';

const getErrorMessage = (err: unknown, contextMessage: string): string => {
    const quotaExceededMessage = 'You exceeded your current quota. Please check your plan and billing details. For more information, head to: https://ai.google.dev/gemini-api/docs/rate-limits.';

    let message = '';
    if (err instanceof Error) {
        message = err.message;
    } else if (typeof err === 'object' && err !== null) {
        message = (err as any).message || JSON.stringify(err);
    }

    if (message.includes('RESOURCE_EXHAUSTED') || message.includes('quota')) {
        return quotaExceededMessage;
    }

    return `${contextMessage}. Please try again.`;
};

const App: React.FC = () => {
    const [storyIdea, setStoryIdea] = useState<string>('');
    const [screenplay, setScreenplay] = useState<Scene[]>([]);
    const [title, setTitle] = useState<string>('');
    const [thumbnailPrompt, setThumbnailPrompt] = useState<string>('');
    const [thumbnailImage, setThumbnailImage] = useState<string | null>(null);
    const [characterReferences, setCharacterReferences] = useState<{ base64: string }[]>([]);
    const [aspectRatio, setAspectRatio] = useState<string>('16:9');
    const [isLoadingScript, setIsLoadingScript] = useState<boolean>(false);
    const [isLoadingVisuals, setIsLoadingVisuals] = useState<boolean>(false);
    const [isGeneratingCharacter, setIsGeneratingCharacter] = useState<boolean>(false);
    const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState<boolean>(false);
    const [modalImage, setModalImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateThumbnail = useCallback(async (prompt: string) => {
        if (!prompt) return;
        setIsGeneratingThumbnail(true);
        if (error?.includes('thumbnail')) setError(null);
        try {
            const imageBase64 = await generateKeyframeImage(prompt, [], undefined, undefined, aspectRatio);
            setThumbnailImage(imageBase64);
        } catch (err) {
            console.error(err);
            setError(getErrorMessage(err, 'Failed to generate thumbnail image'));
        } finally {
            setIsGeneratingThumbnail(false);
        }
    }, [aspectRatio, error]);

    const handleGenerateScript = useCallback(async () => {
        if (!storyIdea.trim()) {
            setError('Please enter a story idea.');
            return;
        }
        setIsLoadingScript(true);
        setError(null);
        setScreenplay([]);
        setCharacterReferences([]);
        setTitle('');
        setThumbnailPrompt('');
        setThumbnailImage(null);
        
        try {
            const { title, thumbnail_prompt, scenes } = await generateScreenplay(storyIdea);
            setTitle(title);
            setThumbnailPrompt(thumbnail_prompt);
            setScreenplay(scenes.map(s => ({ ...s, id: s.scene_number })));
            
            // Kick off thumbnail generation, but don't wait for it
            handleGenerateThumbnail(thumbnail_prompt);

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
            setError(getErrorMessage(err, 'Failed to generate screenplay'));
        } finally {
            setIsLoadingScript(false);
            setIsLoadingVisuals(false);
        }
    }, [storyIdea, handleGenerateThumbnail]);

    const handleGenerateCharacter = useCallback(async (prompt: string) => {
        if (!prompt.trim()) return;

        setIsGeneratingCharacter(true);
        setError(null);
        try {
            const imageBase64 = await generateCharacterImage(prompt, aspectRatio);
            handleAddReference({ base64: imageBase64 });
        } catch (err) {
            console.error(err);
            setError(getErrorMessage(err, 'Failed to generate character image'));
        } finally {
            setIsGeneratingCharacter(false);
        }
    }, [aspectRatio]);
    
    const handleAddReference = (image: { file?: File, base64: string }) => {
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

    const handleOpenImageModal = useCallback((base64: string) => {
        setModalImage(base64);
    }, []);

    const handleCloseImageModal = useCallback(() => {
        setModalImage(null);
    }, []);

    const handleGenerateKeyframe = useCallback(async (sceneId: number, editPrompt?: string) => {
        const sceneIndex = screenplay.findIndex(s => s.id === sceneId);
        if (sceneIndex === -1 || !screenplay[sceneIndex].visual_prompt) return;

        setScreenplay(prev => prev.map(s => s.id === sceneId ? { ...s, isGeneratingImage: true } : s));
        setError(null);
        
        try {
            const scene = screenplay[sceneIndex];
            const prompt = scene.visual_prompt!;
            const existingImageBase64 = scene.keyframe_image_base64;
            const refsBase64 = characterReferences.map(ref => ref.base64);

            const imageBase64 = await generateKeyframeImage(
                prompt,
                refsBase64,
                editPrompt ? existingImageBase64 : undefined,
                editPrompt,
                aspectRatio
            );
            
            setScreenplay(prev => prev.map(s => s.id === sceneId ? { ...s, keyframe_image_base64: imageBase64, isGeneratingImage: false } : s));
            handleOpenImageModal(imageBase64);
        } catch (err) {
            console.error(err);
            setError(getErrorMessage(err, `Failed to generate keyframe for scene ${sceneId}`));
            setScreenplay(prev => prev.map(s => s.id === sceneId ? { ...s, isGeneratingImage: false } : s));
        }
    }, [screenplay, characterReferences, handleOpenImageModal, aspectRatio]);

    const handleDownloadScript = () => {
        const scriptContent = screenplay.map(scene => `
## SCENE ${scene.scene_number}
**Setting:** ${scene.setting}

**actions**
${scene.action}

**dialog/voice over**
${scene.dialogue_vo}
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
                        <ScreenplayHeader 
                            title={title}
                            thumbnailImage={thumbnailImage}
                            isGeneratingThumbnail={isGeneratingThumbnail}
                            onGenerateThumbnail={() => handleGenerateThumbnail(thumbnailPrompt)}
                            onImageClick={handleOpenImageModal}
                        />

                        <div className="bg-gray-800 shadow-2xl rounded-lg p-6 mb-8 border border-gray-700">
                            <h2 className="text-2xl font-bold text-cyan-400 mb-4">2. Generation Settings</h2>
                            <Settings aspectRatio={aspectRatio} onAspectRatioChange={setAspectRatio} />
                        </div>
                        
                        <div className="bg-gray-800 shadow-2xl rounded-lg p-6 mb-8 border border-gray-700">
                             <h2 className="text-2xl font-bold text-cyan-400 mb-4">3. Character References</h2>
                             <p className="text-sm text-gray-400 mb-4">Generate characters from a prompt, upload your own images, or lock them from generated keyframes below. These references will be used to maintain consistency in all subsequent image generations.</p>
                             <CharacterManagement 
                                onImageUpload={handleAddReference} 
                                references={characterReferences}
                                onRemove={handleRemoveCharacter}
                                onGenerateCharacter={handleGenerateCharacter}
                                isGeneratingCharacter={isGeneratingCharacter}
                                onImageClick={handleOpenImageModal}
                             />
                        </div>

                        <div className="bg-gray-800 shadow-2xl rounded-lg p-6 mb-8 border border-gray-700">
                            <h2 className="text-2xl font-bold text-cyan-400 mb-4">4. Download Your Assets</h2>
                            <DownloadControls
                                onDownloadScript={handleDownloadScript}
                                onDownloadTransitions={handleDownloadTransitions}
                                onDownloadImages={handleDownloadImages}
                                hasImages={screenplay.some(s => s.keyframe_image_base64)}
                            />
                        </div>
                        
                        <div className="border-t border-gray-700 pt-8">
                             <h2 className="text-3xl font-bold text-center text-cyan-400 mb-6">5. Your Visual Screenplay</h2>
                             <SceneList 
                                scenes={screenplay}
                                onGenerateKeyframe={handleGenerateKeyframe}
                                onLockCharacter={handleLockCharacter}
                                characterReferences={characterReferences.map(r => r.base64)}
                                onImageClick={handleOpenImageModal}
                             />
                        </div>
                    </>
                )}
            </main>

            {modalImage && (
                <ImageModal 
                    imageBase64={modalImage}
                    onClose={handleCloseImageModal}
                />
            )}
        </div>
    );
};

export default App;