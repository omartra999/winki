import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircleIcon } from "lucide-react"
import { Button } from "./ui/button";

interface ErrorDisplayProps {
  errorMessage: string;
  errorCode?: number;
  onRetry?: () => void;
}

export function ErrorDisplay({ errorMessage, errorCode, onRetry }: ErrorDisplayProps) {
  return (
    <Alert variant="destructive" className="max-w-md">
      <AlertCircleIcon />
      <AlertTitle>Error {errorCode ? `(${errorCode})` : ""}</AlertTitle>
      <AlertDescription>
        {errorMessage}
      </AlertDescription>
        {onRetry && (
          <Button variant={'outline'} onClick={onRetry}>Nochmal versuchen</Button>
        )}
    </Alert>
  )
}
