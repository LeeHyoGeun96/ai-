import React, { useState, useCallback } from 'react';
import { Scene, AspectRatio, ReferenceImage } from './types';
import { 
  splitStoryIntoScenes, 
  generateImageForScene, 
  convertImageToSketch,
  createCharacterReference,
  createBackgroundReference
} from './services/geminiService';
import SceneCard from './components/SceneCard';
import ControlPanel from './components/ControlPanel';
import PromptGuideModal from './components/PromptGuideModal';

const ASPECT_RATIO_CLASSES: Record<AspectRatio, string> = {
  '16:9': 'aspect-video',
  '9:16': 'aspect-[9/16]',
  '1:1': 'aspect-square',
  '4:3': 'aspect-[4/3]',
};

function App() {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [stylePrompt, setStylePrompt] = useState<string>('cinematic lighting, epic, highly detailed');
  const [characters, setCharacters] = useState<ReferenceImage[]>([]);
  const [backgrounds, setBackgrounds] = useState<ReferenceImage[]>([]);
  const [isGeneratingStory, setIsGeneratingStory] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  const handleGenerateStory = useCallback(async (story: string) => {
    setIsGeneratingStory(true);
    setScenes([]);

    let finalCharacters = [...characters];
    if (finalCharacters.length === 0) {
      const newChar = await createCharacterReference(story);
      if (newChar) {
        setCharacters([newChar]);
        finalCharacters = [newChar];
      }
    }

    let finalBackgrounds = [...backgrounds];
    if (finalBackgrounds.length === 0) {
        const newBg = await createBackgroundReference(story);
        if (newBg) {
            setBackgrounds([newBg]);
            finalBackgrounds = [newBg];
        }
    }

    const charLabels = finalCharacters.map(c => c.label);
    const bgLabels = finalBackgrounds.map(b => b.label);
    const scenePrompts = await splitStoryIntoScenes(story, charLabels, bgLabels);
    
    const initialScenes: Scene[] = scenePrompts.map(prompt => ({
      id: self.crypto.randomUUID(),
      prompt,
      imageUrl: null,
      isGenerating: true,
    }));
    setScenes(initialScenes);

    // Generate images for each scene sequentially
    let currentScenes = [...initialScenes];
    for (const scene of initialScenes) {
      const base64Image = await generateImageForScene(scene.prompt, aspectRatio, stylePrompt, finalCharacters, finalBackgrounds);
      currentScenes = currentScenes.map(s =>
        s.id === scene.id ? { ...s, imageUrl: base64Image, isGenerating: false } : s
      );
      setScenes(currentScenes);
    }
    
    setIsGeneratingStory(false);
  }, [aspectRatio, stylePrompt, characters, backgrounds]);

  const handleRegenerateScene = useCallback(async (id: string) => {
    const sceneToRegen = scenes.find(s => s.id === id);
    if (!sceneToRegen) return;

    setScenes(prev => prev.map(s => s.id === id ? { ...s, isGenerating: true } : s));

    const base64Image = await generateImageForScene(sceneToRegen.prompt, aspectRatio, stylePrompt, characters, backgrounds);

    setScenes(prev => prev.map(s => s.id === id ? { ...s, imageUrl: base64Image, isGenerating: false } : s));
  }, [scenes, aspectRatio, stylePrompt, characters, backgrounds]);
  
  const handlePromptChange = (id: string, newPrompt: string) => {
    setScenes(prev => prev.map(s => s.id === id ? { ...s, prompt: newPrompt } : s));
  };
  
  const handleDeleteScene = (id: string) => {
    setScenes(prev => prev.filter(s => s.id !== id));
  };

  const handleExport = useCallback(async (asSketch: boolean) => {
    if (scenes.length === 0 || scenes.every(s => !s.imageUrl)) {
      alert("내보낼 이미지가 없습니다.");
      return;
    }
    setIsExporting(true);
    
    try {
      // @ts-ignore
      const zip = new JSZip();
      
      const imagePromises = scenes.map(async (scene, i) => {
        if (scene.imageUrl) {
          let imageToZip = scene.imageUrl;
          let mimeType = 'image/png';

          if (asSketch) {
              const sketchImage = await convertImageToSketch(scene.imageUrl, mimeType);
              if (sketchImage) {
                  imageToZip = sketchImage;
              }
          }
          const fileName = `scene_${String(i + 1).padStart(3, '0')}.png`;
          zip.file(fileName, imageToZip, { base64: true });
        }
      });

      await Promise.all(imagePromises);

      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = "storyboard.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Error exporting storyboard:", error);
      alert("스토리보드를 내보내는 중 오류가 발생했습니다.");
    } finally {
      setIsExporting(false);
    }
  }, [scenes]);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <header className="bg-gray-800/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-cyan-300 flex items-center gap-3">
            <span role="img" aria-label="clapper board" className="text-3xl">🎬</span>
            AI 스토리보드 생성기
          </h1>
          <button
            onClick={() => setIsGuideOpen(true)}
            className="p-2 text-gray-300 hover:text-cyan-300 transition-colors rounded-full hover:bg-gray-700"
            aria-label="프롬프트 가이드 열기"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </button>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <ControlPanel
            aspectRatio={aspectRatio}
            setAspectRatio={setAspectRatio}
            stylePrompt={stylePrompt}
            setStylePrompt={setStylePrompt}
            characters={characters}
            setCharacters={setCharacters}
            backgrounds={backgrounds}
            setBackgrounds={setBackgrounds}
            onGenerateStory={handleGenerateStory}
            onExport={handleExport}
            isGenerating={isGeneratingStory}
            isExporting={isExporting}
          />

          <div className="flex-1 w-full">
            {scenes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {scenes.map((scene, index) => (
                  <SceneCard
                    key={scene.id}
                    scene={scene}
                    sceneNumber={index + 1}
                    aspectRatioClass={ASPECT_RATIO_CLASSES[aspectRatio]}
                    onPromptChange={handlePromptChange}
                    onRegenerate={handleRegenerateScene}
                    onDelete={handleDeleteScene}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[calc(100vh-200px)] bg-gray-800 rounded-lg p-8 border-2 border-dashed border-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h2 className="text-2xl font-semibold text-gray-400">스토리보드가 비어있습니다</h2>
                <p className="text-gray-500 mt-2 text-center max-w-md">왼쪽 제어판에 스토리를 입력하고 '스토리 자동 생성' 버튼을 클릭하여 첫 번째 씬을 만들어보세요.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {isGuideOpen && <PromptGuideModal onClose={() => setIsGuideOpen(false)} />}
    </div>
  );
}

export default App;