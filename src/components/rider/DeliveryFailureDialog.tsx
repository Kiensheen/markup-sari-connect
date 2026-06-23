import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export type DeliveryFailureReasonCode =
  | "customer_not_present"
  | "customer_refused"
  | "accident"
  | "product_damaged"
  | "incorrect_address"
  | "customer_requested_reschedule"
  | "other";

export const DELIVERY_FAILURE_REASON_OPTIONS: { code: DeliveryFailureReasonCode; label: string }[] = [
  { code: "customer_not_present", label: "Customer not present at delivery point" },
  { code: "customer_refused", label: "Customer refused the order" },
  { code: "accident", label: "Accident during delivery" },
  { code: "product_damaged", label: "Product damaged during delivery" },
  { code: "incorrect_address", label: "Incorrect delivery address" },
  { code: "customer_requested_reschedule", label: "Customer requested reschedule" },
  { code: "other", label: "Other" },
];

export function DeliveryFailureDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (payload: { reasonCode: DeliveryFailureReasonCode; notes: string | null }) => Promise<void>;
}) {
  const [reasonCode, setReasonCode] = useState<DeliveryFailureReasonCode>("customer_not_present");
  const [notes, setNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const confirm = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const trimmed = notes.trim();
      await onConfirm({
        reasonCode,
        notes: trimmed ? trimmed : null,
      });
      // Let parent close via onOpenChange
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark delivery as unsuccessful</DialogTitle>
          <DialogDescription>
            Select a reason and optionally add notes. The consumer will see the details.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Failure reason</label>
            <Select value={reasonCode} onValueChange={(v) => setReasonCode(v as DeliveryFailureReasonCode)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {DELIVERY_FAILURE_REASON_OPTIONS.map((opt) => (
                  <SelectItem key={opt.code} value={opt.code}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notes (optional)</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any details for the consumer (e.g., what happened, time, etc.)"
              rows={4}
              disabled={submitting}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button type="button" onClick={confirm} disabled={submitting}>
            {submitting ? "Submitting…" : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

