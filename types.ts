export interface Scene {
  id: string;
  prompt: string;
  imageUrl: string | null;
  isGenerating: boolean;
}

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3';

export interface ReferenceImage {
  id: string;
  label: string;
  file: File;
  base64: string;
  mimeType: string;
}
