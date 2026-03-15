import type { NextApiRequest, NextApiResponse } from 'next';
import { buildSignalBoard } from '@/lib/middle-east-board';
import { getRolling, getSnapshot } from '@/lib/middle-east-storage';
import type { DailySnapshotPayload, RollingIngestPayload, SignalBoard } from '@/lib/middle-east-types';

interface ResultsResponse {
  success: boolean;
  data?: {
    snapshot: DailySnapshotPayload | null;
    rolling: RollingIngestPayload | null;
    board: SignalBoard | null;
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResultsResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const [snapshot, rolling] = await Promise.all([getSnapshot(), getRolling()]);
    return res.status(200).json({
      success: true,
      data: {
        snapshot,
        rolling,
        board: buildSignalBoard(rolling || snapshot)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
