import React from 'react';

interface ScreenplayHeaderProps {
    title: string;
    thumbnailImage: string | null;
    isGeneratingThumbnail: boolean;
    onGenerateThumbnail: () => void;
    onImageClick: (base64: string) => void;
}

const ScreenplayHeader: React.FC<ScreenplayHeaderProps> = ({ title, thumbnailImage, isGeneratingThumbnail, onGenerateThumbnail, onImageClick }) => {
    return (
        <div className="bg-gray-800 shadow-2xl rounded-lg p-6 mb-8 border border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2">
                <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-500 mb-2">
                    {title}
                </h2>
                <p className="text-gray-400">Your screenplay is ready. Use the settings below to start generating your visuals.</p>
            </div>
            <div className="flex flex-col items-center justify-center bg-gray-900 p-4 rounded-lg border border-gray-700 min-h-[150px] aspect-video">
                {isGeneratingThumbnail && (
                    <div className="flex flex-col items-center justify-center text-gray-400">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-400 mb-2"></div>
                        <span>Generating Thumbnail...</span>
                    </div>
                )}
                {!isGeneratingThumbnail && thumbnailImage && (
                     <div className="w-full h-full group relative">
                        <img 
                            src={`data:image/png;base64,${thumbnailImage}`} 
                            alt={`Thumbnail for ${title}`}
                            className="w-full h-full object-cover rounded-md cursor-pointer"
                            onClick={() => onImageClick(thumbnailImage)}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md">
                           <button onClick={onGenerateThumbnail} className="px-3 py-2 text-sm bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors">
                               Regenerate
                           </button>
                        </div>
                    </div>
                )}
                {!isGeneratingThumbnail && !thumbnailImage && (
                    <div className="text-center">
                        <p className="text-gray-500 mb-2">Could not generate thumbnail.</p>
                         <button onClick={onGenerateThumbnail} className="px-3 py-2 text-sm bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors">
                           Try Again
                         </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScreenplayHeader;
