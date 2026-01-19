// API Request/Response types for contract analysis

export interface AnalysisRequest {
  file: File;
  criteria: string; // User-provided criteria/instructions
}

export interface AnalysisResponse {
  success: boolean;
  data?: AnalysisResult;
  error?: string;
}

export interface AnalysisResult {
  summary: string;
  criteria: CriteriaItem[];
  deadlines: DeadlineItem[];
  deliverables: string[];
  pricing: PricingTerm[];
  dsgvo: DsgvoItem[];
  eligibility: EligibilityItem[];
  risks: RiskMarker[];
  metadata: {
    processingTime: number;
    documentPages: number;
    analysisTimestamp: string;
  };
}

export interface CriteriaItem {
  type: 'MUSS' | 'SOLL' | 'KANN' | 'ANALYSE';
  text: string;
  category?: string;
  page?: number;
}

export interface DeadlineItem {
  name: string; // e.g., "Abgabefrist", "Laufzeit"
  date: string;
  description?: string;
}

export interface PricingTerm {
  term: string; // e.g., "Zahlungsbedingungen", "Vertragsstrafen"
  description: string;
}

export interface DsgvoItem {
  category: string; // e.g., "AVV", "TOMs", "Auftragsverarbeitung"
  content: string;
}

export interface EligibilityItem {
  requirement: string;
  type: 'ZERTIFIKAT' | 'FINANZIELL' | 'TECHNISCH' | 'RECHTLICH';
  mandatory: boolean;
}

export interface RiskMarker {
  level: 'HIGH' | 'MEDIUM' | 'LOW';
  issue: string;
  suggestion?: string;
}
