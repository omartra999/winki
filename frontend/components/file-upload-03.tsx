"use client";

import { File, Trash } from "lucide-react";
import React from "react";
import { useDropzone } from "react-dropzone";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface FileWithPath extends File {
  path?: string;
}

interface FileUpload03Props {
  onFilesChange?: (file: FileWithPath | null) => void;
  initialFiles?: FileWithPath[];
}

export default function FileUpload03({ onFilesChange }: FileUpload03Props) {
  const [file, setFile] = React.useState<FileWithPath>();
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      const newFile = acceptedFiles[0] as FileWithPath;
      setFile(newFile);
      onFilesChange?.(newFile);
    },
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
  });

  const handleSubmit = (file: File) => {
    const webhookUrl = "http://localhost:5678/webhook-test/upload-pdf"; 
    const formData = new FormData();
      formData.append("file", file);
  
    console.log("Uploading file:", file);
    fetch(webhookUrl, {
      method: "POST",
      body: formData,
    }).then((response) => {
      if (response.ok) {
        console.log("File uploaded successfully");
      } else {
        console.error("File upload failed");
      }
    }).catch((error) => {
      console.error("Error uploading file:", error);
    });
  }

  const filesList = file ? (
    <li key={file.name} className="relative">
      <Card className="relative p-4">
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Datei entfernen"
            onClick={() => {
              setFile(undefined);
              onFilesChange?.(null);
            }}
          >
            <Trash className="h-5 w-5" aria-hidden={true} />
          </Button>
        </div>
        <CardContent className="flex items-center space-x-3 p-0">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
            <File className="h-5 w-5 text-foreground" aria-hidden={true} />
          </span>
          <div>
            <p className="font-medium text-foreground">{file.name}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </CardContent>
      </Card>
    </li>
  ) : null;

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="file-upload" className="font-medium">
              Vertragsdatei
            </Label>
            <div
              {...getRootProps()}
              className={cn(
                isDragActive
                  ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                  : "border-border",
                "mt-2 flex justify-center rounded-lg border border-dashed px-6 py-12 transition-colors duration-200 cursor-pointer"
              )}
            >
              <div className="text-center">
                <File
                  className="mx-auto h-12 w-12 text-muted-foreground/80"
                  aria-hidden={true}
                />
                <div className="mt-4 flex text-muted-foreground text-sm">
                  <p>Ziehen Sie Ihre Datei hier hin oder</p>
                  <label
                    htmlFor="file"
                    className="relative cursor-pointer pl-1 font-medium text-primary hover:text-primary/80 hover:underline hover:underline-offset-4"
                  >
                    <span>wählen Sie</span>
                    <input
                      {...getInputProps()}
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">aus</p>
                </div>
              </div>
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              PDF oder DOCX • Max. 50MB
            </p>
            {filesList && (
              <>
                <h4 className="mt-6 font-medium text-foreground">
                  Ausgewählte Datei
                </h4>
                <ul role="list" className="mt-4 space-y-4">
                  {filesList}
                </ul>

                <div className="pt-5 justify-center flex">
                  <Button
                    onClick={() => {
                      handleSubmit(file!);}}>Datei Hochladen</Button>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
