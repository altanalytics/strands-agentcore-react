import { defineFunction } from '@aws-amplify/backend';

export const bedrockAgentStream = defineFunction({
  name: 'bedrock-agent-stream',
  entry: './handler.mjs',
  runtime: 22,
  timeoutSeconds: 300, // 5 minutes for streaming responses
  memoryMB: 1024,
  environment: {
    // This will be set in Amplify Console UI as the full ARN
    // e.g., arn:aws:bedrock-agentcore:us-east-1:123456789012:runtime/strands_agent_xyz
    AGENTCORE_QUALIFIER: 'DEFAULT'
  }
});

// Add IAM permissions for Bedrock Agent Core
bedrockAgentStream.addToRolePolicy({
  Effect: 'Allow',
  Action: [
    'bedrock-agentcore:InvokeAgentRuntime',
    'bedrock-agentcore:GetAgentRuntime'
  ],
  Resource: [
    process.env.AGENTCORE_RUNTIME_ARN,
    `${process.env.AGENTCORE_RUNTIME_ARN}/*`
  ]
});

// Add Function URL with AWS_IAM authentication
bedrockAgentStream.addFunctionUrl({
  authType: 'AWS_IAM',
  cors: {
    allowCredentials: true,
    allowHeaders: ['content-type', 'authorization', 'x-amz-date', 'x-amz-security-token'],
    allowMethods: ['POST', 'OPTIONS'],
    allowOrigins: ['*'], // Will be restricted later for production
    maxAge: 300
  }
});
