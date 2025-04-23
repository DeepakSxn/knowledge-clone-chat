
import { getApiKey } from './api';

// Define namespace for vectors
const NAMESPACE = 'knowledge-clone';

// Interface for document metadata
interface DocumentMetadata {
  source: string;
  timestamp: string;
  title?: string;
}

/**
 * Upload a document to Pinecone vector database
 * @param file The file to upload
 * @param documentId Optional document ID
 */
export const uploadDocumentToPinecone = async (file: File, documentId?: string): Promise<boolean> => {
  try {
    const apiKey = getApiKey('pinecone');
    
    // Step 1: Read the file content
    const fileContent = await readFileAsText(file);
    
    // Step 2: Create vector embeddings via OpenAI embeddings API
    const openaiApiKey = getApiKey('openai');
    const vectors = await createEmbeddings(fileContent, openaiApiKey);
    
    // Step 3: Upload vectors to Pinecone
    const metadata: DocumentMetadata = {
      source: file.name,
      timestamp: new Date().toISOString(),
      title: file.name
    };
    
    // Use file name as ID if not provided
    const id = documentId || file.name.replace(/\s+/g, '-').toLowerCase();
    
    // Upload to Pinecone
    const response = await fetch('https://api.pinecone.io/vectors/upsert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': apiKey
      },
      body: JSON.stringify({
        namespace: NAMESPACE,
        vectors: [{
          id,
          values: vectors,
          metadata
        }]
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Pinecone API error:', errorData);
      throw new Error(`Pinecone API error: ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error uploading to Pinecone:', error);
    throw error;
  }
};

/**
 * Search for relevant documents in Pinecone
 * @param query The search query
 * @param topK Number of results to return
 */
export const searchPinecone = async (query: string, topK = 3): Promise<string> => {
  try {
    const apiKey = getApiKey('pinecone');
    const openaiApiKey = getApiKey('openai');
    
    // Create embedding for the query
    const queryVector = await createEmbeddings(query, openaiApiKey);
    
    // Query Pinecone
    const response = await fetch('https://api.pinecone.io/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': apiKey
      },
      body: JSON.stringify({
        namespace: NAMESPACE,
        topK,
        vector: queryVector,
        includeMetadata: true
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Pinecone search API error:', errorData);
      throw new Error(`Pinecone search API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Process and return results as a string
    const results = data.matches.map((match: any) => {
      return `Source: ${match.metadata.source}\nRelevance: ${match.score}\n${match.metadata.content || 'No content available'}\n`;
    }).join('\n---\n');
    
    return results;
  } catch (error) {
    console.error('Error searching Pinecone:', error);
    throw error;
  }
};

// Helper function to read file as text
const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};

// Helper function to create embeddings using OpenAI's API
const createEmbeddings = async (text: string, apiKey: string): Promise<number[]> => {
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: text
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI embeddings API error:', errorData);
      throw new Error(`OpenAI embeddings API error: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error creating embeddings:', error);
    throw error;
  }
};
