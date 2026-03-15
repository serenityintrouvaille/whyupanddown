export const GITHUB_WORKFLOW_FALLBACK_KEY = 'whyupanddown-workflow-fallback-v1';

export function isWorkflowAuthorized(authHeader?: string, workflowKey?: string): boolean {
  const secret = process.env.CRON_SECRET;
  const matchesSecret = Boolean(secret) && authHeader === `Bearer ${secret}`;
  const matchesFallback = workflowKey === GITHUB_WORKFLOW_FALLBACK_KEY;

  if (!secret) {
    return true;
  }

  return matchesSecret || matchesFallback;
}
