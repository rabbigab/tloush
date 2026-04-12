# Tloush V4 — Architecture technique

> Version: 4.0
> Date: 2026-04-12
> Auteur: BMAD Software Architect

---

## Principes directeurs

1. **Reutiliser l'existant** : `israeliPayroll.ts`, `employeeRights.ts`, `bituachLeumi.ts`, `kolzchutRights.ts`, `ruleEngine.ts`, `letterTemplates.ts`, `pdfGenerator.ts`
2. **Suivre les patterns etablis** : `requireAuth() → canUseFeature() → rate limit → work → response` (cf. `documents/upload/route.ts`)
3. **Pas de sur-ingenierie** : chaque feature doit etre la plus simple possible. Pas de store Zustand global, utilisation de `useState` + SWR pour l'etat local page.
4. **Types stricts** : zero `any`. Chaque nouvelle feature a son fichier `src/types/*.ts`.

---

## Sprint 0 — Profil utilisateur enrichi

### DB migration
```sql
-- supabase/migrations/20260413_profile_enrichment.sql
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS marital_status TEXT CHECK (marital_status IN ('single','married','divorced','widowed','separated')),
  ADD COLUMN IF NOT EXISTS aliyah_year INT CHECK (aliyah_year >= 1948 AND aliyah_year <= 2100),
  ADD COLUMN IF NOT EXISTS children_count INT DEFAULT 0 CHECK (children_count >= 0),
  ADD COLUMN IF NOT EXISTS children_birth_dates DATE[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS disability_level INT CHECK (disability_level BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS employment_status TEXT CHECK (employment_status IN ('employed','self_employed','unemployed','student','retired','reservist')),
  ADD COLUMN IF NOT EXISTS spouse_profile_id UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS profile_completion_pct INT DEFAULT 0;
```

### Files
- `src/app/(app)/profile/edit/page.tsx` + `ProfileEditClient.tsx`
- `src/app/api/profile/route.ts` (GET, PATCH)
- `src/lib/profileCompletion.ts` (calcul du %)
- `src/types/profile.ts`

---

## Sprint 1 — #17 Admin monitoring

### DB migration
```sql
-- supabase/migrations/20260413_admin_metrics.sql
ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS tokens_in INT,
  ADD COLUMN IF NOT EXISTS tokens_out INT,
  ADD COLUMN IF NOT EXISTS duration_ms INT,
  ADD COLUMN IF NOT EXISTS error_code TEXT,
  ADD COLUMN IF NOT EXISTS model_used TEXT;

CREATE TABLE IF NOT EXISTS error_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  endpoint TEXT NOT NULL,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  severity TEXT DEFAULT 'error' CHECK (severity IN ('info','warning','error','critical')),
  resolved BOOLEAN DEFAULT FALSE,
  occurrence_count INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_error_log_severity_created ON error_log(severity, created_at DESC);

-- Materialized view for admin dashboard
CREATE MATERIALIZED VIEW admin_daily_stats AS
SELECT
  DATE(created_at) AS day,
  document_type,
  COUNT(*) AS total_analyses,
  AVG(duration_ms) AS avg_duration_ms,
  SUM(tokens_in) AS total_tokens_in,
  SUM(tokens_out) AS total_tokens_out,
  COUNT(*) FILTER (WHERE error_code IS NOT NULL) AS error_count
FROM documents
WHERE analyzed_at IS NOT NULL
GROUP BY DATE(created_at), document_type;

CREATE INDEX idx_admin_daily_stats_day ON admin_daily_stats(day DESC);
```

### New files
- `src/lib/claudeWrapper.ts` — wrapper centralise, logge tout
- `src/lib/claudePricing.ts` — table de prix par modele
- `src/lib/metrics.ts` — `recordMetric()`, `computeClaudeCost()`
- `src/app/admin/monitoring/page.tsx` + `MonitoringClient.tsx`
- `src/app/api/admin/metrics/route.ts`
- `src/app/api/admin/metrics/timeseries/route.ts`
- `src/app/api/cron/refresh-admin-stats/route.ts` — refresh materialized view

### Integration
- Wrap existing `[TIMING]` patterns in: `documents/upload/route.ts`, `scan/route.ts`, `extract/route.ts`, `assistant/chat/route.ts`
- Add cron job in `vercel.json` for `refresh-admin-stats`

---

## Sprint 2 — #12 Family module UI

### DB migration
```sql
-- supabase/migrations/20260414_family_shared.sql
CREATE TABLE IF NOT EXISTS family_shared_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  family_owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES auth.users(id),
  shared_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(document_id)
);

ALTER TABLE family_shared_documents ENABLE ROW LEVEL SECURITY;

-- RLS: only family members can see shared docs
CREATE POLICY "family_shared_docs_select"
  ON family_shared_documents FOR SELECT
  USING (
    auth.uid() = family_owner_id
    OR auth.uid() IN (
      SELECT member_id FROM family_members
      WHERE owner_id = family_shared_documents.family_owner_id
      AND status = 'active'
    )
  );

-- Extend documents RLS to allow family read
CREATE POLICY "documents_family_read"
  ON documents FOR SELECT
  USING (
    auth.uid() = user_id
    OR id IN (
      SELECT document_id FROM family_shared_documents
      WHERE auth.uid() IN (
        SELECT member_id FROM family_members
        WHERE owner_id = family_shared_documents.family_owner_id AND status = 'active'
      ) OR auth.uid() = family_shared_documents.family_owner_id
    )
  );
```

### New files
- `src/app/(app)/family/page.tsx` + `FamilyClient.tsx`
- `src/app/(app)/family/dashboard/page.tsx` + `FamilyDashboardClient.tsx`
- `src/components/app/FamilyMembersList.tsx`
- `src/components/app/FamilyInviteForm.tsx`
- `src/components/app/FamilySharedDocs.tsx`
- `src/lib/familySharing.ts` — `shareDocument()`, `unshareDocument()`, `canAccessFamilyDoc()`
- `src/app/api/family/documents/share/route.ts`
- `src/app/api/family/documents/route.ts` (GET list)
- `src/app/api/family/documents/[id]/route.ts` (DELETE unshare)

### Testing
- **OBLIGATOIRE** : tests pgTAP pour la RLS
- Test case : un non-membre ne peut pas lire un doc partage
- Test case : un ex-membre (status='removed') perd l'acces immediatement

---

## Sprint 3 — #6 Miluim tracker

### DB migration
```sql
-- supabase/migrations/20260415_miluim.sql
CREATE TABLE IF NOT EXISTS miluim_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_count INT GENERATED ALWAYS AS (end_date - start_date + 1) STORED,
  unit TEXT,
  service_type TEXT CHECK (service_type IN ('regular','emergency','training')),
  tzav_document_id UUID REFERENCES documents(id),
  daily_compensation NUMERIC(10,2),
  total_compensation NUMERIC(10,2),
  employer_reimbursed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (end_date >= start_date)
);

CREATE INDEX idx_miluim_user_date ON miluim_periods(user_id, start_date DESC);

ALTER TABLE miluim_periods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "miluim_owner" ON miluim_periods USING (auth.uid() = user_id);
```

### New files
- `src/lib/miluim.ts` — constantes versionnees 2025/2026, `computeDailyMiluim()`, `computeTotalCompensation()`, `validateMiluimLimits()`
- `src/app/(app)/miluim/page.tsx` + `MiluimClient.tsx`
- `src/app/api/miluim/route.ts` (GET, POST)
- `src/app/api/miluim/[id]/route.ts` (PUT, DELETE)
- `src/app/api/miluim/summary/route.ts` (year aggregations)
- `src/app/api/miluim/letter/route.ts` (PDF generation)
- `src/types/miluim.ts`

### Integration
- Reuse `bituachLeumi.ts` benefit `'miluim'` for rules
- Reuse `letterTemplates.ts` for the employer letter (add bilingual FR/HE template)
- Reuse `pdfGenerator.ts` for PDF export
- Add miluim widget to `DashboardClient.tsx`

---

## Sprint 4 — #5 Tax refund estimator

### DB migration
```sql
-- supabase/migrations/20260416_tax_refund.sql
CREATE TABLE IF NOT EXISTS tax_refund_estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tax_year INT NOT NULL CHECK (tax_year >= 2020),
  form_106_document_ids UUID[] DEFAULT '{}',
  gross_annual NUMERIC(12,2),
  tax_paid NUMERIC(12,2),
  bl_paid NUMERIC(12,2),
  health_paid NUMERIC(12,2),
  credit_points_used NUMERIC(4,2),
  credit_points_eligible NUMERIC(4,2),
  computed_tax NUMERIC(12,2),
  estimated_refund NUMERIC(12,2),
  breakdown JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tax_refund_user_year ON tax_refund_estimates(user_id, tax_year DESC);

ALTER TABLE tax_refund_estimates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tax_refund_owner" ON tax_refund_estimates USING (auth.uid() = user_id);
```

### New files
- `src/lib/prompts/form106.ts` — prompt dedie pour Claude
- `src/lib/taxRefund.ts` — `computeAnnualTax()`, `estimateRefund()`, `detectMissingCreditPoints()`
- `src/app/(app)/tax-refund/page.tsx` + `TaxRefundClient.tsx`
- `src/app/api/tax-refund/estimate/route.ts`
- `src/app/api/tax-refund/analyze-106/route.ts` (Claude call)
- `src/app/api/tax-refund/history/route.ts`
- `src/app/api/tax-refund/[id]/export/route.ts` (PDF Tofes 135)
- `src/types/taxRefund.ts`

### Integration
- Add `tax_form_106` to `src/lib/docTypes.ts`
- Reuse `israeliPayroll.ts` : brackets, `CREDIT_POINT_VALUE_MONTHLY`, credit point logic
- Use profile enrichment (Sprint 0) for family situation
- Disclaimer via existing `DisclaimerBlock` component
- Integration with `expertMatcher.ts` for yoetz mas recommendation

---

## Sprint 5 — #8 Annual payslip comparator

### DB migration (minimal)
```sql
-- supabase/migrations/20260417_payslip_view.sql
-- Pas de nouvelle table - vue helper sur analysis_data
CREATE OR REPLACE VIEW v_payslips_normalized AS
SELECT
  id, user_id, period, created_at,
  (analysis_data->'payslip_details'->>'gross_salary')::NUMERIC AS gross,
  (analysis_data->'payslip_details'->>'net_salary')::NUMERIC AS net,
  (analysis_data->'payslip_details'->>'income_tax')::NUMERIC AS income_tax,
  (analysis_data->'payslip_details'->>'bituah_leumi')::NUMERIC AS bituah_leumi,
  (analysis_data->'payslip_details'->>'health_insurance')::NUMERIC AS health_insurance,
  (analysis_data->'payslip_details'->>'pension_employee')::NUMERIC AS pension_employee,
  analysis_data->'payslip_details' AS raw_details
FROM documents
WHERE document_type = 'payslip' AND analysis_data IS NOT NULL;
```

### New files
- `src/lib/payslipTimeline.ts` — `buildTimeline()`, `detectRaises()`, `detectAnomalies()`, `detectNewLines()`
- `src/app/(app)/payslips/annual/page.tsx` + `AnnualPayslipClient.tsx`
- `src/components/payslips/PayslipEvolutionChart.tsx` (Recharts)
- `src/components/payslips/PayslipComparisonTable.tsx`
- `src/app/api/payslips/annual/route.ts` (GET with year param)
- `src/app/api/payslips/annual/export/route.ts` (CSV)

### Integration
- No new Claude calls — pure compute on stored data
- Reuse `israeliPayroll.verifyPayslip()` for consistency checks
- Add Recharts package if not present (~150kb gzipped)
- Add "Voir evolution annuelle" CTA on `documents/[id]` when document_type=payslip

---

## Sprint 6 — #10 Automatic rights detector (MVP 10 rules)

### DB migration
```sql
-- supabase/migrations/20260418_rights_detector.sql
CREATE TABLE IF NOT EXISTS rights_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title_fr TEXT NOT NULL,
  description_fr TEXT NOT NULL,
  authority TEXT NOT NULL,
  category TEXT NOT NULL,
  conditions JSONB NOT NULL,
  average_amount NUMERIC(10,2),
  application_url TEXT,
  confidence_level TEXT CHECK (confidence_level IN ('high','medium','low')),
  disclaimer TEXT,
  version TEXT DEFAULT '2025.1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS detected_rights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  right_slug TEXT NOT NULL REFERENCES rights_catalog(slug),
  confidence_score NUMERIC(3,2) CHECK (confidence_score BETWEEN 0 AND 1),
  estimated_value NUMERIC(12,2),
  source TEXT NOT NULL CHECK (source IN ('profile','document','cross_ref')),
  source_doc_id UUID REFERENCES documents(id),
  status TEXT DEFAULT 'suggested' CHECK (status IN ('suggested','claimed','dismissed','verified')),
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, right_slug)
);

CREATE INDEX idx_detected_rights_user ON detected_rights(user_id, status);
ALTER TABLE detected_rights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "detected_rights_owner" ON detected_rights USING (auth.uid() = user_id);
```

### New files
- `src/lib/rightsDetector.ts` — moteur de regles, `detectRights(profile, documents)`
- `src/lib/rightsRules/` — 1 fichier par regle pour maintenabilite :
  - `olehCreditPoints.ts`
  - `singleParentCreditPoints.ts`
  - `youngChildrenCreditPoints.ts`
  - `kitsbatYeladim.ts`
  - `freelanceStartBLExemption.ts`
  - `miluimNonReclaimed.ts`
  - `masHachnasaRefund.ts`
  - `severanceNonPaid.ts`
  - `unusedVacationExcess.ts`
  - `havraaNonPaid.ts`
- `src/app/(app)/rights-check/DetectedRightsTab.tsx`
- `src/components/app/DetectedRightsList.tsx`
- `src/app/api/rights/detect/route.ts`
- `src/app/api/rights/detected/route.ts` (GET, PATCH status)
- `src/types/rightsDetector.ts`

### Integration
- Reuse `kolzchutRights.ts` (catalog), `employeeRights.ts` (employee entitlements), `bituachLeumi.ts` (allowances), `ruleEngine.ts` (existing pattern)
- Triggered on document upload (fire-and-forget) + profile update
- Seed the 10 rules in migration

---

## Cross-cutting concerns

### Monitoring integration (from Sprint 1)
Every new API route MUST:
1. Log duration via `recordMetric()`
2. Log Claude tokens/cost if using Claude
3. Capture errors into `error_log` table

### Type definitions centralisation
New types go in:
- `src/types/profile.ts` (Sprint 0)
- `src/types/admin.ts` (Sprint 1)
- `src/types/family.ts` (Sprint 2)
- `src/types/miluim.ts` (Sprint 3)
- `src/types/taxRefund.ts` (Sprint 4)
- `src/types/payslipTimeline.ts` (Sprint 5)
- `src/types/rightsDetector.ts` (Sprint 6)

Re-export all from `src/types/index.ts`.

### Migration order (strict)
1. `20260413_profile_enrichment.sql` (Sprint 0)
2. `20260413_admin_metrics.sql` (Sprint 1)
3. `20260414_family_shared.sql` (Sprint 2)
4. `20260415_miluim.sql` (Sprint 3)
5. `20260416_tax_refund.sql` (Sprint 4)
6. `20260417_payslip_view.sql` (Sprint 5)
7. `20260418_rights_detector.sql` (Sprint 6)

### Files most touched by V4 integration
- `src/app/api/documents/upload/route.ts` — metrics hook + rights re-scan hook
- `src/lib/docTypes.ts` — add `tax_form_106`
- `src/app/(app)/dashboard/DashboardClient.tsx` — miluim, tax refund, detected rights widgets
- `src/app/(app)/rights-check/RightsCheckClient.tsx` — detected rights tab
- `src/app/(app)/profile/edit/page.tsx` — profile enrichment fields
- `vercel.json` — new cron for admin stats refresh
