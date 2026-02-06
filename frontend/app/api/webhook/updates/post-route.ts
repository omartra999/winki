import { storeUpdate } from './route';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { executionId, status, title, description, progress } = body;

    if (!executionId) {
      return Response.json({ error: 'Missing executionId' }, { status: 400 });
    }

    // Store the update
    storeUpdate(executionId, {
      status,
      title,
      description,
      progress,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error in webhook POST:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
