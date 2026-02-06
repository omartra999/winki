import { useState, useRef } from "react";

export function useN8nUpdates() {
    const [update, setUpdate] = useState({
        title: "Starting... ",
        description: "Initializing connection to n8n. Please wait...",
        progresss: 0,
    });

    const [isComplete, setIsComplete] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const eventSourceRef = useRef<EventSource | null>(null);

    const startListening = (executionId: string) => {
        // Close previous connection if it exists
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        const eventSource = new EventSource(`/api/webhook/updates?executionId=${executionId}`);
        eventSourceRef.current = eventSource;

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setUpdate({
                title: data.title,
                description: data.description,
                progresss: data.progress,
            });

            if (data.results) {
                setResults(data.results);
            }

            if (data.status === "completed" || data.status === "COMPLETED" || data.status === "error") {
                setIsComplete(true);
                eventSource.close();
                eventSourceRef.current = null;
            }
        };

        eventSource.onerror = () => {
            console.error('EventSource error');
            eventSource.close();
            eventSourceRef.current = null;
        };
    }

    return { update, isComplete, results, startListening };
}