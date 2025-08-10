// amplify/backend.ts
import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { bedrockAgentStream } from './functions/bedrock-agent-stream/resource';
import { Duration } from 'aws-cdk-lib';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { FunctionUrlAuthType, HttpMethod, InvokeMode } from 'aws-cdk-lib/aws-lambda';
import { createBedrockAgentCoreRole } from './roles/bedrock-agent-core-role';

const backend = defineBackend({
  auth,
  bedrockAgentStream,
});

// Create the Bedrock Agent Core role
const bedrockAgentCoreRole = createBedrockAgentCoreRole(backend.createStack('BedrockAgentCoreStack'));

// Require the runtime ARN to be set in env
const agentRuntimeArn = process.env.AGENTCORE_RUNTIME_ARN;
if (!agentRuntimeArn) {
  throw new Error('AGENTCORE_RUNTIME_ARN is not set (Amplify Console → Backend environment variables).');
}


// Only attach the permission if we actually have a real ARN
if (agentRuntimeArn && agentRuntimeArn.startsWith('arn:aws:bedrock-agentcore:')) {
  backend.bedrockAgentStream.resources.lambda.addToRolePolicy(
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['bedrock-agentcore:InvokeAgentRuntime', 'bedrock-agentcore:GetAgentRuntime'],
      resources: [agentRuntimeArn],
    })
  );
} else {
  // No policy = no access (safe). We’ll add it after the runtime is created.
  console.warn('Skipping AgentCore IAM grant; AGENTCORE_RUNTIME_ARN not set or placeholder.');
}


// Function URL with streaming enabled (IAM-protected)
// Using wildcard CORS for first deploy; tighten later and set allowCredentials:true.
const functionUrl = backend.bedrockAgentStream.resources.lambda.addFunctionUrl({
  authType: FunctionUrlAuthType.AWS_IAM,
  invokeMode: InvokeMode.RESPONSE_STREAM,
  cors: {
    allowedOrigins: ['*'],
    allowCredentials: false,
    allowedMethods: [HttpMethod.POST],
    allowedHeaders: ['content-type', 'authorization', 'x-amz-date', 'x-amz-security-token'],
    maxAge: Duration.seconds(300),
  },
});

// Let Cognito **authenticated** users invoke the Function URL
backend.auth.resources.authenticatedUserIamRole.addToPrincipalPolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ['lambda:InvokeFunctionUrl'],
    resources: [backend.bedrockAgentStream.resources.lambda.functionArn],
    conditions: { StringEquals: { 'lambda:FunctionUrlAuthType': 'AWS_IAM' } },
  })
);

// (Optional) Allow direct Invoke (SDK path) if you ever use it
backend.auth.resources.authenticatedUserIamRole.addToPrincipalPolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ['lambda:InvokeFunction'],
    resources: [backend.bedrockAgentStream.resources.lambda.functionArn],
  })
);

// Output URL + ARN for your frontend (available in amplify_outputs.json)
backend.addOutput({
  custom: {
    bedrockAgentStreamUrl: functionUrl.url,
    agentCoreRuntimeArn: agentRuntimeArn,
    bedrockAgentCoreRoleArn: bedrockAgentCoreRole.roleArn,
  },
});
