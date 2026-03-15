import type { NextApiRequest, NextApiResponse } from 'next';
import { runDailySnapshot } from '@/lib/middle-east-service';
import { isWorkflowAuthorized } from '@/lib/workflow-auth';

interface ResponseData {
  success: boolean;
  timestamp: string;
  snapshot?: unknown;
  error?: string;
}

function isAuthorized(req: NextApiRequest): boolean {
  return isWorkflowAuthorized(
    req.headers.authorization,
    typeof req.headers['x-workflow-key'] === 'string' ? req.headers['x-workflow-key'] : undefined
  );
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      timestamp: new Date().toISOString(),
      error: 'Method not allowed'
    });
  }

  if (!isAuthorized(req)) {
    return res.status(401).json({
      success: false,
      timestamp: new Date().toISOString(),
      error: 'Unauthorized'
    });
  }

  try {
    const payload = await runDailySnapshot('cron');
    return res.status(200).json({
      success: true,
      timestamp: payload.timestamp,
      snapshot: payload
    });
  } catch (error) {
    console.error('[UPDATE ERROR]', error);
    return res.status(500).json({
      success: false,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
