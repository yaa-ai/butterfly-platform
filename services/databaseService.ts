import { supabase } from '@/lib/supabase';
import {
    ApiKey,
    ContentPost,
    DatabaseResponse,
    InsertContentPost,
    PaginatedResponse,
    SocialConnection,
    UpdateContentPost,
    UpdateUserProfile,
    UpdateUserSettings,
    UserActivityLog,
    UserProfile,
    UserSettings
} from '@/types/database';

// Simple encryption/decryption for API keys (in production, use proper encryption)
const encryptApiKey = (key: string): string => {
  // This is a simple base64 encoding - in production, use proper encryption
  return btoa(key);
};

const decryptApiKey = (encryptedKey: string): string => {
  // This is a simple base64 decoding - in production, use proper decryption
  return atob(encryptedKey);
};

export class DatabaseService {
  // User Profile Operations
  static async getUserProfile(userId: string): Promise<DatabaseResponse<UserProfile>> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async updateUserProfile(userId: string, updates: UpdateUserProfile): Promise<DatabaseResponse<UserProfile>> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // User Settings Operations
  static async getUserSettings(userId: string): Promise<DatabaseResponse<UserSettings>> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('id', userId)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async updateUserSettings(userId: string, updates: UpdateUserSettings): Promise<DatabaseResponse<UserSettings>> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // API Keys Operations
  static async getApiKeys(userId: string): Promise<DatabaseResponse<ApiKey[]>> {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getApiKey(userId: string, serviceName: string, keyName: string): Promise<DatabaseResponse<ApiKey>> {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', userId)
        .eq('service_name', serviceName)
        .eq('key_name', keyName)
        .eq('is_active', true)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async saveApiKey(userId: string, serviceName: string, keyName: string, apiKey: string): Promise<DatabaseResponse<ApiKey>> {
    try {
      const encryptedKey = encryptApiKey(apiKey);
      
      // Check if key already exists
      const existingKey = await this.getApiKey(userId, serviceName, keyName);
      
      if (existingKey.data) {
        // Update existing key
        const { data, error } = await supabase
          .from('api_keys')
          .update({ encrypted_key: encryptedKey })
          .eq('id', existingKey.data.id)
          .select()
          .single();

        return { data, error };
      } else {
        // Insert new key
        const { data, error } = await supabase
          .from('api_keys')
          .insert({
            user_id: userId,
            service_name: serviceName,
            key_name: keyName,
            encrypted_key: encryptedKey,
            is_active: true,
          })
          .select()
          .single();

        return { data, error };
      }
    } catch (error) {
      return { data: null, error };
    }
  }

  static async deleteApiKey(userId: string, serviceName: string, keyName: string): Promise<DatabaseResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('user_id', userId)
        .eq('service_name', serviceName)
        .eq('key_name', keyName);

      return { data: !error, error };
    } catch (error) {
      return { data: false, error };
    }
  }

  static async getDecryptedApiKey(userId: string, serviceName: string, keyName: string): Promise<DatabaseResponse<string>> {
    try {
      const { data, error } = await this.getApiKey(userId, serviceName, keyName);
      
      if (error || !data) {
        return { data: null, error };
      }

      const decryptedKey = decryptApiKey(data.encrypted_key);
      return { data: decryptedKey, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Social Connections Operations
  static async getSocialConnections(userId: string): Promise<DatabaseResponse<SocialConnection[]>> {
    try {
      const { data, error } = await supabase
        .from('social_connections')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getSocialConnection(userId: string, platform: string): Promise<DatabaseResponse<SocialConnection>> {
    try {
      const { data, error } = await supabase
        .from('social_connections')
        .select('*')
        .eq('user_id', userId)
        .eq('platform', platform)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async saveSocialConnection(userId: string, platform: string, connectionData: Partial<SocialConnection>): Promise<DatabaseResponse<SocialConnection>> {
    try {
      // Check if connection already exists
      const existingConnection = await this.getSocialConnection(userId, platform);
      
      if (existingConnection.data) {
        // Update existing connection
        const { data, error } = await supabase
          .from('social_connections')
          .update({
            ...connectionData,
            is_connected: true,
            last_sync_at: new Date().toISOString(),
          })
          .eq('id', existingConnection.data.id)
          .select()
          .single();

        return { data, error };
      } else {
        // Insert new connection
        const { data, error } = await supabase
          .from('social_connections')
          .insert({
            user_id: userId,
            platform,
            ...connectionData,
            is_connected: true,
            last_sync_at: new Date().toISOString(),
          })
          .select()
          .single();

        return { data, error };
      }
    } catch (error) {
      return { data: null, error };
    }
  }

  static async disconnectSocialPlatform(userId: string, platform: string): Promise<DatabaseResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('social_connections')
        .update({
          is_connected: false,
          access_token: null,
          refresh_token: null,
          token_expires_at: null,
        })
        .eq('user_id', userId)
        .eq('platform', platform);

      return { data: !error, error };
    } catch (error) {
      return { data: false, error };
    }
  }

  // Content Posts Operations
  static async getContentPosts(userId: string, limit = 10): Promise<PaginatedResponse<ContentPost>> {
    try {
      const { data, error, count } = await supabase
        .from('content_posts')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      return { data: data || [], count: count || 0, error };
    } catch (error) {
      return { data: [], count: 0, error };
    }
  }

  static async createContentPost(postData: InsertContentPost): Promise<DatabaseResponse<ContentPost>> {
    try {
      const { data, error } = await supabase
        .from('content_posts')
        .insert(postData)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async updateContentPost(postId: string, updates: UpdateContentPost): Promise<DatabaseResponse<ContentPost>> {
    try {
      const { data, error } = await supabase
        .from('content_posts')
        .update(updates)
        .eq('id', postId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async deleteContentPost(postId: string): Promise<DatabaseResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('content_posts')
        .delete()
        .eq('id', postId);

      return { data: !error, error };
    } catch (error) {
      return { data: false, error };
    }
  }

  // Activity Log Operations
  static async logActivity(userId: string, action: string, details?: Record<string, any>): Promise<DatabaseResponse<UserActivityLog>> {
    try {
      const { data, error } = await supabase
        .from('user_activity_log')
        .insert({
          user_id: userId,
          action,
          details,
          ip_address: typeof window !== 'undefined' ? 'client-side' : 'server-side',
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getActivityLog(userId: string, limit = 20): Promise<PaginatedResponse<UserActivityLog>> {
    try {
      const { data, error, count } = await supabase
        .from('user_activity_log')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      return { data: data || [], count: count || 0, error };
    } catch (error) {
      return { data: [], count: 0, error };
    }
  }

  // Utility Methods
  static async getUserStats(userId: string): Promise<DatabaseResponse<{
    totalPosts: number;
    publishedPosts: number;
    connectedPlatforms: number;
    apiKeysCount: number;
  }>> {
    try {
      // Get posts count
      const { count: totalPosts } = await supabase
        .from('content_posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Get published posts count
      const { count: publishedPosts } = await supabase
        .from('content_posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'published');

      // Get connected platforms count
      const { count: connectedPlatforms } = await supabase
        .from('social_connections')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_connected', true);

      // Get API keys count
      const { count: apiKeysCount } = await supabase
        .from('api_keys')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_active', true);

      return {
        data: {
          totalPosts: totalPosts || 0,
          publishedPosts: publishedPosts || 0,
          connectedPlatforms: connectedPlatforms || 0,
          apiKeysCount: apiKeysCount || 0,
        },
        error: null,
      };
    } catch (error) {
      return { data: null, error };
    }
  }
}
