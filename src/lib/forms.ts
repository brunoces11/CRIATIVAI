export type TalentPreviewPayload = {
  requester_name: string;
  requester_email: string;
  job_title: string;
  search_criteria_1: string;
  search_criteria_2?: string;
  search_criteria_3?: string;
  search_criteria_4?: string;
  exclusion_criteria?: string;
  differentiator?: string;
  started_at_ms: number;
  honeypot?: string;
};

export type ContactPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
  started_at_ms: number;
  honeypot?: string;
};

export type FormSubmissionResult = {
  ok: boolean;
  reference_id: number;
  notification_email_status: string;
  confirmation_email_status: string | null;
};

export async function submitTalentPreview(payload: TalentPreviewPayload): Promise<FormSubmissionResult> {
  return postForm("/api/forms/talent-preview", payload);
}

export async function submitContact(payload: ContactPayload): Promise<FormSubmissionResult> {
  return postForm("/api/forms/contact", payload);
}

async function postForm(url: string, payload: Record<string, string | number | undefined>): Promise<FormSubmissionResult> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(getErrorMessage(data) ?? "Something went wrong while sending your request.");
    }

    return data as FormSubmissionResult;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("The local backend is unavailable. Start the full dev stack with npm run dev, then try again.");
    }
    throw error;
  }
}

function getErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;

  const detail = "detail" in payload ? (payload as { detail?: unknown }).detail : null;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0];
    if (first && typeof first === "object" && "msg" in first && typeof first.msg === "string") {
      return first.msg;
    }
  }

  return null;
}
