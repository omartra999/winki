import { storeUpdate } from '@/app/api/webhook/updates/route';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const callbackUrl = formData.get('callbackUrl') as string;

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    // Generate execution ID
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store initial update
    storeUpdate(executionId, {
      title: 'Datei wird hochgeladen...',
      description: 'Übertragung zu n8n läuft',
      progress: 10,
      status: 'uploading',
    });

    // Forward file to n8n webhook
    const n8nFormData = new FormData();
    n8nFormData.append('file', file);
    n8nFormData.append('executionId', executionId);
    n8nFormData.append('callbackUrl', callbackUrl);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 600000); // 10 minute timeout (Docling can be slow)

    // Send to n8n but don't wait for completion
    fetch('http://n8n:5678/webhook-test/upload-pdf', {
      method: 'POST',
      body: n8nFormData,
      signal: controller.signal,
    }).catch((error) => {
      console.error('Error sending to n8n:', error);
      clearTimeout(timeoutId);
    });

    // Return immediately so frontend shows loading spinner
    return Response.json({
      success: true,
      executionId: executionId,
    });
  } catch (error) {
    console.error('Error in callback route:', error);
    
    // Check if it's an abort error (timeout)
    if (error instanceof Error && error.name === 'AbortError') {
      return Response.json(
        { error: 'n8n request timed out' },
        { status: 504 }
      );
    }
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}