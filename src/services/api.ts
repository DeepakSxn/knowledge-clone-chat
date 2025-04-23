
// API keys - hardcoded as requested by user
export const API_KEYS = {
  openai: "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",
  pinecone: "pcsk_LkuDT_RWGBgqzwrz2KcAT1A9FRSAmKbrc7qYn1PXt2hKopQSoJAYLecDeAVC1CYPuS43W"
};

// Get API key from localStorage or use hardcoded key as fallback
export const getApiKey = (keyType: 'openai' | 'pinecone'): string => {
  const localKey = localStorage.getItem(`${keyType}ApiKey`);
  return localKey && localKey.trim() !== '' ? localKey : API_KEYS[keyType];
};
