import { Request, Response } from "express";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";

const COMMODITIES = ["Gold", "Diamonds", "Coal", "Chrome", "Platinum Group Metals", "Iron Ore"] as const;

const requestSchema = z.object({
  commodity: z.enum(COMMODITIES).or(z.string().min(2).max(60)),
  annualRevenue: z.string().max(40).optional(),
});

const SYSTEM_PROMPT = `You are an underwriting analyst producing a WORKED TRAINING EXAMPLE for MineTrans Insurance Brokers' internal advisors, illustrating how a robust Business Interruption (BI) insurance assessment is structured for a mining operation.

This is a teaching example, not real client advice. Every figure you produce (revenue, gross profit, indemnity periods, sums insured, timeframes) is illustrative and hypothetical — invented to demonstrate the methodology, never presented as a real client's actual data. State plainly at the top that the example is illustrative.

Structure the assessment in exactly these 11 sections, using clear headings:
1. Description of the mining process and critical operations
2. Asset criticality ranking and production bottlenecks
3. Maximum Foreseeable Loss (MFL) scenario
4. Gross Profit calculation based on policy wording
5. Production interruption and recovery model
6. Increased Cost of Working (ICOW) assessment
7. Supply chain and utility dependency analysis
8. Recommended indemnity period, with justification
9. Recommended Business Interruption sum insured
10. Scenario-based BI loss estimates
11. Key assumptions, exclusions, and sensitivity analysis

Write for a mining insurance advisor audience — technically grounded, concise, and specific to the named commodity's actual production process and typical risk profile. Use plain markdown headings (##) for the 11 sections. Do not add extra sections beyond the 11.`;

export async function biAssessmentHandler(req: Request, res: Response) {
  const parsed = requestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(503).json({
      error: "BI assessment generator is not configured. ANTHROPIC_API_KEY is not set on the server.",
    });
    return;
  }

  const { commodity, annualRevenue } = parsed.data;

  try {
    const anthropic = new Anthropic({ apiKey });
    const userPrompt = `Produce the worked BI insurance assessment example for a ${commodity} mining operation.${
      annualRevenue ? ` Use an illustrative annual revenue in the region of ${annualRevenue} as the basis for figures.` : ""
    }`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map(block => block.text)
      .join("\n");

    res.json({ commodity, assessment: text });
  } catch (error) {
    console.error("[BI Assessment] Generation failed:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(502).json({ error: "Failed to generate assessment", details: errorMessage });
  }
}
