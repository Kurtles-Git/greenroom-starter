import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const OFFRAMP_ENDPOINT =
  "https://myobjoetisihqjtuhxxq.supabase.co/functions/v1/recovery-playbook";

const payloadSchema = z.object({
  risk_type: z.string().min(1).max(64),
  stakeholder_type: z.string().min(1).max(64),
  stakeholder_name: z.string().min(1).max(255),
  company_or_account: z.string().max(255).nullable().optional(),
  issue_summary: z.string().min(1).max(500),
  issue_details: z.string().max(2000).optional(),
  value_at_risk: z.number().min(0).max(10_000_000),
  currency: z.string().length(3),
  urgency: z.enum(["low", "medium", "high"]),
  source_app: z.string().min(1).max(64),
  source_reference_id: z.string().min(1).max(128),
  scenario_a: z
    .object({
      label: z.string(),
      outcome_value: z.number(),
      description: z.string(),
    })
    .optional(),
  scenario_b: z
    .object({
      label: z.string(),
      outcome_value: z.number(),
      description: z.string(),
    })
    .optional(),
});

export type RecoveryApiInput = z.infer<typeof payloadSchema>;

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [k: string]: JsonValue };

export interface RecoveryPlaybookResult {
  ok: boolean;
  status: number;
  playbook: JsonValue | null;
  share_url: string | null;
  error: string | null;
}

export const generateRecoveryPlaybook = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => payloadSchema.parse(input))
  .handler(async ({ data }): Promise<RecoveryPlaybookResult> => {
    const key = process.env.OFFRAMP_ANON_KEY;
    if (!key) {
      return {
        ok: false,
        status: 0,
        playbook: null,
        share_url: null,
        error: "OFFRAMP_ANON_KEY not configured",
      };
    }

    try {
      const res = await fetch(OFFRAMP_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
          apikey: key,
        },
        body: JSON.stringify(data),
      });

      const text = await res.text();
      let body: JsonValue = {};
      try {
        body = text ? (JSON.parse(text) as JsonValue) : {};
      } catch {
        body = { raw: text };
      }

      const asObj =
        body && typeof body === "object" && !Array.isArray(body)
          ? (body as { [k: string]: JsonValue })
          : {};

      if (!res.ok) {
        const err = asObj.error ?? asObj.message;
        return {
          ok: false,
          status: res.status,
          playbook: null,
          share_url: null,
          error: typeof err === "string" ? err : `Upstream ${res.status}`,
        };
      }

      const share = asObj.share_url;
      return {
        ok: true,
        status: res.status,
        playbook: body,
        share_url: typeof share === "string" ? share : null,
        error: null,
      };
    } catch (err) {
      return {
        ok: false,
        status: 0,
        playbook: null,
        share_url: null,
        error: err instanceof Error ? err.message : "Network error",
      };
    }
  });
