// handler.mjs
import { BedrockAgentCoreClient, InvokeAgentRuntimeCommand } from "@aws-sdk/client-bedrock-agentcore";

// IMPORTANT: deploy with @aws-sdk/client-bedrock-agentcore (bundled or via a layer)

export const handler = awslambda.streamifyResponse(async (event, responseStream, context) => {
  const httpStream = awslambda.HttpResponseStream.from(responseStream, {
    statusCode: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
      // CORS headers removed - handled by Function URL configuration
    }
  });

  const region = process.env.AWS_REGION || "us-east-1";
  const runtimeArn = process.env.AGENTCORE_RUNTIME_ARN || "placeholder";
  const qualifier  = process.env.AGENTCORE_QUALIFIER || "DEFAULT";

  let body = {};
  try { body = JSON.parse(event.body || "{}"); } catch {}
  const prompt    = body.prompt ?? "Hello";
  const sessionId = body.session_id ?? "default-session";

  const client = new BedrockAgentCoreClient({ region });

  const payload = JSON.stringify({ prompt });

  const cmd = new InvokeAgentRuntimeCommand({
    agentRuntimeArn: runtimeArn,
    runtimeSessionId: sessionId,
    payload,
    contentType: "application/json",
    accept: "text/event-stream",
    qualifier
  });

  try {
    const resp = await client.send(cmd);

    // Stream AgentCore SSE directly to client
    for await (const chunk of resp.response) {
      // chunk is Uint8Array that already contains "data: ..." SSE lines
      httpStream.write(chunk);
    }
  } catch (err) {
    // Emit an SSE error event so the client sees something useful
    const msg = (err?.message || "unknown error").replace(/\n/g, " ");
    httpStream.write(`event: error\ndata: ${msg}\n\n`);
  } finally {
    httpStream.end();
  }
});
