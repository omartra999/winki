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

    // Convert file to base64 for n8n
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    // Call n8n webhook
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 
      'http://n8n:5678/webhook/adc2ba30-7608-4273-9ec7-2b4556ff23a6';


    console.log('[API] Calling n8n webhook:', n8nWebhookUrl);

    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        files: [file.name],
        file_base64: base64,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        criteria: criteria,
        request_id: `req_${Date.now()}`,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error('[API] n8n error:', n8nResponse.status, errorText);
      
      // Still return mock for testing if n8n fails
      console.log('[API] n8n failed, returning mock response');
      const mockResult = getMockResult();
      return NextResponse.json<AnalysisResponse>(
        { success: true, data: mockResult },
        { status: 200 }
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
  // TODO: Update based on your actual n8n workflow output
  // For now, return mock while testing
  return getMockResult();
}

/**
 * Mock response for testing
 */
function getMockResult(): AnalysisResult {
  return {
    summary: 'Test response from API proxy.',
    criteria: [
      { type: 'MUSS', text: 'Mock MUSS criterion', category: 'Technical', page: 1 },
      { type: 'SOLL', text: 'Mock SOLL criterion', category: 'Financial', page: 2 },
    ],
    deadlines: [
      { name: 'Abgabefrist', date: '2026-03-15', description: 'Deadline for submission' },
    ],
    deliverables: ['Deliverable 1', 'Deliverable 2'],
    pricing: [
      { term: 'Payment Terms', description: '30 days net from invoice' },
    ],
    dsgvo: [
      { category: 'AVV', content: 'Data Processing Agreement required' },
    ],
    eligibility: [
      { requirement: 'ISO 27001 certification', type: 'ZERTIFIKAT', mandatory: true },
    ],
    risks: [
      { level: 'HIGH', issue: 'Unbounded liability clause', suggestion: 'Negotiate cap at 12 months of fees' },
    ],
    metadata: {
      processingTime: 45,
      documentPages: 12,
      analysisTimestamp: new Date().toISOString(),
    },
  };
}
