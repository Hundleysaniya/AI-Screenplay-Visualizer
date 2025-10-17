
import React from 'react';
import { DownloadIcon, DocumentTextIcon, FilmIcon } from './icons';

interface DownloadControlsProps {
    onDownloadScript: () => void;
    onDownloadTransitions: () => void;
    onDownloadImages: () => void;
    hasImages: boolean;
}

const DownloadControls: React.FC<DownloadControlsProps> = ({ onDownloadScript, onDownloadTransitions, onDownloadImages, hasImages }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
                onClick={onDownloadScript}
                className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 transition-all duration-200"
            >
                <DocumentTextIcon className="w-5 h-5 mr-2" />
                Download Script (.txt)
            </button>
            <button
                onClick={onDownloadTransitions}
                className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 transition-all duration-200"
            >
                <FilmIcon className="w-5 h-5 mr-2" />
                Download Transitions (.md)
            </button>
            <button
                onClick={onDownloadImages}
                disabled={!hasImages}
                className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 transition-all duration-200"
            >
                <DownloadIcon className="w-5 h-5 mr-2" />
                Download Images (.zip)
            </button>
        </div>
    );
};

export default DownloadControls;
