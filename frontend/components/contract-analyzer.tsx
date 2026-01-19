'use client';

import { useCallback, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AnalysisResult } from '@/lib/types';
import FileUpload03 from './file-upload-03';
import { CriteriaForm } from './criteria-form';

interface Criterion {
  id: string
  type: 'MUSS' | 'SOLL' | 'KANN' | 'ANALYSE'
  value: string
}

interface AnalysisState {
  loading: boolean;
  result: AnalysisResult | null;
  error: string | null;
}

interface FileWithPath extends File {
  path?: string;
}

export function ContractAnalyzer() {
  const [files, setFiles] = useState<FileWithPath[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [state, setState] = useState<AnalysisState>({
    loading: false,
    result: null,
    error: null,
  });

  const handleAnalyze = useCallback(async () => {
    if (files.length === 0 || criteria.length === 0) {
      setState((prev) => ({
        ...prev,
        error: 'Bitte wählen Sie eine Datei und geben Sie mindestens ein Kriterium ein',
      }));
      return;
    }

    setState({ loading: true, result: null, error: null });

    try {
      const formData = new FormData();
      formData.append('file', files[0]);
      formData.append('criteria', JSON.stringify(criteria));

      const response = await fetch('api/contracts/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analyse fehlgeschlagen');
      }

      setState({ loading: false, result: data.data, error: null });
    } catch (error) {
      setState({
        loading: false,
        result: null,
        error: error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten',
      });
    }
  }, [files, criteria]);

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-8">
      {/* Upload & Criteria Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* File Upload Component */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Schritt 1: Datei hochladen</h2>
          <FileUpload03 
            onFilesChange={setFiles}
            initialFiles={files}
          />
        </div>

        {/* Criteria Form Component */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Schritt 2: Analyse-Kriterien</h2>
          <div className="bg-muted rounded-2xl p-6 border border-border">
            <CriteriaForm 
              onChange={setCriteria}
              initialCriteria={criteria}
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {state.error && (
        <Alert className="border-destructive bg-destructive/10">
          <AlertDescription className="text-destructive flex items-center gap-2">
            <span>⚠️</span>
            <span>{state.error}</span>
          </AlertDescription>
        </Alert>
      )}

      {/* Analyze Button */}
      <div className="flex gap-4">
        <Button
          onClick={handleAnalyze}
          disabled={state.loading || files.length === 0 || criteria.length === 0}
          className="flex-1 py-6 text-base font-semibold disabled:opacity-50 transition-all"
        >
          {state.loading ? (
            <>
              <span className="mr-2">⏳</span>
              Analysiere Vertrag...
            </>
          ) : (
            'Vertrag analysieren'
          )}
        </Button>
      </div>

      {/* Progress Bar */}
      {state.loading && (
        <Card className="p-6 bg-primary/10 border-primary">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-foreground font-medium">Verarbeite Dokument...</span>
              <span className="text-muted-foreground">Docling + OLLAMA</span>
            </div>
            <Progress value={33} className="h-2" />
          </div>
        </Card>
      )}

      {/* Results Section */}
      {state.result && (
        <Card className="p-8 border-0 shadow-sm">
          <h2 className="text-3xl font-bold text-foreground mb-2">Analyse-Ergebnisse</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Dokument verarbeitet in {state.result.metadata.processingTime}s • {state.result.metadata.documentPages} Seiten
          </p>

          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 mb-8 bg-muted">
              <TabsTrigger value="summary">Zusammenfassung</TabsTrigger>
              <TabsTrigger value="criteria">Kriterien</TabsTrigger>
              <TabsTrigger value="deadlines">Fristen</TabsTrigger>
              <TabsTrigger value="deliverables">Leistungen</TabsTrigger>
              <TabsTrigger value="pricing">Preise</TabsTrigger>
              <TabsTrigger value="dsgvo">DSGVO</TabsTrigger>
              <TabsTrigger value="eligibility">Eignung</TabsTrigger>
              <TabsTrigger value="risks">Risiken</TabsTrigger>
            </TabsList>

            {/* Summary Tab */}
            <TabsContent value="summary" className="space-y-4">
              <Card className="p-6 bg-primary/10 border-primary">
                <h3 className="font-semibold text-foreground mb-4">Executive Summary</h3>
                <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap text-sm">
                  {state.result.summary}
                </p>
              </Card>
            </TabsContent>

            {/* Criteria Tab */}
            <TabsContent value="criteria" className="space-y-4">
              <div className="space-y-3">
                {state.result.criteria.map((item, idx) => (
                  <Card key={idx} className="p-4 border-l-4 border-l-primary">
                    <div className="flex items-start gap-3 justify-between">
                      <div className="flex-1">
                        <div className="flex gap-2 items-center mb-2">
                          <Badge
                            className={
                              item.type === 'MUSS'
                                ? 'bg-destructive/20 text-destructive hover:bg-destructive/20'
                                : item.type === 'SOLL'
                                  ? 'bg-chart-1/20 text-chart-1 hover:bg-chart-1/20'
                                  : 'bg-chart-3/20 text-chart-3 hover:bg-chart-3/20'
                            }
                          >
                            {item.type}
                          </Badge>
                          {item.category && (
                            <span className="text-xs text-muted-foreground font-medium">{item.category}</span>
                          )}
                        </div>
                        <p className="text-sm text-foreground font-medium leading-relaxed">{item.text}</p>
                        {item.page && (
                          <p className="text-xs text-muted-foreground mt-2">Seite {item.page}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Deadlines Tab */}
            <TabsContent value="deadlines" className="space-y-4">
              <div className="space-y-3">
                {state.result.deadlines.map((item, idx) => (
                  <Card key={idx} className="p-4 border-l-4 border-l-chart-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground text-sm">{item.name}</p>
                        <p className="text-lg font-bold text-primary mt-1">{item.date}</p>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mt-2">{item.description}</p>
                        )}
                      </div>
                      <span className="text-2xl">📅</span>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Deliverables Tab */}
            <TabsContent value="deliverables" className="space-y-3">
              {state.result.deliverables.map((item, idx) => (
                <Card key={idx} className="p-4 border-l-4 border-l-chart-3 flex items-center gap-3">
                  <span className="text-2xl">📦</span>
                  <p className="text-sm text-foreground font-medium">{item}</p>
                </Card>
              ))}
            </TabsContent>

            {/* Pricing Tab */}
            <TabsContent value="pricing" className="space-y-3">
              {state.result.pricing.map((item, idx) => (
                <Card key={idx} className="p-4 border-l-4 border-l-chart-1">
                  <p className="font-semibold text-foreground text-sm mb-2">{item.term}</p>
                  <p className="text-sm text-muted-foreground/90 leading-relaxed">{item.description}</p>
                </Card>
              ))}
            </TabsContent>

            {/* DSGVO Tab */}
            <TabsContent value="dsgvo" className="space-y-3">
              {state.result.dsgvo.map((item, idx) => (
                <Card key={idx} className="p-4 bg-accent/10 border-accent border-l-4 border-l-accent">
                  <p className="font-semibold text-foreground text-sm mb-2">🔒 {item.category}</p>
                  <p className="text-sm text-muted-foreground/90 leading-relaxed">{item.content}</p>
                </Card>
              ))}
            </TabsContent>

            {/* Eligibility Tab */}
            <TabsContent value="eligibility" className="space-y-3">
              {state.result.eligibility.map((item, idx) => (
                <Card key={idx} className="p-4 border-l-4 border-l-secondary">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-semibold text-foreground text-sm">{item.requirement}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.type}</p>
                    </div>
                    <Badge variant={item.mandatory ? 'destructive' : 'secondary'} className="text-xs">
                      {item.mandatory ? 'Erforderlich' : 'Optional'}
                    </Badge>
                  </div>
                </Card>
              ))}
            </TabsContent>

            {/* Risks Tab */}
            <TabsContent value="risks" className="space-y-3">
              {state.result.risks.map((item, idx) => (
                <Card
                  key={idx}
                  className={`p-4 border-l-4 ${
                    item.level === 'HIGH'
                      ? 'bg-destructive/10 border-destructive border-l-destructive'
                      : item.level === 'MEDIUM'
                        ? 'bg-chart-1/10 border-chart-1 border-l-chart-1'
                        : 'bg-chart-3/10 border-chart-3 border-l-chart-3'
                  }`}
                >
                  <div className="flex items-start gap-3 justify-between">
                    <div className="flex-1">
                      <div className="flex gap-2 items-center mb-2">
                        <Badge
                          className={
                            item.level === 'HIGH'
                              ? 'bg-destructive text-primary-foreground hover:bg-destructive'
                              : item.level === 'MEDIUM'
                                ? 'bg-chart-1 text-primary-foreground hover:bg-chart-1'
                                : 'bg-chart-3 text-primary-foreground hover:bg-chart-3'
                          }
                        >
                          {item.level === 'HIGH' ? '🚨' : item.level === 'MEDIUM' ? '⚠️' : '✓'} {item.level}
                        </Badge>
                      </div>
                      <p className="font-semibold text-foreground text-sm">{item.issue}</p>
                      {item.suggestion && (
                        <p className="text-sm text-muted-foreground/90 mt-2">💡 {item.suggestion}</p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </Card>
      )}
    </div>
  );
}
