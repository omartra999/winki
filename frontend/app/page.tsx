'use client';

import { Badge } from '@/components/ui/badge';
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
      formData.append('callbackUrl', `${window.location.origin}/api/webhook/updates`);

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
      <div className="bg-primary text-primary-foreground py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="space-y-4">
            <h1 className="text-5xl lg:text-6xl font-bold">Vertragsanalyse</h1>
            <p className="text-primary-foreground/80 text-xl lg:text-2xl font-light max-w-3xl">
              KI-gestützte Extraktion von Kriterien, Bedingungen und Risiken aus Verträgen
            </p>
            <div className="flex gap-4 items-center pt-4 flex-wrap">
              <Badge className="bg-primary-foreground text-primary font-semibold">Docling</Badge>
              <Badge className="bg-primary-foreground text-primary font-semibold">OLLAMA</Badge>
              <Badge className="bg-primary-foreground text-primary font-semibold">On-Prem</Badge>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-muted py-12 justify-center max-w-xl mx-auto px-6">
        <FileUpload03 onSubmit={handleFileSubmit} />
      </div>
    </main>
  );
}