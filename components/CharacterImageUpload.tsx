import React, { useRef } from 'react';
import { UploadIcon, XCircleIcon } from './icons';

interface CharacterManagementProps {
  onImageUpload: (image: { file: File, base64: string }) => void;
  references: { base64: string }[];
  onRemove: (index: number) => void;
}

const CharacterManagement: React.FC<CharacterManagementProps> = ({ onImageUpload, references, onRemove }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        onImageUpload({ file, base64: base64String });
      };
      reader.readAsDataURL(file);
    }
     // Reset file input to allow uploading the same file again
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  return (
    <div>
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg"
            className="hidden"
        />
        <div className="flex flex-wrap items-start gap-4">
            {references.map((ref, index) => (
                <div key={index} className="relative group">
                    <img 
                        src={`data:image/jpeg;base64,${ref.base64}`} 
                        alt={`Reference ${index + 1}`} 
                        className="w-24 h-24 object-cover rounded-md border-2 border-gray-600"
                    />
                    <button 
                        onClick={() => onRemove(index)}
                        className="absolute -top-2 -right-2 bg-gray-800 rounded-full text-gray-500 hover:text-red-500 hover:bg-gray-700 transition-all opacity-0 group-hover:opacity-100"
                        aria-label="Remove reference"
                    >
                        <XCircleIcon className="w-6 h-6"/>
                    </button>
                </div>
            ))}
            <button
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-600 text-gray-500 rounded-md hover:border-cyan-500 hover:text-cyan-500 transition-colors"
                title="Upload new reference image"
            >
                <UploadIcon className="w-8 h-8" />
                <span className="text-xs mt-1">Upload</span>
            </button>
        </div>
    </div>
  );
};

export default CharacterManagement;