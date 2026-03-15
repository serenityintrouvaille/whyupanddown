import type { NextApiRequest, NextApiResponse } from 'next';
import { runDailySnapshot } from '@/lib/middle-east-service';

interface ResponseData {
  success: boolean;
  timestamp: string;
  snapshot?: unknown;
  error?: string;
}

function isAuthorized(req: NextApiRequest): boolean {
  const token = process.env.ADMIN_TOKEN;
  if (!token) {
    return false;
  }

  const auth = req.headers.authorization;
  return auth === `Bearer ${token}`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      timestamp: new Date().toISOString(),
      error: 'Method not allowed'
    });
  }

  if (!process.env.ADMIN_TOKEN) {
    return res.status(500).json({
      success: false,
      timestamp: new Date().toISOString(),
      error: 'Server misconfiguration: ADMIN_TOKEN required'
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
    const payload = await runDailySnapshot('admin');
    return res.status(200).json({
      success: true,
      timestamp: payload.timestamp,
      snapshot: payload
    });
  } catch (error) {
    console.error('[ADMIN UPDATE ERROR]', error);
    return res.status(500).json({
      success: false,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
