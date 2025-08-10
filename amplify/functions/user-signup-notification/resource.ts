import { defineFunction } from '@aws-amplify/backend';

export const userSignupNotification = defineFunction({
  name: 'user-signup-notification',
  entry: './handler.js',
  runtime: 20,
  timeoutSeconds: 30,
  environment: {
    // SNS_TOPIC_ARN will be set when we create the topic
  }
});
