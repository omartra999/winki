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
    const criteria = formData.get('criteria') as string;

    if (!file) {
      return NextResponse.json<AnalysisResponse>(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!criteria) {
      return NextResponse.json<AnalysisResponse>(
        { success: false, error: 'No criteria provided' },
        { status: 400 }
      );
    }

    // TODO: Call n8n webhook with file + criteria
    // For now, return mock response to test UI
    const mockResult: AnalysisResult = {
      summary: 'This is a mock response for testing the UI. Replace with actual n8n workflow result.',
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
        { term: 'Penalties', description: 'Late payment: 0.5% per month' },
      ],
      dsgvo: [
        { category: 'AVV', content: 'Data Processing Agreement required' },
        { category: 'TOMs', content: 'Standard security measures apply' },
      ],
      eligibility: [
        { requirement: 'ISO 27001 certification', type: 'ZERTIFIKAT', mandatory: true },
        { requirement: 'Minimum team size: 50 employees', type: 'TECHNISCH', mandatory: false },
      ],
      risks: [
        { level: 'HIGH', issue: 'Unbounded liability clause', suggestion: 'Negotiate cap at 12 months of fees' },
        { level: 'MEDIUM', issue: 'Unilateral termination rights', suggestion: 'Request mutual termination clause' },
      ],
      metadata: {
        processingTime: 45,
        documentPages: 12,
        analysisTimestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json<AnalysisResponse>(
      { success: true, data: mockResult },
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
