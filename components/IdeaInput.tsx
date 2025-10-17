
import React from 'react';
import Spinner from './Spinner';

interface IdeaInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onSubmit: () => void;
    isLoading: boolean;
}

const IdeaInput: React.FC<IdeaInputProps> = ({ value, onChange, onSubmit, isLoading }) => {
    return (
        <div>
            <textarea
                value={value}
                onChange={onChange}
                placeholder="e.g., A detective in a cyberpunk city discovers a conspiracy that goes all the way to the top, but the only witness is a sentient AI."
                className="w-full h-32 p-4 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-shadow duration-300 resize-none placeholder-gray-500"
                disabled={isLoading}
            />
            <button
                onClick={onSubmit}
                disabled={isLoading || !value}
                className="mt-4 w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 transition-colors duration-300"
            >
                {isLoading ? (
                    <>
                        <Spinner />
                        Generating...
                    </>
                ) : (
                    'Generate Screenplay'
                )}
            </button>
        </div>
    );
};

export default IdeaInput;
