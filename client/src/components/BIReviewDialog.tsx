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
  position: z.enum(["Finance", "Operations", "Risk", "Insurance", "Other"]),
  miningSector: z.string().min(1, "Mining sector required"),
  riskArea: z.enum(["BI", "Tailings", "Machinery", "Supply", "Multiple"]),
  // Operational details Roger needs to scope a BI review before the call.
  siteLocation: z.string().optional(),
  annualTurnover: z.string().optional(),
  biSumInsured: z.string().optional(),
  indemnityPeriod: z.enum([
    "12 months",
    "18 months",
    "24 months",
    "36 months",
    "Not sure",
  ]),
  keyFacility: z.string().optional(),
  previousClaims: z.string().optional(),
  currentInsurer: z.string().optional(),
  siteVisitAvailability: z.string().optional(),
  message: z.string().optional(),
});

type BIReviewFormValues = z.infer<typeof biReviewSchema>;

const POSITIONS: BIReviewFormValues["position"][] = [
  "Finance",
  "Operations",
  "Risk",
  "Insurance",
  "Other",
];
const RISK_AREAS: { value: BIReviewFormValues["riskArea"]; label: string }[] = [
  { value: "BI", label: "Business Interruption" },
  { value: "Tailings", label: "Tailings" },
  { value: "Machinery", label: "Machinery" },
  { value: "Supply", label: "Supply Chain" },
  { value: "Multiple", label: "Multiple" },
];
const INDEMNITY_PERIODS: BIReviewFormValues["indemnityPeriod"][] = [
  "12 months",
  "18 months",
  "24 months",
  "36 months",
  "Not sure",
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
      position: "Finance",
      miningSector: "",
      riskArea: "BI",
      siteLocation: "",
      annualTurnover: "",
      biSumInsured: "",
      indemnityPeriod: "Not sure",
      keyFacility: "",
      previousClaims: "",
      currentInsurer: "",
      siteVisitAvailability: "",
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
      toast.error(
        error?.message || "Failed to submit request. Please try again."
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="bg-slate-900 border-amber-600/30 text-white max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-amber-600">
            Request a BI Review
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Tell us about your operation and a MineTrans advisor will be in
            touch within 24 hours.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="companyName">Company name</Label>
              <Input id="companyName" {...form.register("companyName")} />
              {form.formState.errors.companyName && (
                <p className="text-red-400 text-xs">
                  {form.formState.errors.companyName.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contactName">Contact name</Label>
              <Input id="contactName" {...form.register("contactName")} />
              {form.formState.errors.contactName && (
                <p className="text-red-400 text-xs">
                  {form.formState.errors.contactName.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register("email")} />
              {form.formState.errors.email && (
                <p className="text-red-400 text-xs">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...form.register("phone")} />
              {form.formState.errors.phone && (
                <p className="text-red-400 text-xs">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Position</Label>
              <Select
                value={form.watch("position")}
                onValueChange={v =>
                  form.setValue("position", v as BIReviewFormValues["position"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POSITIONS.map(p => (
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
                onValueChange={v =>
                  form.setValue("riskArea", v as BIReviewFormValues["riskArea"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RISK_AREAS.map(r => (
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
            <Input
              id="miningSector"
              placeholder="e.g. Copper, Gold, Coal, PGMs"
              {...form.register("miningSector")}
            />
            {form.formState.errors.miningSector && (
              <p className="text-red-400 text-xs">
                {form.formState.errors.miningSector.message}
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-slate-700">
            <p className="text-xs uppercase tracking-wider text-amber-600/80 mb-3">
              Operational details for the review
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="siteLocation">
              Site / operation name &amp; location
            </Label>
            <Input
              id="siteLocation"
              placeholder="e.g. Blesbok Colliery, Mpumalanga"
              {...form.register("siteLocation")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="annualTurnover">
                Annual turnover / gross profit
              </Label>
              <Input
                id="annualTurnover"
                placeholder="e.g. R450m"
                {...form.register("annualTurnover")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="biSumInsured">Estimated BI sum insured</Label>
              <Input
                id="biSumInsured"
                placeholder="e.g. R300m"
                {...form.register("biSumInsured")}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Indemnity period required</Label>
              <Select
                value={form.watch("indemnityPeriod")}
                onValueChange={v =>
                  form.setValue(
                    "indemnityPeriod",
                    v as BIReviewFormValues["indemnityPeriod"]
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INDEMNITY_PERIODS.map(p => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="currentInsurer">
                Current insurer / broker (if any)
              </Label>
              <Input id="currentInsurer" {...form.register("currentInsurer")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="keyFacility">
              Key production facility / single point of failure
            </Label>
            <Input
              id="keyFacility"
              placeholder="e.g. primary mill, shaft, plant"
              {...form.register("keyFacility")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="previousClaims">
                Previous BI claims (if any)
              </Label>
              <Input
                id="previousClaims"
                placeholder="None, or brief details"
                {...form.register("previousClaims")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="siteVisitAvailability">
                Preferred site visit availability
              </Label>
              <Input
                id="siteVisitAvailability"
                placeholder="e.g. weekday mornings"
                {...form.register("siteVisitAvailability")}
              />
            </div>
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
