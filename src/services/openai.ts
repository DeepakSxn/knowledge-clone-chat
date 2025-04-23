
import { getApiKey } from './api';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionOptions {
  vectorResults?: string;
  webResults?: string;
  maxTokens?: number;
}

export const generateChatCompletion = async (
  messages: ChatMessage[],
  options: ChatCompletionOptions = {}
): Promise<string> => {
  try {
    const apiKey = getApiKey('openai');
    
    // Create system message with context from vector database if available
    let systemContent = "You are a helpful assistant with access to the user's knowledge database.";
    
    if (options.vectorResults) {
      systemContent += " Here is relevant information from the user's knowledge database:\n\n" + options.vectorResults;
    }
    
    if (options.webResults) {
      systemContent += "\n\nAdditional information from web search:\n\n" + options.webResults;
    }
    
    // Add system message at the beginning if not already present
    const messagesWithSystem = messages[0]?.role === 'system' 
      ? messages 
      : [{ role: 'system', content: systemContent }, ...messages];
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messagesWithSystem,
        max_tokens: options.maxTokens || 1000,
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating chat completion:', error);
    throw error;
  }
};
