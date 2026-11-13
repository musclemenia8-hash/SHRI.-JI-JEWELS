import defaultManifestData from '../data/imageManifest.json';
import {
  ImagePipelineManifest,
  PipelineSummary,
  ProcessedImageRecord,
} from '../types/imagePipeline';
import { Product } from '../types';

export interface ImageTask {
  url: string;
  productId?: string;
  productName?: string;
  category?: string;
  sourceTag?: string;
}

type Listener = (records: Record<string, ProcessedImageRecord>, summary: PipelineSummary) => void;

const EMPTY_SUMMARY: PipelineSummary = {
  totalDiscovered: 0,
  totalAnalyzed: 0,
  totalProcessed: 0,
  geminiMarksDetected: 0,
  verifiedCleanReplacements: 0,
  successfullyOptimized: 0,
  exactSquare1200Count: 0,
  containFallbackCount: 0,
  awaitingReplacement: 0,
  needsCleanSource: 0,
  qualityCheckPassed: 0,
  failed: 0,
  pending: 0,
  uniqueCropGeometries: 0,
  secondPassVerified: false,
  isProcessing: false,
  lastRunTimestamp: 0,
};

class ImageQueueService {
  private records: Record<string, ProcessedImageRecord> = {};
  private summary: PipelineSummary = { ...EMPTY_SUMMARY };
  private listeners: Set<Listener> = new Set();
  private inFlightUrls: Set<string> = new Set();
  private hasSyncedServer = false;

  constructor() {
    // Hydrate synchronously from build-time / server-synced manifest so processed HD crops show on frame 1
    const initial = defaultManifestData as unknown as ImagePipelineManifest;
    if (initial && initial.records) {
      this.records = { ...initial.records };
      this.summary = initial.summary ? { ...EMPTY_SUMMARY, ...initial.summary } : this.computeLocalSummary();
    }

    if (typeof window !== 'undefined') {
      // Sync live manifest with backend Express server
      void this.syncFromServer();
    }
  }

  private computeLocalSummary(): PipelineSummary {
    const vals = Object.values(this.records);
    let totalAnalyzed = 0;
    let successfullyOptimized = 0;
    let exactSquare1200Count = 0;
    let containFallbackCount = 0;
    let awaitingReplacement = 0;
    let geminiMarksDetected = 0;
    let verifiedCleanReplacements = 0;
    let qualityCheckPassed = 0;
    let failed = 0;
    const uniqueCropSet = new Set<string>();

    for (const r of vals) {
      if (r.analysisStatus === 'completed' || Boolean(r.boundingBox)) totalAnalyzed++;
      if (r.cropBox) uniqueCropSet.add(`${r.cropBox.left},${r.cropBox.top},${r.cropBox.width}x${r.cropBox.height}`);
      if (r.processedDimensions?.width === 1200 && r.processedDimensions?.height === 1200) exactSquare1200Count++;
      if (r.cropMode === 'safe_contain_original_bg') containFallbackCount++;
      if (r.hasWatermark) geminiMarksDetected++;
      if (r.cleanSourceStatus === 'replaced_with_clean') verifiedCleanReplacements++;
      if (r.qualityCheck?.passed) qualityCheckPassed++;

      if (r.status === 'failed') failed++;
      else if (r.status === 'needs_clean_source') {
        awaitingReplacement++;
        if (r.processedUrl) successfullyOptimized++;
      } else if (r.status === 'processed') {
        successfullyOptimized++;
      }
    }

    return {
      totalDiscovered: vals.length,
      totalAnalyzed,
      totalProcessed: successfullyOptimized + failed,
      geminiMarksDetected,
      verifiedCleanReplacements,
      successfullyOptimized,
      exactSquare1200Count,
      containFallbackCount,
      awaitingReplacement,
      needsCleanSource: awaitingReplacement,
      qualityCheckPassed,
      failed,
      pending: this.inFlightUrls.size,
      uniqueCropGeometries: uniqueCropSet.size,
      secondPassVerified:
        this.inFlightUrls.size === 0 && failed === 0 && totalAnalyzed === vals.length && exactSquare1200Count === vals.length,
      isProcessing: this.inFlightUrls.size > 0,
      lastRunTimestamp: Date.now(),
    };
  }

  private applyManifest(manifest: ImagePipelineManifest): void {
    if (!manifest || !manifest.records) return;
    this.records = { ...manifest.records };
    this.summary = manifest.summary || this.computeLocalSummary();
    this.notify();
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.records, this.summary);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const snapshotRecords = { ...this.records };
    const snapshotSummary = { ...this.summary };
    this.listeners.forEach((fn) => fn(snapshotRecords, snapshotSummary));
  }

  /**
   * Fetch live centralized pipeline manifest from Express backend (/api/images/manifest)
   */
  public async syncFromServer(): Promise<ImagePipelineManifest | null> {
    try {
      const res = await fetch('/api/images/manifest');
      if (!res.ok) return null;
      const manifest = (await res.json()) as ImagePipelineManifest;
      this.hasSyncedServer = true;
      this.applyManifest(manifest);
      return manifest;
    } catch {
      return null;
    }
  }

  /**
   * Discovers any un-cached product images (e.g. from localStorage custom products) and queues them through backend
   */
  public discoverAndEnqueueProducts(products: Product[]): void {
    if (!this.hasSyncedServer) {
      void this.syncFromServer();
    }

    products.forEach((p) => {
      if (p.image && (!this.records[p.image] || this.records[p.image].status === 'failed')) {
        void this.enqueue({
          url: p.image,
          productId: p.id,
          productName: p.name,
          category: p.primaryCategory,
          sourceTag: 'catalog',
        });
      }
      if (p.additionalImages && p.additionalImages.length > 0) {
        p.additionalImages.forEach((img) => {
          if (img && (!this.records[img] || this.records[img].status === 'failed')) {
            void this.enqueue({
              url: img,
              productId: p.id,
              productName: p.name,
              category: p.primaryCategory,
              sourceTag: 'gallery',
            });
          }
        });
      }
    });
  }

  /**
   * Process a single asset through the real backend AI + Sharp cropping pipeline
   */
  public async enqueue(task: ImageTask): Promise<ProcessedImageRecord | null> {
    if (!task.url || this.inFlightUrls.has(task.url)) {
      return this.records[task.url] || null;
    }

    // If URL is already safely processed and not forced, avoid duplicate request unless failed
    if (this.records[task.url] && this.records[task.url].status !== 'failed') {
      return this.records[task.url];
    }

    return this.processOneOnServer(task);
  }

  public async processOneOnServer(task: ImageTask): Promise<ProcessedImageRecord | null> {
    if (!task.url) return null;
    this.inFlightUrls.add(task.url);
    this.summary = {
      ...this.summary,
      pending: this.inFlightUrls.size,
      isProcessing: true,
    };
    this.notify();

    try {
      const res = await fetch('/api/images/process-one', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: task.url,
          productId: task.productId,
          productName: task.productName,
          category: task.category,
          sourceTag: task.sourceTag || 'dynamic',
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as {
        record: ProcessedImageRecord;
        manifest: ImagePipelineManifest;
      };
      this.inFlightUrls.delete(task.url);
      if (data.manifest) {
        this.applyManifest(data.manifest);
      } else if (data.record) {
        this.records[task.url] = data.record;
        this.summary = this.computeLocalSummary();
        this.notify();
      }
      return data.record;
    } catch (err) {
      console.warn('[ImagePipeline] Backend process-one fallback to original:', err);
      this.inFlightUrls.delete(task.url);
      this.summary = {
        ...this.summary,
        pending: this.inFlightUrls.size,
        isProcessing: this.inFlightUrls.size > 0,
      };
      this.notify();
      return null;
    }
  }

  /**
   * Scan entire website library & reprocess all eligible images via backend pipeline
   */
  public async reprocessAll(force = true): Promise<ImagePipelineManifest | null> {
    this.summary = { ...this.summary, isProcessing: true };
    this.notify();

    try {
      const res = await fetch('/api/images/process-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const manifest = (await res.json()) as ImagePipelineManifest;
      this.applyManifest(manifest);
      return manifest;
    } catch (err) {
      console.error('[ImagePipeline] process-all error:', err);
      this.summary = { ...this.summary, isProcessing: false };
      this.notify();
      return null;
    }
  }

  /**
   * Perform second complete verification scan & auto-requeue any incomplete assets
   */
  public async verifyCompleteCoverage(): Promise<{ verified: boolean; requeuedCount: number; brokenOrMissingImages: string[] } | null> {
    this.summary = { ...this.summary, isProcessing: true };
    this.notify();

    try {
      const res = await fetch('/api/images/verify', { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.manifest) {
        this.applyManifest(data.manifest);
      }
      return {
        verified: Boolean(data.verified),
        requeuedCount: Number(data.requeuedCount || 0),
        brokenOrMissingImages: data.brokenOrMissingImages || [],
      };
    } catch (err) {
      console.error('[ImagePipeline] verify error:', err);
      this.summary = { ...this.summary, isProcessing: false };
      this.notify();
      return null;
    }
  }

  /**
   * Upload a new product image file -> stored untouched in /assets/uploads -> auto-processed by backend AI pipeline
   */
  public async uploadAndProcessFile(
    file: File,
    meta?: { productId?: string; productName?: string; category?: string }
  ): Promise<{ originalUrl: string; processedUrl: string; record: ProcessedImageRecord } | null> {
    const form = new FormData();
    form.append('file', file);
    if (meta?.productId) form.append('productId', meta.productId);
    if (meta?.productName) form.append('productName', meta.productName);
    if (meta?.category) form.append('category', meta.category);

    const res = await fetch('/api/images/upload', {
      method: 'POST',
      body: form,
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to upload & process image');
    }

    const data = (await res.json()) as {
      originalUrl: string;
      processedUrl: string;
      record: ProcessedImageRecord;
      manifest: ImagePipelineManifest;
    };

    if (data.manifest) {
      this.applyManifest(data.manifest);
    }
    return data;
  }

  /**
   * Upload an authorized clean unwatermarked replacement source for a flagged image
   */
  public async uploadCleanSource(
    originalUrl: string,
    file: File
  ): Promise<ProcessedImageRecord | null> {
    const form = new FormData();
    form.append('originalUrl', originalUrl);
    form.append('file', file);

    const res = await fetch('/api/images/upload-clean', {
      method: 'POST',
      body: form,
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to upload clean replacement image');
    }

    const data = (await res.json()) as {
      record: ProcessedImageRecord;
      manifest: ImagePipelineManifest;
    };

    if (data.manifest) {
      this.applyManifest(data.manifest);
    }
    return data.record;
  }

  public getRecord(url: string): ProcessedImageRecord | undefined {
    return this.records[url];
  }

  public getAllRecords(): Record<string, ProcessedImageRecord> {
    return { ...this.records };
  }

  public getSummary(): PipelineSummary {
    return { ...this.summary };
  }
}

export const imageQueueService = new ImageQueueService();
