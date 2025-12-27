import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface RewardErrorProps {
  error: Error | null
  onRetry: () => void
}

export function RewardError({ error, onRetry }: RewardErrorProps) {
  return (
    <div className="container mx-auto p-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading rewards</AlertTitle>
        <AlertDescription className="space-y-4">
          <p>
            {error?.message || 'An unknown error occurred while loading rewards.'}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="mt-2"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  )
}
