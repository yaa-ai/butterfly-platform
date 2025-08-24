// Database Types for Butterfly Platform
// These types correspond to the Supabase database schema

export interface UserProfile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  company?: string;
  job_title?: string;
  location?: string;
  website?: string;
  linkedin_url?: string;
  twitter_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  theme: 'light' | 'dark' | 'auto';
  notifications_enabled: boolean;
  email_notifications: boolean;
  auto_post_to_linkedin: boolean;
  content_review_required: boolean;
  ai_model_preference: 'gpt-4' | 'gpt-3.5-turbo' | 'gemini-pro';
  created_at: string;
  updated_at: string;
}

export interface ApiKey {
  id: string;
  user_id: string;
  service_name: 'openai' | 'gemini' | 'linkedin';
  key_name: string;
  encrypted_key: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SocialConnection {
  id: string;
  user_id: string;
  platform: 'linkedin' | 'twitter' | 'facebook';
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: string;
  platform_user_id?: string;
  platform_username?: string;
  is_connected: boolean;
  last_sync_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ContentPost {
  id: string;
  user_id: string;
  title?: string;
  content: string;
  platform: 'linkedin' | 'twitter' | 'facebook';
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  ai_model_used?: string;
  tokens_used?: number;
  scheduled_for?: string;
  published_at?: string;
  platform_post_id?: string;
  engagement_metrics?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UserActivityLog {
  id: string;
  user_id: string;
  action: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Database enums
export type ThemeType = 'light' | 'dark' | 'auto';
export type AiModelType = 'gpt-4' | 'gpt-3.5-turbo' | 'gemini-pro';
export type ServiceType = 'openai' | 'gemini' | 'linkedin';
export type PlatformType = 'linkedin' | 'twitter' | 'facebook';
export type PostStatusType = 'draft' | 'scheduled' | 'published' | 'failed';

// Insert types (for creating new records)
export interface InsertUserProfile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  company?: string;
  job_title?: string;
  location?: string;
  website?: string;
  linkedin_url?: string;
  twitter_url?: string;
}

export interface InsertUserSettings {
  id: string;
  theme?: ThemeType;
  notifications_enabled?: boolean;
  email_notifications?: boolean;
  auto_post_to_linkedin?: boolean;
  content_review_required?: boolean;
  ai_model_preference?: AiModelType;
}

export interface InsertApiKey {
  user_id: string;
  service_name: ServiceType;
  key_name: string;
  encrypted_key: string;
  is_active?: boolean;
}

export interface InsertSocialConnection {
  user_id: string;
  platform: PlatformType;
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: string;
  platform_user_id?: string;
  platform_username?: string;
  is_connected?: boolean;
  last_sync_at?: string;
}

export interface InsertContentPost {
  user_id: string;
  title?: string;
  content: string;
  platform: PlatformType;
  status?: PostStatusType;
  ai_model_used?: string;
  tokens_used?: number;
  scheduled_for?: string;
  published_at?: string;
  platform_post_id?: string;
  engagement_metrics?: Record<string, any>;
}

export interface InsertUserActivityLog {
  user_id: string;
  action: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

// Update types (for updating existing records)
export interface UpdateUserProfile {
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  company?: string;
  job_title?: string;
  location?: string;
  website?: string;
  linkedin_url?: string;
  twitter_url?: string;
}

export interface UpdateUserSettings {
  theme?: ThemeType;
  notifications_enabled?: boolean;
  email_notifications?: boolean;
  auto_post_to_linkedin?: boolean;
  content_review_required?: boolean;
  ai_model_preference?: AiModelType;
}

export interface UpdateApiKey {
  key_name?: string;
  encrypted_key?: string;
  is_active?: boolean;
}

export interface UpdateSocialConnection {
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: string;
  platform_user_id?: string;
  platform_username?: string;
  is_connected?: boolean;
  last_sync_at?: string;
}

export interface UpdateContentPost {
  title?: string;
  content?: string;
  status?: PostStatusType;
  ai_model_used?: string;
  tokens_used?: number;
  scheduled_for?: string;
  published_at?: string;
  platform_post_id?: string;
  engagement_metrics?: Record<string, any>;
}

// Database response types
export interface DatabaseResponse<T> {
  data: T | null;
  error: any | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  error: any | null;
}
