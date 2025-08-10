// handler.js
const AWS = require('aws-sdk');

const sns = new AWS.SNS({ region: process.env.AWS_REGION });

exports.handler = async (event) => {
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
      await sns.publish({
        TopicArn: process.env.SNS_TOPIC_ARN,
        Subject: message.subject,
        Message: message.body,
      }).promise();
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
