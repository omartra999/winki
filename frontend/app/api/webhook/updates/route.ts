// In-memory store for updates (in production, use a database)
const executionUpdates = new Map<string, any>();
const executionTimestamps = new Map<string, number>();

export function storeUpdate(executionId: string, data: any) {
  console.log(`[storeUpdate] Storing update for ${executionId}:`, data);
  executionUpdates.set(executionId, data);
  executionTimestamps.set(executionId, Date.now());
}

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

    console.log(`[POST] Updated execution ${executionId}, current store:`, executionUpdates.get(executionId));

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error in webhook POST:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const executionId = searchParams.get('executionId');

  if (!executionId) {
    return Response.json({ error: 'Missing executionId' }, { status: 400 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const sendUpdate = () => {
        try {
          const update = executionUpdates.get(executionId);
          if (update) {
            console.log(`[GET] Sending update for ${executionId}:`, update);
            controller.enqueue(
              `data: ${JSON.stringify(update)}\n\n`
            );
            if (update.status === 'completed' || update.status === 'error') {
              controller.close();
              // Clean up immediately when workflow completes
              executionUpdates.delete(executionId);
              executionTimestamps.delete(executionId);
              console.log(`[CLEANUP] Removed ${executionId} from store`);
            }
          }
        } catch (error) {
          // Stream closed, ignore
        }
      };

      const interval = setInterval(sendUpdate, 500);
      
      // Auto-cleanup after 1 hour of inactivity (safety valve)
      const cleanupTimer = setTimeout(() => {
        clearInterval(interval);
        controller.close();
        executionUpdates.delete(executionId);
        executionTimestamps.delete(executionId);
        console.log(`[TIMEOUT-CLEANUP] Removed ${executionId} after inactivity`);
      }, 3600000);
      
      return () => {
        clearInterval(interval);
        clearTimeout(cleanupTimer);
      };
    },
    cancel() {
      // Clean up when client disconnects
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}