// AI Content Generation Service
// This service will handle AI-powered content generation for social media posts

interface ContentRequest {
  platform: 'linkedin' | 'twitter' | 'facebook';
  topic: string;
  tone: 'professional' | 'casual' | 'enthusiastic' | 'thoughtful';
  length: 'short' | 'medium' | 'long';
  includeHashtags?: boolean;
  includeCallToAction?: boolean;
}

interface ContentResponse {
  content: string;
  hashtags?: string[];
  suggestions?: string[];
  model: string;
  tokens_used?: number;
}

interface AiModel {
  id: string;
  name: string;
  provider: 'openai' | 'gemini';
  maxTokens: number;
  costPerToken: number;
}

class AiContentService {
  private openaiApiKey: string | null = null;
  private geminiApiKey: string | null = null;
  private defaultModel: string = 'gpt-4';

  // Initialize with API keys
  initialize(openaiKey?: string, geminiKey?: string) {
    this.openaiApiKey = openaiKey || null;
    this.geminiApiKey = geminiKey || null;
  }

  // Get available models
  getAvailableModels(): AiModel[] {
    const models: AiModel[] = [];

    if (this.openaiApiKey) {
      models.push(
        { id: 'gpt-4', name: 'GPT-4', provider: 'openai', maxTokens: 8192, costPerToken: 0.00003 },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai', maxTokens: 4096, costPerToken: 0.000002 }
      );
    }

    if (this.geminiApiKey) {
      models.push(
        { id: 'gemini-pro', name: 'Gemini Pro', provider: 'gemini', maxTokens: 30720, costPerToken: 0.00000125 }
      );
    }

    return models;
  }

  // Generate content using AI
  async generateContent(request: ContentRequest, modelId?: string): Promise<ContentResponse> {
    const models = this.getAvailableModels();
    const model = models.find(m => m.id === (modelId || this.defaultModel)) || models[0];

    if (!model) {
      throw new Error('No AI models available. Please configure API keys in settings.');
    }

    try {
      if (model.provider === 'openai') {
        return await this.generateWithOpenAI(request, model);
      } else if (model.provider === 'gemini') {
        return await this.generateWithGemini(request, model);
      } else {
        throw new Error('Unsupported AI provider');
      }
    } catch (error) {
      console.error('Error generating content:', error);
      throw error;
    }
  }

  // Generate content using OpenAI
  private async generateWithOpenAI(request: ContentRequest, model: AiModel): Promise<ContentResponse> {
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = this.buildPrompt(request);
    
    // This would make a real API call to OpenAI
    // For now, return mock content
    const mockContent = this.generateMockContent(request);
    
    return {
      content: mockContent,
      hashtags: request.includeHashtags ? ['#AI', '#SocialMedia', '#Innovation'] : undefined,
      suggestions: ['Add a personal story', 'Include industry insights', 'Ask a question'],
      model: model.name,
      tokens_used: 150,
    };
  }

  // Generate content using Gemini
  private async generateWithGemini(request: ContentRequest, model: AiModel): Promise<ContentResponse> {
    if (!this.geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    const prompt = this.buildPrompt(request);
    
    // This would make a real API call to Gemini
    // For now, return mock content
    const mockContent = this.generateMockContent(request);
    
    return {
      content: mockContent,
      hashtags: request.includeHashtags ? ['#AI', '#SocialMedia', '#Innovation'] : undefined,
      suggestions: ['Add a personal story', 'Include industry insights', 'Ask a question'],
      model: model.name,
      tokens_used: 120,
    };
  }

  // Build prompt for AI
  private buildPrompt(request: ContentRequest): string {
    const platformSpecifics = {
      linkedin: 'professional networking platform',
      twitter: 'social media platform with character limits',
      facebook: 'social networking platform for friends and family',
    };

    const toneSpecifics = {
      professional: 'formal and business-like',
      casual: 'friendly and conversational',
      enthusiastic: 'excited and energetic',
      thoughtful: 'reflective and insightful',
    };

    const lengthSpecifics = {
      short: 'concise and to the point',
      medium: 'balanced and informative',
      long: 'detailed and comprehensive',
    };

    return `Create a ${request.length} ${request.tone} social media post for ${platformSpecifics[request.platform]} about "${request.topic}". 
    
    Requirements:
    - Tone: ${toneSpecifics[request.tone]}
    - Length: ${lengthSpecifics[request.length]}
    ${request.includeHashtags ? '- Include relevant hashtags' : ''}
    ${request.includeCallToAction ? '- Include a call to action' : ''}
    
    Make it engaging and authentic.`;
  }

  // Generate mock content for testing
  private generateMockContent(request: ContentRequest): string {
    const mockPosts = {
      linkedin: {
        professional: [
          `🚀 Excited to share insights on ${request.topic}! 

As professionals, we're constantly evolving in our approach to ${request.topic.toLowerCase()}. The key is staying adaptable and embracing new methodologies.

What strategies have you found most effective in your journey with ${request.topic.toLowerCase()}? I'd love to hear your thoughts and experiences in the comments below.

#${request.topic.replace(/\s+/g, '')} #ProfessionalDevelopment #Innovation`,
          
          `💡 Thought leadership moment: ${request.topic} isn't just a trend—it's a fundamental shift in how we approach our work.

After years of working with ${request.topic.toLowerCase()}, I've learned that success comes from understanding the underlying principles, not just following the latest buzzwords.

Key takeaway: Focus on sustainable practices that align with your core values and long-term goals.

What's your perspective on ${request.topic.toLowerCase()}? Let's discuss in the comments!`
        ],
        casual: [
          `Hey LinkedIn fam! 👋 

Just wanted to share some thoughts on ${request.topic}. You know what I've noticed? The best results come when we keep it simple and authentic.

No fancy jargon, no overcomplicated processes. Just solid, practical approaches that actually work.

Anyone else feel the same way about ${request.topic.toLowerCase()}? Drop your thoughts below! 👇

#${request.topic.replace(/\s+/g, '')} #KeepItSimple #Authentic`
        ]
      }
    };

    const platformPosts = mockPosts[request.platform as keyof typeof mockPosts];
    const tonePosts = platformPosts?.[request.tone as keyof typeof platformPosts];
    
    if (tonePosts && Array.isArray(tonePosts)) {
      return tonePosts[Math.floor(Math.random() * tonePosts.length)];
    }

    // Fallback content
    return `Exciting developments in ${request.topic}! 

The landscape is evolving rapidly, and it's crucial to stay informed about the latest trends and best practices.

What are your thoughts on ${request.topic.toLowerCase()}? I'd love to hear your perspective!

#${request.topic.replace(/\s+/g, '')} #Innovation #ProfessionalGrowth`;
  }

  // Check if service is configured
  isConfigured(): boolean {
    return !!(this.openaiApiKey || this.geminiApiKey);
  }

  // Get configuration status
  getConfigurationStatus() {
    return {
      openai: !!this.openaiApiKey,
      gemini: !!this.geminiApiKey,
      configured: this.isConfigured(),
    };
  }
}

// Export singleton instance
export const aiContentService = new AiContentService();
