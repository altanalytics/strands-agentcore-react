// handler.mjs
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const sns = new SNSClient({ region: process.env.AWS_REGION });

export const handler = async (event) => {
  console.log('User signup event:', JSON.stringify(event, null, 2));
  
  try {
    const { userAttributes, userName } = event.request;
    
    const message = {
      subject: '🚨 New User Signup Alert',
      body: `
New user has signed up!

Username: ${userName}
Email: ${userAttributes.email}
Name: ${userAttributes.name || 'Not provided'}
Timestamp: ${new Date().toISOString()}
      `.trim()
    };

    // Send SNS notification
    if (process.env.SNS_TOPIC_ARN) {
      await sns.send(new PublishCommand({
        TopicArn: process.env.SNS_TOPIC_ARN,
        Subject: message.subject,
        Message: message.body,
      }));
    }

    // Log for CloudWatch
    console.log('User signup notification sent:', message);
    
  } catch (error) {
    console.error('Error sending signup notification:', error);
    // Don't fail the signup process if notification fails
  }

  // Return the event unchanged (required for Cognito triggers)
  return event;
};
