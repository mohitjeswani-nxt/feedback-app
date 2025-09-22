"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Copy, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FeedbackSuccessProps {
  ticketId: string;
  onViewFeedback: () => void;
  onSubmitAnother: () => void;
}

export function FeedbackSuccess({
  ticketId,
  onViewFeedback,
  onSubmitAnother,
}: FeedbackSuccessProps) {
  const { toast } = useToast();

  const copyTicketId = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(ticketId);
      toast({
        title: "Copied!",
        description: "Ticket ID copied to clipboard",
      });
    } else {
      // Fallback for older browsers or when clipboard API is not available
      const textArea = document.createElement("textarea");
      textArea.value = ticketId;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        toast({
          title: "Copied!",
          description: "Ticket ID copied to clipboard",
        });
      } catch (err) {
        toast({
          title: "Copy failed",
          description: "Please manually copy the ticket ID",
          variant: "destructive",
        });
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <Card>
      <CardContent className="text-center py-12">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
        <CardTitle className="text-2xl mb-2">
          Feedback Submitted Successfully!
        </CardTitle>
        <CardDescription className="text-lg mb-6">
          Your feedback has been received and assigned a ticket ID for tracking.
        </CardDescription>

        <div className="bg-muted rounded-lg p-4 mb-6">
          <p className="text-sm text-muted-foreground mb-2">Your Ticket ID</p>
          <div className="flex items-center justify-center gap-2">
            <code className="text-lg font-mono font-bold">{ticketId}</code>
            <Button variant="ghost" size="sm" onClick={copyTicketId}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-8">
          Please save this ticket ID for future reference. You can use it to
          track the status of your feedback.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={onViewFeedback} variant="outline">
            View My Feedback
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          <Button onClick={onSubmitAnother}>Submit Another Feedback</Button>
        </div>
      </CardContent>
    </Card>
  );
}
