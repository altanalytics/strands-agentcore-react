// amplify/functions/user-signup-notification/handler.mjs
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const sns = new SNSClient({ region: process.env.AWS_REGION });

export const handler = async (event) => {
  console.log("User signup event:", JSON.stringify(event, null, 2));

  try {
    // PostConfirmation event shape
    const attrs = event?.request?.userAttributes ?? {};
    const email = attrs.email;
    const name = attrs.name ?? "Not provided";
    // Optional: const username = event?.userName;

    if (process.env.SNS_TOPIC_ARN) {
      const subject = "🚨 New User Signup Alert";
      const body = [
        "New user has signed up!",
        "",
        // Optional: `Username: ${username}`,
        `Email: ${email ?? "No email"}`,
        `Name: ${name}`,
        `Timestamp: ${new Date().toISOString()}`
      ].join("\n");

      await sns.send(new PublishCommand({
        TopicArn: process.env.SNS_TOPIC_ARN,
        Subject: subject,
        Message: body,
      }));

      console.log("User signup notification sent.");
    } else {
      console.warn("SNS_TOPIC_ARN not set; skipping notification.");
    }
  } catch (err) {
    console.error("Error sending signup notification:", err);
    // Don't block sign-up on notification failure
  }

  return event; // required by Cognito triggers
};
