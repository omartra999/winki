'use client';

import FileUpload03 from '@/components/file-upload-03';
import ResultsDisplay from '@/components/results-display';
import { SpinnerEmpty } from '@/components/spinnerEmpty';
import { useN8nUpdates } from '@/app/hooks/useN8nUpdates';
import { useState } from 'react';

interface FileWithPath extends File {
  path?: string;
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [executionId, setExecutionId] = useState<string | null>(null);
  const { update, isComplete, results, startListening } = useN8nUpdates();

  const handleFileSubmit = async (file: FileWithPath) => {
    if (!file) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('callbackUrl', `http://frontend:3000/api/webhook/updates`);

      const response = await fetch('/api/analysis/callback', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success && data.executionId) {
        setExecutionId(data.executionId);
        startListening(data.executionId);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error submitting file:', error);
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setLoading(false);
    setExecutionId(null);
  };

  if (isComplete && results.length > 0) {
    return (
      <main className="min-h-screen bg-muted py-12">
        <div className="max-w-2xl mx-auto px-6">
          <button
            onClick={() => {
              setLoading(false);
              setExecutionId(null);
            }}
            className="mb-6 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition"
          >
            ← Upload Another File
          </button>
          <ResultsDisplay results={results} />
        </div>
      </main>
    );
  }

  if (loading && executionId) {
    return (
      <main className="min-h-screen bg-muted flex items-center justify-center">
        <SpinnerEmpty
          title={update.title}
          description={update.description}
          onCancel={handleCancel}
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted">
      
      <div className="bg-muted py-12 justify-center max-w-xl mx-auto px-6">
        <FileUpload03 onSubmit={handleFileSubmit} />
      </div>
    </main>
  );
}