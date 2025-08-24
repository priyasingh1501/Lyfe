const OpenAI = require('openai');
const { Agent } = require('@openai/agents');

class OpenAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    this.agent = new Agent({
      name: 'LyfeLifestyleAssistant',
      client: this.openai,
      instructions: this.getAgentInstructions(),
      tools: this.getAgentTools(),
    });
  }

  getAgentInstructions() {
    return `You are Lyfe, an intelligent AI lifestyle assistant designed to help users manage their time, tasks, energy, finances, and overall life better.

Your core responsibilities:
1. **Understand user intent** - Analyze what the user wants to accomplish
2. **Provide actionable advice** - Give practical, personalized recommendations
3. **Execute actions** - Create tasks, journal entries, expenses, schedules, etc.
4. **Learn user preferences** - Remember and adapt to user's communication style and needs
5. **Maintain context** - Keep track of ongoing conversations and user state

Communication Style:
- Be warm, encouraging, and supportive
- Use the user's preferred communication style
- Provide specific, actionable advice
- Ask clarifying questions when needed
- Celebrate user progress and achievements

IMPORTANT: When using tools, always provide meaningful content in your response. Don't just say you processed the request - give actual recommendations, insights, or helpful information.

For example:
- If recommending content: "Based on your love for sci-fi and preference for thought-provoking stories, I recommend 'Arrival' (2016). This film combines intelligent storytelling with emotional depth, perfect for your taste."
- If creating a task: "I've created a task for 'Review monthly budget' with high priority since you mentioned financial planning is important this month."
- If scheduling time: "I've blocked 2 hours tomorrow morning for your project work, which aligns with your peak productivity hours."

Core Capabilities:
- Task Management: Create, organize, and prioritize tasks
- Time Management: Help schedule and optimize time usage
- Journaling: Assist with reflection and emotional processing
- Financial Tracking: Help track expenses and financial goals
- Content Recommendations: Suggest books, movies, podcasts based on user interests
- Goal Setting: Help break down and track progress on goals
- Energy Management: Provide advice based on user's energy levels
- Habit Building: Support positive habit formation

Always consider the user's current context (energy level, mood, location, time of day) when providing advice.`;
  }

  getAgentTools() {
    return [
      {
        type: 'function',
        function: {
          name: 'create_task',
          description: 'Create a new task for the user',
          parameters: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'The title of the task'
              },
              description: {
                type: 'string',
                description: 'Detailed description of the task'
              },
              priority: {
                type: 'string',
                enum: ['low', 'medium', 'high', 'urgent'],
                description: 'Priority level of the task'
              },
              category: {
                type: 'string',
                description: 'Category of the task (work, personal, health, etc.)'
              },
              dueDate: {
                type: 'string',
                description: 'Due date in ISO format (optional)'
              },
              estimatedDuration: {
                type: 'number',
                description: 'Estimated duration in minutes (optional)'
              }
            },
            required: ['title', 'description']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'create_journal_entry',
          description: 'Create a new journal entry for the user',
          parameters: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'Title for the journal entry'
              },
              content: {
                type: 'string',
                description: 'The journal entry content'
              },
              type: {
                type: 'string',
                enum: ['daily', 'gratitude', 'reflection', 'goal', 'dream', 'memory', 'creative'],
                description: 'Type of journal entry'
              },
              mood: {
                type: 'string',
                enum: ['excellent', 'good', 'neutral', 'bad', 'terrible'],
                description: 'User\'s current mood'
              },
              tags: {
                type: 'array',
                items: { type: 'string' },
                description: 'Tags for categorizing the entry'
              }
            },
            required: ['content']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'add_expense',
          description: 'Track a new expense for the user',
          parameters: {
            type: 'object',
            properties: {
              amount: {
                type: 'number',
                description: 'Amount spent'
              },
              description: {
                type: 'string',
                description: 'Description of the expense'
              },
              category: {
                type: 'string',
                description: 'Category of the expense'
              },
              date: {
                type: 'string',
                description: 'Date of the expense in ISO format (defaults to today)'
              }
            },
            required: ['amount', 'description']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'schedule_time',
          description: 'Schedule time for an activity or event',
          parameters: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'Title of the scheduled event'
              },
              description: {
                type: 'string',
                description: 'Description of the event'
              },
              startTime: {
                type: 'string',
                description: 'Start time in ISO format'
              },
              duration: {
                type: 'number',
                description: 'Duration in minutes'
              },
              type: {
                type: 'string',
                enum: ['work', 'personal', 'health', 'social', 'learning'],
                description: 'Type of scheduled activity'
              }
            },
            required: ['title', 'startTime', 'duration']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'recommend_content',
          description: 'Recommend books, movies, podcasts, or other content based on user preferences. After using this tool, provide the actual recommendations in your response.',
          parameters: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: ['book', 'movie', 'tv_show', 'podcast', 'article', 'course'],
                description: 'Type of content to recommend'
              },
              category: {
                type: 'string',
                description: 'Category or genre preference'
              },
              mood: {
                type: 'string',
                description: 'User\'s current mood for content matching'
              },
              difficulty: {
                type: 'string',
                enum: ['beginner', 'intermediate', 'advanced'],
                description: 'Preferred difficulty level'
              },
              timeInvestment: {
                type: 'string',
                enum: ['quick', 'moderate', 'extensive'],
                description: 'Preferred time investment'
              }
            },
            required: ['type']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'set_goal',
          description: 'Help user set or update a goal',
          parameters: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'Title of the goal'
              },
              description: {
                type: 'string',
                description: 'Detailed description of the goal'
              },
              category: {
                type: 'string',
                description: 'Category of the goal'
              },
              targetDate: {
                type: 'string',
                description: 'Target completion date in ISO format'
              },
              milestones: {
                type: 'array',
                items: { type: 'string' },
                description: 'Key milestones to achieve the goal'
              }
            },
            required: ['title', 'description']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'provide_insight',
          description: 'Provide personalized insights and recommendations',
          parameters: {
            type: 'object',
            properties: {
              insightType: {
                type: 'string',
                enum: ['productivity', 'wellness', 'finance', 'learning', 'relationships'],
                description: 'Type of insight to provide'
              },
              context: {
                type: 'string',
                description: 'Current context or situation'
              },
              recommendations: {
                type: 'array',
                items: { type: 'string' },
                description: 'Specific recommendations'
              }
            },
            required: ['insightType', 'recommendations']
          }
        }
      }
    ];
  }

  async generateResponse(message, userContext, userProfile) {
    try {
      // Prepare the conversation context
      const systemContext = this.buildSystemContext(userContext, userProfile);
      
      // Create conversation messages
      const messages = [
        {
          role: 'system',
          content: systemContext
        },
        {
          role: 'user',
          content: message
        }
      ];

      // Get AI response with potential tool calls
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages,
        tools: this.getAgentTools(),
        tool_choice: 'auto',
        temperature: 0.7,
        max_tokens: 1000
      });

      const assistantMessage = response.choices[0].message;
      
      // Handle tool calls if any
      let actions = [];
      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        actions = await this.processToolCalls(assistantMessage.tool_calls);
      }

      // Ensure we always have content, even if the AI only used tools
      let content = assistantMessage.content;
      if (!content && actions.length > 0) {
        // Generate better content based on the actions taken
        const actionDescriptions = actions.map(action => {
          switch (action.type) {
            case 'recommend_content':
              return 'I\'ve analyzed your preferences and found some great recommendations for you.';
            case 'create_task':
              return 'I\'ve created a task for you based on your request.';
            case 'create_journal_entry':
              return 'I\'ve added an entry to your journal.';
            case 'add_expense':
              return 'I\'ve tracked that expense for you.';
            case 'schedule_time':
              return 'I\'ve scheduled that time for you.';
            case 'set_goal':
              return 'I\'ve set a new goal for you.';
            case 'provide_insight':
              return 'I\'ve analyzed your data and provided some insights.';
            default:
              return `I've processed your request using ${action.type.replace(/_/g, ' ')}.`;
          }
        });
        content = actionDescriptions.join(' ');
      } else if (!content) {
        content = "I've processed your request. Is there anything else you'd like me to help you with?";
      }

      return {
        content: content,
        actions: actions,
        toolCalls: assistantMessage.tool_calls || []
      };
    } catch (error) {
      console.error('Error generating OpenAI response:', error);
      throw error;
    }
  }

  buildSystemContext(userContext, userProfile) {
    let context = this.getAgentInstructions();
    
    // Add user profile information
    if (userProfile) {
      context += `\n\nUser Profile:\n`;
      if (userProfile.goals && userProfile.goals.length > 0) {
        context += `- Active Goals: ${userProfile.goals.map(g => g.title).join(', ')}\n`;
      }
      if (userProfile.interests && userProfile.interests.length > 0) {
        context += `- Interests: ${userProfile.interests.map(i => i.category).join(', ')}\n`;
      }
      if (userProfile.patterns) {
        context += `- Productivity Peak Hours: ${userProfile.patterns.productivityPeakHours?.join(', ') || 'Not specified'}\n`;
        context += `- Preferred Work Duration: ${userProfile.patterns.preferredWorkDuration || 'Not specified'} minutes\n`;
      }
      if (userProfile.contentTaste) {
        context += `- Content Preferences: ${userProfile.contentTaste.bookGenres?.join(', ') || 'Not specified'}\n`;
      }
    }

    // Add current context
    if (userContext) {
      context += `\n\nCurrent Context:\n`;
      if (userContext.energyLevel) context += `- Energy Level: ${userContext.energyLevel}\n`;
      if (userContext.mood) context += `- Mood: ${userContext.mood}\n`;
      if (userContext.timeOfDay) context += `- Time of Day: ${userContext.timeOfDay}\n`;
      if (userContext.location) context += `- Location: ${userContext.location}\n`;
      if (userContext.currentGoal) context += `- Current Focus: ${userContext.currentGoal}\n`;
    }

    return context;
  }

  async processToolCalls(toolCalls) {
    const actions = [];
    
    for (const toolCall of toolCalls) {
      try {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);
        
        actions.push({
          type: toolName,
          data: toolArgs,
          status: 'pending',
          toolCallId: toolCall.id
        });
      } catch (error) {
        console.error('Error processing tool call:', error);
      }
    }
    
    return actions;
  }

  async generateContentRecommendations(userProfile, preferences = {}) {
    try {
      const prompt = this.buildRecommendationPrompt(userProfile, preferences);
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a content recommendation expert. Provide specific, personalized recommendations based on user preferences and interests.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 800
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error generating content recommendations:', error);
      throw error;
    }
  }

  buildRecommendationPrompt(userProfile, preferences) {
    let prompt = 'Based on the following user profile, recommend relevant content:\n\n';
    
    if (userProfile.contentTaste) {
      prompt += `Content Preferences:\n`;
      if (userProfile.contentTaste.bookGenres) {
        prompt += `- Book Genres: ${userProfile.contentTaste.bookGenres.join(', ')}\n`;
      }
      if (userProfile.contentTaste.movieGenres) {
        prompt += `- Movie Genres: ${userProfile.contentTaste.movieGenres.join(', ')}\n`;
      }
      if (userProfile.contentTaste.podcastTopics) {
        prompt += `- Podcast Topics: ${userProfile.contentTaste.podcastTopics.join(', ')}\n`;
      }
      prompt += `- Learning Style: ${userProfile.contentTaste.learningStyle || 'Not specified'}\n`;
      prompt += `- Preferred Difficulty: ${userProfile.contentTaste.preferredDifficulty || 'Not specified'}\n`;
    }

    if (userProfile.interests) {
      prompt += `\nInterests:\n`;
      userProfile.interests.forEach(interest => {
        prompt += `- ${interest.category}: ${interest.topics.join(', ')} (Intensity: ${interest.intensity}/10)\n`;
      });
    }

    if (preferences.type) {
      prompt += `\nRequested Content Type: ${preferences.type}\n`;
    }
    if (preferences.category) {
      prompt += `Preferred Category: ${preferences.category}\n`;
    }
    if (preferences.mood) {
      prompt += `Current Mood: ${preferences.mood}\n`;
    }

    prompt += '\nPlease provide 3-5 specific recommendations with brief explanations of why they would be a good fit.';

    return prompt;
  }

  async generateInsights(userData, conversationHistory) {
    try {
      const prompt = this.buildInsightPrompt(userData, conversationHistory);
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a lifestyle optimization expert. Analyze user data and provide actionable insights and recommendations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 600
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error generating insights:', error);
      throw error;
    }
  }

  buildInsightPrompt(userData, conversationHistory) {
    let prompt = 'Analyze the following user data and provide insights:\n\n';
    
    if (userData.tasks) {
      prompt += `Task Analysis:\n`;
      prompt += `- Total Tasks: ${userData.tasks.length}\n`;
      prompt += `- Completed: ${userData.tasks.filter(t => t.status === 'completed').length}\n`;
      prompt += `- Pending: ${userData.tasks.filter(t => t.status === 'pending').length}\n`;
    }

    if (userData.journal) {
      prompt += `\nJournal Patterns:\n`;
      prompt += `- Total Entries: ${userData.journal.entries?.length || 0}\n`;
      prompt += `- Current Streak: ${userData.journal.stats?.currentStreak || 0} days\n`;
    }

    if (userData.finance) {
      prompt += `\nFinancial Overview:\n`;
      prompt += `- Total Expenses: ${userData.finance.expenses?.length || 0}\n`;
    }

    if (conversationHistory && conversationHistory.length > 0) {
      prompt += `\nRecent Conversation Topics:\n`;
      const topics = conversationHistory
        .filter(msg => msg.role === 'user')
        .slice(-5)
        .map(msg => msg.content.substring(0, 100) + '...');
      topics.forEach((topic, i) => {
        prompt += `${i + 1}. ${topic}\n`;
      });
    }

    prompt += '\nPlease provide:\n1. Key insights about user patterns\n2. 3-5 actionable recommendations\n3. Areas for improvement\n4. Positive trends to celebrate';

    return prompt;
  }
}

module.exports = OpenAIService;
