// In-memory store for updates (in production, use a database)
const executionUpdates = new Map<string, any>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const executionId = searchParams.get('executionId');

  if (!executionId) {
    return Response.json({ error: 'Missing executionId' }, { status: 400 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const sendUpdate = () => {
        const update = executionUpdates.get(executionId);
        if (update) {
          controller.enqueue(
            `data: ${JSON.stringify(update)}\n\n`
          );
          if (update.status === 'completed') {
            controller.close();
          }
        }
      };

      const interval = setInterval(sendUpdate, 500);
      
      return () => clearInterval(interval);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

export function storeUpdate(executionId: string, data: any) {
  executionUpdates.set(executionId, data);
}