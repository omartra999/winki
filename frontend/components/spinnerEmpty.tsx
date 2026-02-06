import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"

interface SpinnerEmptyProps {
  title?: string;
  description?: string;
  onCancel?: () => void;
}

export function SpinnerEmpty({ 
  title = "Processing your request", 
  description = "Please wait while we process your request. Do not refresh the page.",
  onCancel
}: SpinnerEmptyProps) {
  return (
    <Empty className="w-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Spinner />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>
          {description}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </EmptyContent>
    </Empty>
  )
}
