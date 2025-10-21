import React, { useRef, useCallback } from 'react';
import { ReferenceImage } from '../types';
import { fileToBase64 } from '../utils/fileUtils';

interface ReferenceManagerProps {
  references: ReferenceImage[];
  setReferences: (references: ReferenceImage[]) => void;
  title: string;
  idPrefix: string;
}

const ReferenceManager: React.FC<ReferenceManagerProps> = ({ references, setReferences, title, idPrefix }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      const newReference: ReferenceImage = {
        id: self.crypto.randomUUID(),
        label: `${title} ${references.length + 1}`,
        file,
        base64,
        mimeType: file.type,
      };
      setReferences([...references, newReference]);
    }
     // Reset file input to allow selecting the same file again
    if(event.target) {
        event.target.value = '';
    }
  }, [references, setReferences, title]);

  const handleLabelChange = (id: string, newLabel: string) => {
    setReferences(references.map(ref => ref.id === id ? { ...ref, label: newLabel } : ref));
  };

  const handleRemove = (id: string) => {
    setReferences(references.filter(ref => ref.id !== id));
  };

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-medium text-gray-300">{title}</span>
      <div className="space-y-3">
        {references.map(ref => (
          <div key={ref.id} className="flex items-center gap-2 p-2 bg-gray-900 rounded-md">
            <img src={`data:${ref.mimeType};base64,${ref.base64}`} alt={ref.label} className="w-12 h-12 object-cover rounded" />
            <input
              type="text"
              value={ref.label}
              onChange={e => handleLabelChange(ref.id, e.target.value)}
              className="flex-grow p-1.5 bg-gray-700 border border-gray-600 rounded-md text-sm focus:ring-1 focus:ring-cyan-500 focus:outline-none"
              placeholder="라벨 입력..."
            />
            <button
              onClick={() => handleRemove(ref.id)}
              className="p-2 bg-red-600 hover:bg-red-500 rounded-md transition-colors"
              aria-label="참조 삭제"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg"
        className="hidden"
        id={`${idPrefix}-file-input`}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm font-semibold py-2 px-3 rounded-md transition-colors flex items-center justify-center gap-2"
      >
         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
        {title} 추가
      </button>
    </div>
  );
};

export default ReferenceManager;
