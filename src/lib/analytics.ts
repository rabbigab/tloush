import posthog from "posthog-js";

type TloushEvent =
  | "file_uploaded"
  | "extraction_started"
  | "extraction_completed"
  | "extraction_failed"
  | "extraction_confirmed"
  | "questionnaire_started"
  | "questionnaire_completed"
  | "report_generated"
  | "demo_started"
  | "consent_accepted"
  | "consent_declined"
  | "report_section_viewed"
  | "anomaly_detected"
  | "page_viewed"
  | "error_boundary_hit";

export function track(event: TloushEvent, properties?: Record<string, unknown>) {
  try {
    if (typeof window !== "undefined" && (window as any).__ph_initialized) {
      posthog.capture(event, properties);
    }
  } catch (_) {}
}

export function identifyUser(userId: string, traits?: Record<string, unknown>) {
  try {
    if (typeof window !== "undefined" && (window as any).__ph_initialized) {
      posthog.identify(userId, traits);
    }
  } catch (_) {}
}
