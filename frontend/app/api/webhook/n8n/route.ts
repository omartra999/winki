import { storeUpdate } from '@/app/api/webhook/updates/route';

/**
 * Receives updates from n8n workflow
 * Stores them so SSE clients can retrieve them
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { executionId, title, description, progress, status } = body;

    if (!executionId) {
      return Response.json({ error: 'Missing executionId' }, { status: 400 });
    }

    // Store update so SSE clients can receive it
    storeUpdate(executionId, {
      title: title || 'Processing...',
      description: description || 'Please wait',
      progress: progress || 0,
      status: status || 'processing',
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error in n8n webhook:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
