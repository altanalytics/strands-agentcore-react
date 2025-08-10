import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { bedrockAgentStream } from './functions/bedrock-agent-stream/resource';
import { userSignupNotification } from './functions/user-signup-notification/resource';
import { PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { EmailSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';
import { Duration } from 'aws-cdk-lib';
import { FunctionUrlAuthType, HttpMethod } from 'aws-cdk-lib/aws-lambda';
import { createBedrockAgentCoreRole } from './roles/bedrock-agent-core-role';

const backend = defineBackend({
  auth,
  bedrockAgentStream,
  userSignupNotification,
});

// Create SNS topic for user signup notifications
const signupNotificationTopic = new Topic(backend.createStack('NotificationStack'), 'UserSignupTopic', {
  displayName: 'User Signup Notifications',
});

// Subscribe your email to the topic (replace with your email)
const notificationEmail = process.env.NOTIFICATION_EMAIL || 'your-email@example.com';
signupNotificationTopic.addSubscription(new EmailSubscription(notificationEmail));

// Add SNS topic ARN to the notification function environment
backend.userSignupNotification.addEnvironment('SNS_TOPIC_ARN', signupNotificationTopic.topicArn);

// Grant the notification function permission to publish to SNS
backend.userSignupNotification.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ['sns:Publish'],
    resources: [signupNotificationTopic.topicArn],
  })
);

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
const functionUrl = backend.bedrockAgentStream.resources.lambda.addFunctionUrl({
  authType: FunctionUrlAuthType.AWS_IAM,
  cors: {
    allowCredentials: true,
    allowedHeaders: ['content-type', 'authorization', 'x-amz-date', 'x-amz-security-token'],
    allowedMethods: [HttpMethod.POST, HttpMethod.OPTIONS],
    allowedOrigins: ['*'],
    maxAge: Duration.seconds(300)
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
    bedrockAgentStreamUrl: functionUrl.url,
    bedrockAgentCoreRoleArn: bedrockAgentCoreRole.roleArn,
    signupNotificationTopicArn: signupNotificationTopic.topicArn,
  },
});
