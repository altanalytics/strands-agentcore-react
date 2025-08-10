## Summary

This repository provides a starter template to help you build your own custom Agent Chat app with a React front end and an GenAI agent backend, built on [strands-agents](https://strandsagents.com/latest/) and running on [AWS AgentCore](https://aws.amazon.com/bedrock/agentcore/). It was forked from [Amplify V2 template](https://docs.amplify.aws/react/start/quickstart/). This application provides the bare bones of an Agent Chat App that can be viewed [here](placeholder).

There is a more enhanced version of this application that uses more Agent capabilities with NFL data. You can see the site [here]() and the code repo [here](). 

Make sure your aws cli is up to date.

## Create the infrastructure

1. Clone the repository to your git repository
2. Login to you aws account and navigate to Amplify
3. Create an application by linking to the cloned repository
4. In advanced settings, create two Environmen Variables:
    * name = AGENTCORE_RUNTIME_ARN, value = PLACEHOLDER (you will add this later)
    * name = NOTIFICATION_EMAIL, value = youremail@example.com
5. Create application

This is going to:

* Create a react app with authentication
    * You will get notifications when users sign-up
* Create a Lambda function to call your agent in agent core (not yet built)
* Add roles for creating your agent core app (done next)


## Build and deploy your AI Agent

We will not stand up a very basic chat agent that can be highly customized after deployment

First you need to go into Bedrock and enable the Nova Micro Model (it's cheap!)

Second, test that your agent works locally:

# Install uv if you need it
curl -LsSf https://astral.sh/uv/install.sh | sh

# Start the app (make sure your AWS Credentials are set up)
uv run uvicorn agent:app --host 0.0.0.0 --port 8080

# Test /invocations endpoint
curl -X POST http://localhost:8080/invocations \
  -H "Content-Type: application/json" \
  -d '{
    "input": {"prompt": "What is artificial intelligence?"}
  }'





# Setup docker and Build the image
docker buildx create --use
docker buildx build --platform linux/arm64 -t my-agent:arm64 --load .

# Test locally with credentials
docker run --platform linux/arm64 -p 8080:8080 \
  -e AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID" \
  -e AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY" \
  -e AWS_SESSION_TOKEN="$AWS_SESSION_TOKEN" \
  -e AWS_REGION="$AWS_REGION" \
  my-agent:arm64

# OR Use an env file - assuming it is in current directory
docker run --platform linux/arm64 -p 8080:8080 \
--env-file docker.env \
my-agent:arm64

# Rerun the curl command

# Now set up ecr (use your aws account id)
aws ecr create-repository --repository-name my-strands-agent --region us-east-1 --profile default
aws ecr get-login-password --region us-east-1 --profile genai | docker login --username AWS --password-stdin 1234567890.dkr.ecr.us-east-1.amazonaws.com
docker buildx build --platform linux/arm64 -t 1234567890.dkr.ecr.us-east-1.amazonaws.com/my-strands-agent:latest --push .


# Deploy the agent
uv run deploy_agent.py

# Get the ARN
1. Open the AWS UI Console
2. Navigate to Agent Runtime
3. Click the "strands_agent"
4. In the UI, you will see sample Python code with the ARN
5. Copy this arn into your .env file

# Invoke the agent to test
uv run invoke_agent.py