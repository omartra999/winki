"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  IconAlertTriangle,
  IconArrowUp,
  IconCloud,
  IconFileSpark,
  IconGauge,
  IconPhotoScan,
} from "@tabler/icons-react";
import { useRef, useState } from "react";

const PROMPTS = [
  {
    icon: IconFileSpark,
    text: "Hauptkriterien",
    prompt:
      "Finde alle MUSS und SOLL Kriterien, Fristen, Zahlungsbedingungen, Haftungsklauseln und ungewöhnliche Bedingungen.",
  },
  {
    icon: IconGauge,
    text: "DSGVO & Compliance",
    prompt:
      "Extrahiere alle DSGVO-relevanten Passagen, AVV-Anforderungen, Datenschutzmaßnahmen und Compliance-Anforderungen.",
  },
  {
    icon: IconAlertTriangle,
    text: "Risiken & Flags",
    prompt:
      "Identifiziere alle HIGH-RISK Klauseln, ungewöhnliche Bedingungen, einseitige Regelungen und Ausschlusskriterien.",
  },
];

const MODELS = [
  {
    value: "ollama-llama3.2",
    name: "OLLAMA Llama 3.2",
    description: "Local LLM (empfohlen)",
    max: false,
  },
  {
    value: "ollama-mistral",
    name: "OLLAMA Mistral",
    description: "Alternative local model",
  },
];

interface Ai02Props {
  onCriteriaChange?: (criteria: string) => void;
  initialCriteria?: string;
}

export default function Ai02({ onCriteriaChange, initialCriteria = "" }: Ai02Props) {
  const [inputValue, setInputValue] = useState(initialCriteria);
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handlePromptClick = (prompt: string) => {
    setInputValue(prompt);
    onCriteriaChange?.(prompt);
    if (inputRef.current) {
      inputRef.current.value = prompt;
      inputRef.current.focus();
    }
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    onCriteriaChange?.(value);
  };

  const handleModelChange = (value: string) => {
    const model = MODELS.find((m) => m.value === value);
    if (model) {
      setSelectedModel(model);
    }
  };

  const renderMaxBadge = () => (
    <div className="flex h-[14px] items-center gap-1.5 rounded border border-border px-1 py-0">
      <span
        className="text-[9px] font-bold uppercase"
        style={{
          background:
            "linear-gradient(to right, rgb(129, 161, 193), rgb(125, 124, 155))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        MAX
      </span>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex min-h-[120px] flex-col rounded-2xl cursor-text bg-card border border-border shadow-lg">
        <div className="flex-1 relative overflow-y-auto max-h-[258px]">
          <Textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Geben Sie Ihre Analyse-Kriterien ein..."
            className="w-full border-0 p-3 transition-[padding] duration-200 ease-in-out min-h-[48.4px] outline-none text-[16px] text-foreground resize-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent! whitespace-pre-wrap break-words"
          />
        </div>

        <div className="flex min-h-[40px] items-center gap-2 p-2 pb-1">
          <div className="flex aspect-1 items-center gap-1 rounded-full bg-muted p-1.5 text-xs">
            <IconCloud className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="relative flex items-center">
            <Select
              value={selectedModel.value}
              onValueChange={handleModelChange}
            >
              <SelectTrigger className="w-fit border-none bg-transparent! p-0 text-sm text-muted-foreground hover:text-foreground focus:ring-0 shadow-none">
                <SelectValue>
                  {selectedModel.max ? (
                    <div className="flex items-center gap-1">
                      <span>{selectedModel.name}</span>
                      {renderMaxBadge()}
                    </div>
                  ) : (
                    <span>{selectedModel.name}</span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {MODELS.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.max ? (
                      <div className="flex items-center gap-1">
                        <span>{model.name}</span>
                        {renderMaxBadge()}
                      </div>
                    ) : (
                      <span>{model.name}</span>
                    )}
                    <span className="text-muted-foreground block text-xs">
                      {model.description}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {PROMPTS.map((button) => {
          const IconComponent = button.icon;
          return (
            <Button
              key={button.text}
              variant="ghost"
              className="group flex items-center gap-2 rounded-full border px-3 py-2 text-sm text-foreground transition-all duration-200 hover:bg-muted/30 h-auto bg-transparent dark:bg-muted"
              onClick={() => handlePromptClick(button.prompt)}
            >
              <IconComponent className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
              <span>{button.text}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
