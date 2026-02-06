'use client';

import { Badge } from '@/components/ui/badge';

export default function Hero() {

    return (
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
    );
}