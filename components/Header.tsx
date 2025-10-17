
import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="text-center mb-10">
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-500 mb-2">
                AI Screenplay Visualizer
            </h1>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
                Transform your story ideas into fully visualized screenplays. Generate scripts, create visual prompts, and produce keyframe images for every scene.
            </p>
        </header>
    );
};

export default Header;
