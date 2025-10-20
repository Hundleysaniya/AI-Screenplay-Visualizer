import React from 'react';
import { XCircleIcon } from './icons';

interface ImageModalProps {
    imageBase64: string;
    onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ imageBase64, onClose }) => {
    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 transition-opacity animate-[fade-in_0.2s_ease-out]"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="image-modal-title"
        >
            <style>
                {`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes zoom-in {
                    from { transform: scale(0.95); }
                    to { transform: scale(1); }
                }
                `}
            </style>
            <div 
                className="relative bg-gray-800 p-4 rounded-lg shadow-2xl max-w-4xl max-h-[90vh] transition-transform transform animate-[zoom-in_0.2s_ease-out]"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the image/modal content
            >
                <h2 id="image-modal-title" className="sr-only">Character Reference Image</h2>
                <img 
                    src={`data:image/jpeg;base64,${imageBase64}`} 
                    alt="Character Reference Preview"
                    className="max-w-full max-h-[calc(90vh-2rem)] object-contain rounded"
                />
                <button
                    onClick={onClose}
                    className="absolute -top-3 -right-3 text-white bg-gray-900 rounded-full hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500"
                    aria-label="Close image preview"
                >
                    <XCircleIcon className="w-8 h-8"/>
                </button>
            </div>
        </div>
    );
};

export default ImageModal;
