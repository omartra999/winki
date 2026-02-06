import { useState } from "react";


export function useN8nUpdates() {

    const [update, setUpdate] = useState({
        title: "Starting... ",
        description: "Initializing connection to n8n. Please wait...",
        progresss: 0,
    });

    const [isComplete, setIsComplete] = useState(false);

    const startListening = (executionId: string) => {
        const eventSource = new EventSource(`/api/webhook/updates?executionId=${executionId}`);

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setUpdate({
                title: data.title,
                description: data.description,
                progresss: data.progress,
            });

            if (data.status === "completed") {
                setIsComplete(true);
                eventSource.close();
            }
        };
        return () => eventSource.close();
    }
    return { update, isComplete, startListening };

}