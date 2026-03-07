import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface ResultsResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResultsResponse>
) {
  try {
    const dataDir = path.join(process.cwd(), 'data');

    if (!fs.existsSync(dataDir)) {
      return res.status(200).json({
        success: true,
        data: { message: 'No results yet' }
      });
    }

    // 가장 최신 결과 파일 찾기
    const files = fs.readdirSync(dataDir)
      .filter(f => f.startsWith('results-'))
      .sort()
      .reverse();

    if (files.length === 0) {
      return res.status(200).json({
        success: true,
        data: { message: 'No results yet' }
      });
    }

    const latestFile = path.join(dataDir, files[0]);
    const data = JSON.parse(fs.readFileSync(latestFile, 'utf-8'));

    res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
