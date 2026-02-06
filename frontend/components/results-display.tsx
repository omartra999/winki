"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";

interface Result {
  condition_id: string;
  fulfilled: boolean;
  reference?: string | null;
}

interface ResultsDisplayProps {
  results: Result[];
}

export default function ResultsDisplay({ results }: ResultsDisplayProps) {
  if (!results || results.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <p className="text-muted-foreground">No results available</p>
        </CardContent>
      </Card>
    );
  }

  const fulfilled = results.filter((r) => r.fulfilled).length;
  const total = results.length;
  const percentage = Math.round((fulfilled / total) * 100);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Analysis Results</CardTitle>
        <div className="mt-4 flex items-center gap-4">
          <div>
            <p className="text-2xl font-bold">{percentage}%</p>
            <p className="text-sm text-muted-foreground">
              {fulfilled} of {total} criteria met
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-lg font-semibold text-primary">{fulfilled}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {results.map((result, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition"
            >
              {result.fulfilled ? (
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
              )}
              <div className="flex-1">
                <p className="font-medium text-sm">{result.condition_id}</p>
                {result.reference && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Reference: {result.reference}
                  </p>
                )}
              </div>
              <Badge
                variant={result.fulfilled ? "default" : "destructive"}
                className="shrink-0"
              >
                {result.fulfilled ? "Met" : "Not Met"}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
