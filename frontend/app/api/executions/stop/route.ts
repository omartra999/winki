import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json();
        const { executionId } = body;

        if (!executionId) {
            return NextResponse.json({ error: 'Missing executionId' }, { status: 400 });
        }

        const response = await fetch(`${process.env.N8N_HOST}/api/v1/executions/${executionId}/stop`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to stop execution' }, { status: response.status });
        }

        return NextResponse.json({ success: true, message: 'Execution stopped' });
    } catch (error) {
        console.error('[Stop] Error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}