import React from 'react';

interface SettingsProps {
    aspectRatio: string;
    onAspectRatioChange: (value: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ aspectRatio, onAspectRatioChange }) => {
    const ratios = [
        { value: '16:9', label: 'Landscape (16:9)' },
        { value: '9:16', label: 'Portrait (9:16)' },
        { value: '1:1', label: 'Square (1:1)' },
    ];

    return (
        <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
                Keyframe Aspect Ratio
            </label>
            <p className="text-sm text-gray-400 mb-3">Select the aspect ratio for all generated images, including keyframes and characters.</p>
            <div className="flex space-x-2 rounded-lg bg-gray-700 p-1">
                {ratios.map(ratio => (
                    <button
                        key={ratio.value}
                        onClick={() => onAspectRatioChange(ratio.value)}
                        className={`w-full px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 ${
                            aspectRatio === ratio.value 
                                ? 'bg-cyan-600 text-white shadow' 
                                : 'text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                        {ratio.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Settings;
