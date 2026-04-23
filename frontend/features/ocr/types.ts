export type OcrMode = "skip_text" | "force_ocr" | "redo_ocr";

export interface OcrSettingsValue {
  language: string;
  optimize: number;
  deskew: boolean;
  mode: OcrMode;
}
