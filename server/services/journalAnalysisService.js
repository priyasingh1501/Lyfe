const OpenAI = require('openai');

class JournalAnalysisService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async analyzeJournalEntry(content, title = '') {
    try {
      const prompt = this.buildAnalysisPrompt(content, title);
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are Alfred, an AI assistant that analyzes journal entries to provide insights about the user's emotional state, topics of interest, and underlying beliefs or values. 

Your analysis should be:
- Accurate and empathetic
- Focused on understanding the user's perspective
- Helpful for personal growth and self-reflection
- Respectful of privacy and sensitive topics

Available emotions: joy, sadness, anger, fear, surprise, disgust, love, anxiety, excitement, contentment, frustration, gratitude, loneliness, hope, disappointment, pride, shame, relief, confusion, peace, overwhelmed, confident, vulnerable, motivated, tired, energetic, calm, stressed, curious, nostalgic

Return your analysis in the following JSON format:
{
  "emotion": {
    "primary": "primary emotion from the list below",
    "secondary": "secondary emotion from the list below (optional)",
    "intensity": 1-10,
    "confidence": 0.0 to 1.0
  },
  "topics": [
    {
      "name": "topic name",
      "confidence": 0.0 to 1.0
    }
  ],
  "beliefs": [
    {
      "belief": "description of belief or value",
      "confidence": 0.0 to 1.0,
      "category": "personal_values|life_philosophy|relationships|work_ethics|spirituality|health_wellness|other"
    }
  ],
  "summary": "brief summary of the entry",
  "insights": ["insight 1", "insight 2", "insight 3"]
}`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      const analysisText = response.choices[0].message.content;
      
      // Parse the JSON response
      let analysis;
      try {
        analysis = JSON.parse(analysisText);
      } catch (parseError) {
        console.error('Error parsing analysis JSON:', parseError);
        // Fallback analysis if JSON parsing fails
        analysis = this.createFallbackAnalysis(content);
      }

      // Validate and clean the analysis
      return this.validateAnalysis(analysis);
    } catch (error) {
      console.error('Error analyzing journal entry:', error);
      return this.createFallbackAnalysis(content);
    }
  }

  buildAnalysisPrompt(content, title) {
    let prompt = `Please analyze the following journal entry:\n\n`;
    
    if (title) {
      prompt += `Title: ${title}\n\n`;
    }
    
    prompt += `Content: ${content}\n\n`;
    
    prompt += `Please provide a comprehensive analysis including:
1. Sentiment analysis (emotional tone and intensity)
2. Main topics discussed
3. Any beliefs, values, or philosophical perspectives expressed
4. A brief summary
5. Key insights for personal growth

Focus on understanding the writer's emotional state, concerns, and underlying values. Be empathetic and supportive in your analysis.`;
    
    return prompt;
  }

  validateAnalysis(analysis) {
    // Ensure all required fields exist with proper structure
    const validated = {
      sentiment: {
        score: Math.max(-1, Math.min(1, analysis.sentiment?.score || 0)),
        label: analysis.sentiment?.label || 'neutral',
        confidence: Math.max(0, Math.min(1, analysis.sentiment?.confidence || 0.5))
      },
      topics: (analysis.topics || []).map(topic => ({
        name: topic.name || 'Unknown',
        confidence: Math.max(0, Math.min(1, topic.confidence || 0.5))
      })).slice(0, 5), // Limit to top 5 topics
      beliefs: (analysis.beliefs || []).map(belief => ({
        belief: belief.belief || 'Unknown',
        confidence: Math.max(0, Math.min(1, belief.confidence || 0.5)),
        category: belief.category || 'other'
      })).slice(0, 3), // Limit to top 3 beliefs
      summary: analysis.summary || 'No summary available',
      insights: (analysis.insights || []).slice(0, 3) // Limit to top 3 insights
    };

    // Validate sentiment label
    const validSentimentLabels = ['very_negative', 'negative', 'neutral', 'positive', 'very_positive'];
    if (!validSentimentLabels.includes(validated.sentiment.label)) {
      validated.sentiment.label = 'neutral';
    }

    // Validate belief categories
    const validBeliefCategories = ['personal_values', 'life_philosophy', 'relationships', 'work_ethics', 'spirituality', 'health_wellness', 'other'];
    validated.beliefs = validated.beliefs.map(belief => ({
      ...belief,
      category: validBeliefCategories.includes(belief.category) ? belief.category : 'other'
    }));

    return validated;
  }

  createFallbackAnalysis(content) {
    // Simple fallback analysis when AI analysis fails
    const wordCount = content.split(' ').length;
    const hasPositiveWords = /good|great|happy|love|joy|amazing|wonderful|excellent|fantastic/i.test(content);
    const hasNegativeWords = /bad|terrible|awful|hate|sad|angry|frustrated|disappointed|worried|anxious/i.test(content);
    
    let primaryEmotion = 'contentment';
    let intensity = 5;
    
    if (hasPositiveWords && !hasNegativeWords) {
      primaryEmotion = 'joy';
      intensity = 7;
    } else if (hasNegativeWords && !hasPositiveWords) {
      primaryEmotion = 'sadness';
      intensity = 6;
    }

    return {
      emotion: {
        primary: primaryEmotion,
        secondary: null,
        intensity: intensity,
        confidence: 0.3
      },
      topics: [
        { name: 'general reflection', confidence: 0.5 }
      ],
      beliefs: [],
      summary: `A ${wordCount}-word journal entry reflecting on personal thoughts and experiences.`,
      insights: ['Consider reflecting on the main themes of this entry for deeper understanding.']
    };
  }

  async analyzeMultipleEntries(entries) {
    try {
      const analyses = [];
      
      for (const entry of entries) {
        const analysis = await this.analyzeJournalEntry(entry.content, entry.title);
        analyses.push({
          entryId: entry._id,
          analysis
        });
      }
      
      return analyses;
    } catch (error) {
      console.error('Error analyzing multiple entries:', error);
      throw error;
    }
  }

  async generateTrendAnalysis(analyses) {
    try {
      if (analyses.length === 0) {
        return {
          emotionTrend: 'stable',
          commonTopics: [],
          evolvingBeliefs: [],
          summary: 'No entries available for trend analysis.'
        };
      }

      const prompt = this.buildTrendAnalysisPrompt(analyses);
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are Alfred, analyzing patterns across multiple journal entries to identify trends in the user's emotional state, recurring topics, and evolving beliefs. Provide insights that help the user understand their personal growth and patterns.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 800
      });

      const trendText = response.choices[0].message.content;
      
      try {
        return JSON.parse(trendText);
      } catch (parseError) {
        return {
          emotionTrend: 'stable',
          commonTopics: [],
          evolvingBeliefs: [],
          summary: 'Trend analysis completed but detailed insights are not available.'
        };
      }
    } catch (error) {
      console.error('Error generating trend analysis:', error);
      return {
        emotionTrend: 'stable',
        commonTopics: [],
        evolvingBeliefs: [],
        summary: 'Unable to complete trend analysis at this time.'
      };
    }
  }

  buildTrendAnalysisPrompt(analyses) {
    let prompt = `Analyze the following journal entry analyses to identify trends and patterns:\n\n`;
    
    analyses.forEach((item, index) => {
      prompt += `Entry ${index + 1}:\n`;
      prompt += `- Emotion: ${item.analysis.emotion.primary} (intensity: ${item.analysis.emotion.intensity})\n`;
      if (item.analysis.emotion.secondary) {
        prompt += `- Secondary Emotion: ${item.analysis.emotion.secondary}\n`;
      }
      prompt += `- Topics: ${item.analysis.topics.map(t => t.name).join(', ')}\n`;
      prompt += `- Beliefs: ${item.analysis.beliefs.map(b => b.belief).join(', ')}\n`;
      prompt += `- Summary: ${item.analysis.summary}\n\n`;
    });
    
    prompt += `Please provide a trend analysis in JSON format:
{
  "emotionTrend": "improving|declining|stable|volatile",
  "commonTopics": ["topic1", "topic2", "topic3"],
  "evolvingBeliefs": ["belief1", "belief2"],
  "summary": "overall trend summary"
}`;
    
    return prompt;
  }
}

module.exports = JournalAnalysisService;
