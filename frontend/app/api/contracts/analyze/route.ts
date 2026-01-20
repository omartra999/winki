import { NextRequest, NextResponse } from 'next/server';
import { AnalysisResponse, AnalysisResult } from '@/lib/types';

/**
 * POST /api/contracts/analyze
 * 
 * Receives a contract file + user criteria
 * Triggers n8n workflow for Docling extraction + OLLAMA analysis
 * Returns structured analysis results
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const criteriaRaw = formData.get('criteria') as string;

    if (!file) {
      return NextResponse.json<AnalysisResponse>(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!criteriaRaw) {
      return NextResponse.json<AnalysisResponse>(
        { success: false, error: 'No criteria provided' },
        { status: 400 }
      );
    }

    // Parse criteria from JSON string
    let criteria;
    try {
      criteria = JSON.parse(criteriaRaw);
    } catch {
      return NextResponse.json<AnalysisResponse>(
        { success: false, error: 'Invalid criteria format' },
        { status: 400 }
      );
    }

    // Convert file to binary for n8n
    const buffer = await file.arrayBuffer();

    // Call n8n webhook with FormData (binary file)
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 
      'http://n8n:5678/webhook-test/adc2ba30-7608-4273-9ec7-2b4556ff23a6';

    console.log('[API] Calling n8n webhook:', n8nWebhookUrl);
    console.log('[API] Sending file:', file.name, 'Size:', file.size, 'Type:', file.type);

    const n8nFormData = new FormData();
    n8nFormData.append('file', new Blob([buffer], { type: file.type }), file.name);
    n8nFormData.append('criteria', JSON.stringify(criteria));
    n8nFormData.append('request_id', `req_${Date.now()}`);
    n8nFormData.append('timestamp', new Date().toISOString());

    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      body: n8nFormData,
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error('[API] n8n error:', n8nResponse.status, errorText);
      
      return NextResponse.json<AnalysisResponse>(
        { success: false, error: `n8n workflow failed: ${n8nResponse.status}` },
        { status: 500 }
      );
    }

    const n8nData = await n8nResponse.json();
    console.log('[API] n8n response received:', JSON.stringify(n8nData).substring(0, 200));

    // Parse n8n response and transform to frontend format
    // (Will depend on your n8n workflow output structure)
    const result = transformN8nResponse(n8nData);

    return NextResponse.json<AnalysisResponse>(
      { success: true, data: result },
      { status: 200 }
    );

  } catch (error) {
    console.error('[API] Error analyzing contract:', error);
    return NextResponse.json<AnalysisResponse>(
      { success: false, error: 'Failed to analyze contract' },
      { status: 500 }
    );
  }
}

/**
 * Transform n8n workflow output to frontend format
 */
function transformN8nResponse(n8nData: any): AnalysisResult {
  // Handle array response from n8n (it wraps in array)
  const data = Array.isArray(n8nData) ? n8nData[0] : n8nData;
  
  if (!data) {
    console.error('[API] No data in n8n response');
    return {
      summary: 'No data available',
      criteria: [],
      deadlines: [],
      deliverables: [],
      pricing: [],
      dsgvo: [],
      eligibility: [],
      risks: [],
      metadata: {
        processingTime: 0,
        documentPages: 0,
        analysisTimestamp: new Date().toISOString(),
      },
    };
  }

  try {
    // Parse OLLAMA analysis response if it exists
    const analysis = data.analysis || {};
    
    // Build result from n8n data
    const result: AnalysisResult = {
      summary: analysis.summary || data.summary || 'Analysis completed',
      
      criteria: buildCriteriaFromAnalysis(analysis),
      
      deadlines: data.deadlines || [],
      
      deliverables: data.deliverables || [],
      
      pricing: data.pricing || [],
      
      dsgvo: data.dsgvo || [],
      
      eligibility: data.eligibility || [],
      
      risks: buildRisksFromAnalysis(analysis),
      
      metadata: {
        processingTime: data.processingTime || data.metadata?.processingTime || 0,
        documentPages: data.documentPages || data.metadata?.documentPages || 0,
        analysisTimestamp: data.timestamp || data.analysisTimestamp || new Date().toISOString(),
      },
    };

    return result;
  } catch (error) {
    console.error('[API] Error transforming n8n response:', error);
    return {
      summary: 'Error processing analysis',
      criteria: [],
      deadlines: [],
      deliverables: [],
      pricing: [],
      dsgvo: [],
      eligibility: [],
      risks: [],
      metadata: {
        processingTime: 0,
        documentPages: 0,
        analysisTimestamp: new Date().toISOString(),
      },
    };
  }
}

/**
 * Build criteria array from n8n analysis
 */
function buildCriteriaFromAnalysis(analysis: any): any[] {
const criteria: Array<{
    type: 'MUSS' | 'SOLL' | 'KANN' | 'ANALYSE';
    text: string;
    category: 'Erfüllt' | 'Fehlt';
    page: number;
}> = [];

  // Add MUSS criteria (met)
  if (analysis.muss_met && Array.isArray(analysis.muss_met)) {
    analysis.muss_met.forEach((item: string, idx: number) => {
      criteria.push({
        type: 'MUSS',
        text: item,
        category: 'Erfüllt',
        page: 1,
      });
    });
  }

  // Add MUSS criteria (missing)
  if (analysis.muss_missing && Array.isArray(analysis.muss_missing)) {
    analysis.muss_missing.forEach((item: string, idx: number) => {
      criteria.push({
        type: 'MUSS',
        text: item,
        category: 'Fehlt',
        page: 1,
      });
    });
  }

  // Add SOLL criteria (met)
  if (analysis.soll_met && Array.isArray(analysis.soll_met)) {
    analysis.soll_met.forEach((item: string) => {
      criteria.push({
        type: 'SOLL',
        text: item,
        category: 'Erfüllt',
        page: 1,
      });
    });
  }

  // Add SOLL criteria (missing)
  if (analysis.soll_missing && Array.isArray(analysis.soll_missing)) {
    analysis.soll_missing.forEach((item: string) => {
      criteria.push({
        type: 'SOLL',
        text: item,
        category: 'Fehlt',
        page: 1,
      });
    });
  }

  // Add KANN criteria (met)
  if (analysis.kann_met && Array.isArray(analysis.kann_met)) {
    analysis.kann_met.forEach((item: string) => {
      criteria.push({
        type: 'KANN',
        text: item,
        category: 'Erfüllt',
        page: 1,
      });
    });
  }

  return criteria;
}

/**
 * Build risks from n8n analysis
 */
function buildRisksFromAnalysis(analysis: any): any[] {
  if (!analysis.risks || !Array.isArray(analysis.risks)) {
    return [];
  }

  return analysis.risks.map((risk: string, idx: number) => {
    // Try to infer risk level from text
    let level = 'MEDIUM';
    if (risk.toLowerCase().includes('kritisch') || risk.toLowerCase().includes('hoch')) {
      level = 'HIGH';
    } else if (risk.toLowerCase().includes('gering') || risk.toLowerCase().includes('niedrig')) {
      level = 'LOW';
    }

    return {
      level,
      issue: risk,
      suggestion: `Überprüfen Sie diesen Punkt und passen Sie die Vertragsklausel an.`,
    };
  });
}

