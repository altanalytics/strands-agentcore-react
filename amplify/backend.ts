import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { bedrockAgentStream } from './functions/bedrock-agent-stream/resource';
import { PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';
import { createBedrockAgentCoreRole } from './roles/bedrock-agent-core-role';

const backend = defineBackend({
  auth,
  bedrockAgentStream,
});

// Create the Bedrock Agent Core role
const bedrockAgentCoreRole = createBedrockAgentCoreRole(backend.createStack('BedrockAgentCoreStack'));

// Add IAM permissions and Function URL using the resources property
backend.bedrockAgentStream.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: [
      'bedrock-agentcore:InvokeAgentRuntime',
      'bedrock-agentcore:GetAgentRuntime'
    ],
    resources: [
      process.env.AGENTCORE_RUNTIME_ARN || '*',
      `${process.env.AGENTCORE_RUNTIME_ARN || '*'}/*`
    ]
  })
);

// Add Function URL
backend.bedrockAgentStream.resources.lambda.addFunctionUrl({
  authType: 'AWS_IAM',
  cors: {
    allowCredentials: true,
    allowHeaders: ['content-type', 'authorization', 'x-amz-date', 'x-amz-security-token'],
    allowMethods: ['POST', 'OPTIONS'],
    allowOrigins: ['*'],
    maxAge: 300
  }
});

// Grant authenticated users permission to invoke the Lambda function URL
backend.auth.resources.authenticatedUserIamRole.addToPrincipalPolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ['lambda:InvokeFunctionUrl'],
    resources: [backend.bedrockAgentStream.resources.lambda.functionArn],
  })
);

// Also allow authenticated users to invoke the function directly (if needed)
backend.auth.resources.authenticatedUserIamRole.addToPrincipalPolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ['lambda:InvokeFunction'],
    resources: [backend.bedrockAgentStream.resources.lambda.functionArn],
  })
);

// Export the function URL for the frontend to use
backend.addOutput({
  custom: {
    bedrockAgentStreamUrl: backend.bedrockAgentStream.resources.lambda.functionUrl,
    bedrockAgentCoreRoleArn: bedrockAgentCoreRole.roleArn,
  },
});
