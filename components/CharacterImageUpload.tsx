import React, { useRef, useState } from 'react';
import { UploadIcon, XCircleIcon } from './icons';
import Spinner from './Spinner';

interface CharacterManagementProps {
  onImageUpload: (image: { file?: File, base64: string }) => void;
  references: { base64: string }[];
  onRemove: (index: number) => void;
  onGenerateCharacter: (prompt: string) => Promise<void>;
  isGeneratingCharacter: boolean;
  onImageClick: (base64: string) => void;
}

const CharacterManagement: React.FC<CharacterManagementProps> = ({ onImageUpload, references, onRemove, onGenerateCharacter, isGeneratingCharacter, onImageClick }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [prompt, setPrompt] = useState('');

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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleGenerateClick = async () => {
    if (!prompt.trim()) return;
    await onGenerateCharacter(prompt);
    setPrompt('');
  };

  return (
    <div>
      <div className="mb-4">
        <label htmlFor="character-prompt" className="block text-sm font-medium text-gray-400 mb-2">
          Generate a character from a prompt
        </label>
        <div className="flex items-stretch gap-2">
          <textarea
            id="character-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A grizzled space marine, cybernetic eye, scar across his face, wearing worn-out armor."
            className="flex-grow p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-shadow duration-200 resize-none placeholder-gray-500"
            rows={3}
            disabled={isGeneratingCharacter}
          />
          <button
            onClick={handleGenerateClick}
            disabled={isGeneratingCharacter || !prompt.trim()}
            className="px-4 py-2 w-28 flex-shrink-0 flex justify-center items-center border border-transparent text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 transition-colors"
          >
            {isGeneratingCharacter ? <Spinner /> : 'Generate'}
          </button>
        </div>
      </div>

      <div className="flex items-center my-4">
        <div className="flex-grow border-t border-gray-600"></div>
        <span className="flex-shrink mx-4 text-gray-500 text-sm">OR UPLOAD</span>
        <div className="flex-grow border-t border-gray-600"></div>
      </div>

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
              className="w-24 h-24 object-cover rounded-md border-2 border-gray-600 cursor-pointer hover:border-cyan-500 transition-colors"
              onClick={() => onImageClick(ref.base64)}
            />
            <button
              onClick={() => onRemove(index)}
              className="absolute -top-2 -right-2 bg-gray-800 rounded-full text-gray-500 hover:text-red-500 hover:bg-gray-700 transition-all opacity-0 group-hover:opacity-100"
              aria-label={`Remove reference ${index + 1}`}
            >
              <XCircleIcon className="w-6 h-6" />
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