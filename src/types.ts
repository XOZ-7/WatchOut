export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  image?: string;
  analysis?: AnalysisResult;
}

export interface AnalysisResult {
  flag: 'Misinformation' | 'Verified' | 'Suspicious';
  confidenceScore: number;
  explanation: string;
  reasoning: string;
}

export interface DashboardStats {
  totalAnalyzed: number;
  flaggedCount: number;
  verifiedCount: number;
  avgConfidence: number;
  recentActivity: AnalysisRecord[];
}

export interface AnalysisRecord {
  id: string;
  timestamp: number;
  content: string;
  flag: 'Misinformation' | 'Verified' | 'Suspicious';
  confidence: number;
}
