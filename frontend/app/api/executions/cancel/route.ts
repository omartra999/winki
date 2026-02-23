export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { executionId } = body;

    if (!executionId) {
      return Response.json({ error: 'Missing executionId' }, { status: 400 });
    }

    console.log(`[Cancel] Attempting to cancel execution: ${executionId}`);

    // Call n8n cancel webhook
    const response = await fetch('http://n8n:5678/webhook-test/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ executionId }),
    });

    const data = await response.json();
    console.log(`[Cancel] n8n response:`, data);

    if (!response.ok) {
      return Response.json(
        { error: 'Failed to cancel execution', details: data },
        { status: response.status }
      );
    }

    return Response.json({ success: true, message: 'Execution cancelled' });
  } catch (error) {
    console.error('[Cancel] Error:', error);
    return Response.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
