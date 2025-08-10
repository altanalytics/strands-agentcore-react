// functions/bedrock-agent-stream/resource.ts
import { defineFunction } from '@aws-amplify/backend';

export const bedrockAgentStream = defineFunction({
  name: 'bedrock-agent-stream',
  entry: './functions/bedrock-agent-stream/handler.mjs',
  runtime: 20,                 // Node.js 20.x
  timeoutSeconds: 600,
  memoryMB: 1024,
  environment: {
    AGENTCORE_QUALIFIER: 'DEFAULT',
    // Set this in Amplify Console → Backend environment variables
    AGENTCORE_RUNTIME_ARN: process.env.AGENTCORE_RUNTIME_ARN ?? '',
  },
});
