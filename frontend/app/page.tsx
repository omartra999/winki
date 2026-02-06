'use client';

import FileUpload03 from '@/components/file-upload-03';
import { SpinnerEmpty } from '@/components/spinnerEmpty';
import { useN8nUpdates } from '@/app/hooks/useN8nUpdates';
import { useState } from 'react';

interface FileWithPath extends File {
  path?: string;
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [executionId, setExecutionId] = useState<string | null>(null);
  const { update, isComplete, startListening } = useN8nUpdates();

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