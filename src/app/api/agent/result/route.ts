import { NextResponse } from 'next/server';
import { verifyAgentToken } from '@/lib/agentAuth';
import { parseServerProperties } from '@/lib/serverProperties';

export async function POST(req: Request) {
  try {
    const authResult = await verifyAgentToken(req);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { server, supabase } = authResult;
    const body = await req.json();

    const command_id = body.command_id;
    const rawStatus = (body.status || 'EXECUTED').toUpperCase();
    const status = rawStatus === 'FAILED' ? 'FAILED' : 'EXECUTED';

    let finalResult = body.result || {};
    if (body.result_output) {
      if (typeof body.result_output === 'string') {
        try {
          finalResult = JSON.parse(body.result_output);
        } catch {
          finalResult = { output: body.result_output };
        }
      } else {
        finalResult = body.result_output;
      }
    }

    if (!command_id) {
      return NextResponse.json({ error: 'Missing command_id' }, { status: 400 });
    }

    if (typeof finalResult?.content === 'string') {
      const { data: command, error } = await supabase
        .from('server_commands')
        .select('payload')
        .eq('id', command_id)
        .eq('server_id', server.id)
        .maybeSingle();
      if (error) return NextResponse.json({ error: 'Could not verify the result type.' }, { status: 502 });
      if (command?.payload?.settings_read === true) {
        finalResult = { properties: parseServerProperties(finalResult.content) };
      }
    }

    const isUpload = body.file_upload === true;
    const update = supabase
      .from('server_commands')
      .update({
        status,
        result: finalResult,
        executed_at: new Date().toISOString(),
        ...(isUpload && { payload: { action: 'UPLOAD_FILE_CHUNK', file_manager: true } }),
      })
      .eq('id', command_id)
      .eq('server_id', server.id)
      .eq('status', 'FETCHED');
    if (isUpload) update.eq('payload->>action', 'UPLOAD_FILE_CHUNK');
    const { error: updateError } = await update;

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Result submission error' }, { status: 500 });
  }
}
