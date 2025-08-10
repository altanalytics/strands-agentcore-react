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

// Grant authenticated users permission to invoke the Lambda function URL
backend.auth.resources.authenticatedUserIamRole.addToPrincipalPolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ['lambda:InvokeFunctionUrl'],
    resources: [bedrockAgentStream.resources.lambda.functionArn],
  })
);

// Also allow authenticated users to invoke the function directly (if needed)
backend.auth.resources.authenticatedUserIamRole.addToPrincipalPolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ['lambda:InvokeFunction'],
    resources: [bedrockAgentStream.resources.lambda.functionArn],
  })
);

// Export the function URL for the frontend to use
backend.addOutput({
  custom: {
    bedrockAgentStreamUrl: bedrockAgentStream.resources.url,
    bedrockAgentCoreRoleArn: bedrockAgentCoreRole.roleArn,
  },
});
