import { defineFunction } from '@aws-amplify/backend';

export const bedrockAgentStream = defineFunction({
  name: 'bedrock-agent-stream',
  entry: './handler.mjs',
  runtime: 20,
  timeoutSeconds: 300, // 5 minutes for streaming responses
  memoryMB: 1024,
  environment: {
    // This will be set in Amplify Console UI as the full ARN
    // e.g., arn:aws:bedrock-agentcore:us-east-1:123456789012:runtime/strands_agent_xyz
    AGENTCORE_QUALIFIER: 'DEFAULT'
  }
});
