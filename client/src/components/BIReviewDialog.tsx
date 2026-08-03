import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const biReviewSchema = z.object({
  companyName: z.string().min(1, "Company name required"),
  contactName: z.string().min(1, "Contact name required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(1, "Phone number required"),
  position: z.enum(["CFO", "COO", "Risk", "Insurance", "Other"]),
  miningSector: z.string().min(1, "Mining sector required"),
  riskArea: z.enum(["BI", "Tailings", "Machinery", "Supply", "Multiple"]),
  message: z.string().optional(),
});

type BIReviewFormValues = z.infer<typeof biReviewSchema>;

const POSITIONS: BIReviewFormValues["position"][] = ["CFO", "COO", "Risk", "Insurance", "Other"];
const RISK_AREAS: { value: BIReviewFormValues["riskArea"]; label: string }[] = [
  { value: "BI", label: "Business Interruption" },
  { value: "Tailings", label: "Tailings" },
  { value: "Machinery", label: "Machinery" },
  { value: "Supply", label: "Supply Chain" },
  { value: "Multiple", label: "Multiple" },
];

interface BIReviewDialogProps {
  trigger: React.ReactNode;
}

export default function BIReviewDialog({ trigger }: BIReviewDialogProps) {
  const [open, setOpen] = useState(false);
  const submitMutation = trpc.leads.submitBIReview.useMutation();

  const form = useForm<BIReviewFormValues>({
    resolver: zodResolver(biReviewSchema),
    defaultValues: {
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      position: "CFO",
      miningSector: "",
      riskArea: "BI",
      message: "",
    },
  });

  const onSubmit = async (values: BIReviewFormValues) => {
    try {
      const result = await submitMutation.mutateAsync(values);
      if (result.success) {
        toast.success(result.message);
        form.reset();
        setOpen(false);
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to submit request. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="bg-slate-900 border-amber-600/30 text-white max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-amber-600">Request a BI Review</DialogTitle>
          <DialogDescription className="text-slate-400">
            Tell us about your operation and a MineTrans advisor will be in touch within 24 hours.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="companyName">Company name</Label>
              <Input id="companyName" {...form.register("companyName")} />
              {form.formState.errors.companyName && (
                <p className="text-red-400 text-xs">{form.formState.errors.companyName.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contactName">Contact name</Label>
              <Input id="contactName" {...form.register("contactName")} />
              {form.formState.errors.contactName && (
                <p className="text-red-400 text-xs">{form.formState.errors.contactName.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register("email")} />
              {form.formState.errors.email && (
                <p className="text-red-400 text-xs">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...form.register("phone")} />
              {form.formState.errors.phone && (
                <p className="text-red-400 text-xs">{form.formState.errors.phone.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Position</Label>
              <Select
                value={form.watch("position")}
                onValueChange={(v) => form.setValue("position", v as BIReviewFormValues["position"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POSITIONS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Primary risk area</Label>
              <Select
                value={form.watch("riskArea")}
                onValueChange={(v) => form.setValue("riskArea", v as BIReviewFormValues["riskArea"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RISK_AREAS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="miningSector">Mining sector</Label>
            <Input id="miningSector" placeholder="e.g. Copper, Gold, Coal, PGMs" {...form.register("miningSector")} />
            {form.formState.errors.miningSector && (
              <p className="text-red-400 text-xs">{form.formState.errors.miningSector.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="message">Message (optional)</Label>
            <Textarea id="message" rows={3} {...form.register("message")} />
          </div>

          <Button
            type="submit"
            disabled={submitMutation.isPending}
            className="w-full bg-amber-600 hover:bg-amber-700"
          >
            {submitMutation.isPending ? "Submitting..." : "Submit Request"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
