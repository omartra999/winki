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

    const n8nResponse = await fetch('http://localhost:5678/webhook-test/upload-pdf', {
      method: 'POST',
      body: n8nFormData,
    });

    if (!n8nResponse.ok) {
      storeUpdate(executionId, {
        title: 'Fehler beim Hochladen',
        description: 'Die Datei konnte nicht verarbeitet werden',
        progress: 0,
        status: 'error',
      });
      return Response.json(
        { error: 'Failed to upload to n8n' },
        { status: 500 }
      );
    }

    // Update status
    storeUpdate(executionId, {
      title: 'Datei empfangen',
      description: 'Starte Dokumentverarbeitung mit Docling...',
      progress: 20,
      status: 'processing',
    });

    return Response.json({
      success: true,
      executionId: executionId,
    });
  } catch (error) {
    console.error('Error in callback route:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}