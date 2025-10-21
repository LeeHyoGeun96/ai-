import React, { useState, useCallback } from 'react';
import { AspectRatio, ReferenceImage } from '../types';
import LoadingSpinner from './LoadingSpinner';
import ReferenceManager from './ReferenceManager';

interface ControlPanelProps {
  aspectRatio: AspectRatio;
  setAspectRatio: (ratio: AspectRatio) => void;
  stylePrompt: string;
  setStylePrompt: (prompt: string) => void;
  characters: ReferenceImage[];
  setCharacters: (files: ReferenceImage[]) => void;
  backgrounds: ReferenceImage[];
  setBackgrounds: (files: ReferenceImage[]) => void;
  onGenerateStory: (story: string) => void;
  onExport: (asSketch: boolean) => void;
  isGenerating: boolean;
  isExporting: boolean;
}

const AspectRatioButton: React.FC<{
  ratio: AspectRatio;
  label: string;
  current: AspectRatio;
  onClick: (ratio: AspectRatio) => void;
}> = ({ ratio, label, current, onClick }) => (
  <button
    onClick={() => onClick(ratio)}
    className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${
      current === ratio ? 'bg-cyan-500 text-white' : 'bg-gray-700 hover:bg-gray-600'
    }`}
  >
    {label}
  </button>
);

const ControlPanel: React.FC<ControlPanelProps> = ({
  aspectRatio,
  setAspectRatio,
  stylePrompt,
  setStylePrompt,
  characters,
  setCharacters,
  backgrounds,
  setBackgrounds,
  onGenerateStory,
  onExport,
  isGenerating,
  isExporting
}) => {
  const [story, setStory] = useState('');
  const [exportAsSketch, setExportAsSketch] = useState(false);
  
  const handleGenerateClick = useCallback(() => {
    if (story.trim()) {
      onGenerateStory(story);
    }
  }, [onGenerateStory, story]);

  const handleExportClick = useCallback(() => {
      onExport(exportAsSketch);
  }, [onExport, exportAsSketch]);

  return (
    <div className="w-full lg:w-96 p-4 bg-gray-800 rounded-lg shadow-xl flex flex-col gap-6 sticky top-4 self-start">
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-cyan-300 border-b border-gray-700 pb-2">스토리보드 설정</h2>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">화면 비율</label>
          <div className="flex gap-2">
            <AspectRatioButton ratio="16:9" label="16:9" current={aspectRatio} onClick={setAspectRatio} />
            <AspectRatioButton ratio="9:16" label="9:16" current={aspectRatio} onClick={setAspectRatio} />
            <AspectRatioButton ratio="1:1" label="1:1" current={aspectRatio} onClick={setAspectRatio} />
            <AspectRatioButton ratio="4:3" label="4:3" current={aspectRatio} onClick={setAspectRatio} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-cyan-300 border-b border-gray-700 pb-2">일관성 참조</h2>
        <ReferenceManager
            references={characters}
            setReferences={setCharacters}
            title="캐릭터"
            idPrefix="char"
        />
        <ReferenceManager
            references={backgrounds}
            setReferences={setBackgrounds}
            title="배경"
            idPrefix="bg"
        />
        <div>
          <label htmlFor="style-prompt" className="block text-sm font-medium text-gray-300 mb-2">컬러/스타일 고정</label>
          <input
            id="style-prompt"
            type="text"
            value={stylePrompt}
            onChange={(e) => setStylePrompt(e.target.value)}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            placeholder="예: in the style of ghibli, pixel art..."
          />
        </div>
      </div>
      
      <div className="space-y-4">
          <h2 className="text-xl font-bold text-cyan-300 border-b border-gray-700 pb-2">스토리 생성</h2>
          <textarea
            value={story}
            onChange={(e) => setStory(e.target.value)}
            rows={5}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            placeholder="여기에 전체 스토리나 장면 설명을 입력하세요..."
          />
          <button
            onClick={handleGenerateClick}
            disabled={isGenerating || !story.trim()}
            className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300 flex items-center justify-center gap-2"
          >
            {isGenerating ? <LoadingSpinner size="h-5 w-5" /> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>}
            {isGenerating ? "스토리 생성 중..." : "스토리 자동 생성"}
          </button>
      </div>

       <div className="space-y-4">
          <h2 className="text-xl font-bold text-cyan-300 border-b border-gray-700 pb-2">내보내기</h2>
           <div className="flex items-center justify-between p-3 bg-gray-900 rounded-md">
                <label htmlFor="sketch-toggle" className="text-sm font-medium text-gray-300">스케치로 변환</label>
                <button
                    id="sketch-toggle"
                    onClick={() => setExportAsSketch(!exportAsSketch)}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                        exportAsSketch ? 'bg-cyan-500' : 'bg-gray-600'
                    }`}
                >
                    <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                        exportAsSketch ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                </button>
            </div>
          <button
            onClick={handleExportClick}
            disabled={isExporting}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300 flex items-center justify-center gap-2"
          >
            {isExporting ? <LoadingSpinner size="h-5 w-5" /> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>}
            {isExporting ? "내보내는 중..." : "이미지 시퀀스로 내보내기"}
          </button>
      </div>
    </div>
  );
};

export default ControlPanel;