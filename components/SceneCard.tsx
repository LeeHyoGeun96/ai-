
import React, { useState, useCallback } from 'react';
import { Scene } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface SceneCardProps {
  scene: Scene;
  sceneNumber: number;
  aspectRatioClass: string;
  onPromptChange: (id: string, newPrompt: string) => void;
  onRegenerate: (id: string) => void;
  onDelete: (id: string) => void;
}

const SceneCard: React.FC<SceneCardProps> = ({ scene, sceneNumber, aspectRatioClass, onPromptChange, onRegenerate, onDelete }) => {
  const [prompt, setPrompt] = useState(scene.prompt);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const handleBlur = () => {
    onPromptChange(scene.id, prompt);
  };
  
  const handleRegenerateClick = useCallback(() => {
    onRegenerate(scene.id);
  }, [onRegenerate, scene.id]);

  const handleDeleteClick = useCallback(() => {
    onDelete(scene.id);
  }, [onDelete, scene.id]);

  return (
    <div className="flex flex-col gap-3 p-4 bg-gray-800 rounded-lg shadow-lg w-full">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-cyan-300">씬 #{sceneNumber}</h3>
        <button onClick={handleDeleteClick} className="text-gray-400 hover:text-red-500 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
        </button>
      </div>
      
      <div className={`relative w-full ${aspectRatioClass} bg-gray-700 rounded-md overflow-hidden flex items-center justify-center`}>
        {scene.isGenerating ? (
          <div className="flex flex-col items-center gap-2 text-cyan-200">
            <LoadingSpinner size="h-12 w-12" />
            <p>생성 중...</p>
          </div>
        ) : scene.imageUrl ? (
          <img src={`data:image/png;base64,${scene.imageUrl}`} alt={`Scene ${sceneNumber}`} className="w-full h-full object-cover" />
        ) : (
          <div className="text-gray-400">이미지 없음</div>
        )}
      </div>

      <textarea
        value={prompt}
        onChange={handlePromptChange}
        onBlur={handleBlur}
        rows={3}
        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-colors"
        placeholder="장면 프롬프트 입력..."
      />

      <button
        onClick={handleRegenerateClick}
        disabled={scene.isGenerating}
        className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-all duration-300 flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.885-.666A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566z" clipRule="evenodd" /></svg>
        씬 재생성
      </button>
    </div>
  );
};

export default SceneCard;
