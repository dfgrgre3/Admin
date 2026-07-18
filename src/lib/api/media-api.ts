import { adminApi } from "./admin-api";

export interface MediaAsset {
  id: string;
  type: string;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  mimeType?: string;
  sizeBytes: number;
  aiTags?: string[];
  aiObjects?: string[];
  aiSummary?: string;
  aiIndexed: boolean;
  folder: string;
  createdAt: string;
}

export interface LandingSection {
  id: string;
  key: string;
  title: string;
  subtitle: string;
  content: string;
  imageUrl?: string;
  buttonText: string;
  buttonUrl: string;
  orderIndex: number;
  isActive: boolean;
}

export const mediaApi = {
  list: (params?: { type?: string; folder?: string; tags?: string; q?: string }) =>
    adminApi.get<MediaAsset[]>("/media", params),
  create: (body: Partial<MediaAsset>) => adminApi.post<MediaAsset>("/media", body),
  tags: () => adminApi.get<string[]>("/media/tags"),
};

export const landingApi = {
  list: () => adminApi.get<LandingSection[]>("/landing"),
  upsert: (body: Partial<LandingSection>) => adminApi.post<LandingSection>("/landing", body),
};

export const MEDIA_TYPES = [
  { value: "IMAGE", label: "صورة" },
  { value: "VIDEO", label: "فيديو" },
  { value: "DOCUMENT", label: "مستند" },
  { value: "AUDIO", label: "صوت" },
];
