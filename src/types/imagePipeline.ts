export interface BoundingBox {
  ymin: number; // 0..100 (%)
  xmin: number; // 0..100 (%)
  ymax: number; // 0..100 (%)
  xmax: number; // 0..100 (%)
}

export interface CropBoxPixels {
  left: number;
  top: number;
  width: number;
  height: number;
  horizontalTrimPercent: number;
  verticalTrimPercent: number;
  focalX: number; // 0..100 (%)
  focalY: number; // 0..100 (%)
}

export interface HorizontalAnalysis {
  leftBoundaryPercent: number;
  rightBoundaryPercent: number;
  productWidthPercent: number;
  leftBackgroundPercent: number;
  rightBackgroundPercent: number;
  productCenterXPercent: number;
}

export interface VerticalAnalysis {
  topBoundaryPercent: number;
  bottomBoundaryPercent: number;
  productHeightPercent: number;
  topBackgroundPercent: number;
  bottomBackgroundPercent: number;
  productCenterYPercent: number;
}

export interface CleanSourceVerification {
  checked: boolean;
  similarityScore: number; // 0..1 structural match vs original product
  colorFidelityDelta: number; // mean RGB delta
  aspectMatchOk: boolean;
  watermarkFree: boolean;
  accepted: boolean;
  note: string;
}

export type CropMode = 'smart_square_crop' | 'safe_contain_original_bg';

export interface QualityCheckResult {
  passed: boolean;
  exact1200Square: boolean;
  sharpnessRetentionRatio: number;
  colorDelta: number;
  minResolutionOk: boolean;
  cropSafetyMarginOk: boolean;
  aspectDistortionZero: boolean;
  reason: string;
}

export type ImageProcessingStatus =
  | 'pending'
  | 'analyzing'
  | 'processed'
  | 'needs_clean_source'
  | 'failed';

export type CleanSourceStatus = 'clean' | 'replaced_with_clean' | 'needs_clean_source';

export type ImageOrientation = 'landscape' | 'portrait' | 'square';

export interface ProcessedImageRecord {
  id: string;
  originalUrl: string;
  processedUrl?: string;
  cleanSourceUrl?: string;
  productIds: string[];
  productNames: string[];
  categories: string[];
  discoveredIn: string[]; // e.g. ['catalog', 'gallery', 'hero', 'editorial', 'collage', 'category', 'uploads']
  status: ImageProcessingStatus;
  analysisStatus: 'completed' | 'failed';
  cleanSourceStatus: CleanSourceStatus;
  hasWatermark: boolean;
  watermarkLocation?: string; // e.g. 'bottom-right (90%, 90%)' | 'none'
  aiMethod: 'gemini-vision+cv' | 'cv-saliency';
  orientation?: ImageOrientation;
  cropMode?: CropMode;
  sampledBackgroundColor?: { r: number; g: number; b: number };
  importantElements?: string[];
  emptyBackgroundPercent?: number;
  boundingBox?: BoundingBox;
  cropBox?: CropBoxPixels;
  horizontalAnalysis?: HorizontalAnalysis;
  verticalAnalysis?: VerticalAnalysis;
  originalAspectRatio?: number;
  processedAspectRatio?: number;
  subjectAreaPercent?: number;
  originalDimensions?: { width: number; height: number };
  processedDimensions?: { width: number; height: number };
  originalSizeBytes?: number;
  processedSizeBytes?: number;
  cleanSourceVerification?: CleanSourceVerification;
  qualityCheck?: QualityCheckResult;
  retryCount?: number;
  pipelineStages?: string[];
  processingTimestamp: number;
  errorMessage?: string;
  notes?: string;
}

export interface PipelineSummary {
  totalDiscovered: number;
  totalAnalyzed: number;
  totalProcessed: number;
  geminiMarksDetected: number;
  verifiedCleanReplacements: number;
  successfullyOptimized: number;
  exactSquare1200Count?: number;
  containFallbackCount?: number;
  awaitingReplacement: number;
  needsCleanSource: number;
  qualityCheckPassed: number;
  failed: number;
  pending: number;
  uniqueCropGeometries?: number;
  secondPassVerified?: boolean;
  isProcessing: boolean;
  lastRunTimestamp: number;
}

export interface ImagePipelineManifest {
  version: number;
  summary: PipelineSummary;
  records: Record<string, ProcessedImageRecord>;
}
