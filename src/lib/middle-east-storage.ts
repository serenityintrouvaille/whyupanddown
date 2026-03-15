import { getSupabaseServerClient } from '@/lib/supabase-server';
import type { DailySnapshotPayload, RollingIngestPayload } from '@/lib/middle-east-types';

async function writeFile(pathname: string, payload: unknown) {
  const fs = await import('fs');
  const path = await import('path');
  const fullPath = path.join(process.cwd(), 'data', pathname);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullPath, JSON.stringify(payload, null, 2), 'utf-8');
}

async function readFile<T>(pathname: string): Promise<T | null> {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const fullPath = path.join(process.cwd(), 'data', pathname);
    if (!fs.existsSync(fullPath)) {
      return null;
    }
    return JSON.parse(fs.readFileSync(fullPath, 'utf-8')) as T;
  } catch {
    return null;
  }
}

export async function saveRolling(payload: RollingIngestPayload): Promise<void> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { error } = await supabase.from('rolling_updates').insert({
      created_at: payload.timestamp,
      payload
    });
    if (error) {
      throw error;
    }
    return;
  }

  await writeFile('middleeast-rolling.json', payload);
}

export async function getRolling(): Promise<RollingIngestPayload | null> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('rolling_updates')
      .select('payload')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return (data?.payload as RollingIngestPayload | undefined) || null;
  }

  return readFile<RollingIngestPayload>('middleeast-rolling.json');
}

export async function saveSnapshot(payload: DailySnapshotPayload): Promise<void> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const row = {
      snapshot_date: payload.date,
      trigger: payload.trigger,
      created_at: payload.timestamp,
      payload
    };

    const { data: updatedRows, error: updateError } = await supabase
      .from('daily_snapshots')
      .update(row)
      .eq('snapshot_date', payload.date)
      .select('id');

    if (updateError) {
      throw updateError;
    }

    if (!updatedRows || updatedRows.length === 0) {
      const { error: insertError } = await supabase.from('daily_snapshots').insert(row);
      if (insertError) {
        throw insertError;
      }
    }
    return;
  }

  await writeFile('middleeast-snapshot-latest.json', payload);
  await writeFile(`snapshots/${payload.date}.json`, payload);
}

export async function getSnapshot(): Promise<DailySnapshotPayload | null> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('daily_snapshots')
      .select('payload')
      .order('snapshot_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return (data?.payload as DailySnapshotPayload | undefined) || null;
  }

  return readFile<DailySnapshotPayload>('middleeast-snapshot-latest.json');
}
