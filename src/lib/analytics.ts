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
  | "error_boundary_hit"
  | "profile_updated"
  // Funnel: signup Ã¢ÂÂ paywall Ã¢ÂÂ checkout
  | "signup_started"
  | "signup_completed"
  | "signup_failed"
  | "login_completed"
  | "pricing_viewed"
  | "paywall_shown"
  | "checkout_started"
  | "checkout_completed"
  | "checkout_canceled"
  | "subscription_canceled"
  // Product usage
  | "document_uploaded"
  | "document_analyzed"
  | "document_viewed"
  | "document_exported"
  | "folder_created"
  | "folder_renamed"
  | "folder_deleted"
  | "folder_merged"
  | "expense_edited"
  | "expenses_exported"
  | "search_performed"
  | "assistant_message_sent"
  | "deadline_action_taken"
  // Engagement
  | "onboarding_started"
  | "onboarding_completed"
  | "onboarding_dismissed"
  | "onboarding_v2_started"
  | "onboarding_v2_completed"
  | "onboarding_v2_dismissed"
  | "onboarding_v2_step"
  | "feedback_submitted"
  // Annuaire prestataires
  | "directory_provider_signup_completed"
  | "directory_provider_contacted"
  | "directory_review_submitted"
  | "directory_provider_viewed"
  | "directory_contact_revealed"
  | "directory_contact_gate_shown"
  | "directory_provider_called"
  | "directory_provider_whatsapped"
  | "directory_viewed"
  | "directory_category_viewed";

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
