import type { NextApiRequest, NextApiResponse } from 'next';
import { runRollingIngest } from '@/lib/middle-east-service';

interface ResponseData {
  success: boolean;
  timestamp: string;
  data?: unknown;
  error?: string;
}

function isAuthorized(req: NextApiRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return true;
  }
  const auth = req.headers.authorization;
  return auth === `Bearer ${secret}`;
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
    const payload = await runRollingIngest();
    return res.status(200).json({
      success: true,
      timestamp: payload.timestamp,
      data: payload
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
