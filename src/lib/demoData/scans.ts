/**
 * Simulated security-scan results (#964).
 *
 * The dashboard's scanners (Snyk/Dependabot/Semgrep/Trivy) are not actually
 * executed in the browser — the numbers they report are invented and are only
 * ever shown behind `<DemoDataProvider>` with a visible "Demo data" badge.
 */

/**
 * Number of findings a demo scan "discovers". Random so repeated demo scans
 * feel live; this is fine because the result is always badged as demo data.
 */
export function generateDemoScanFindings(): number {
  return Math.floor(Math.random() * 8);
}
