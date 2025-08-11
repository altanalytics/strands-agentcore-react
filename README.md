# Strands Agent Core React Chat App

A complete starter template for building a custom AI Agent Chat application with React frontend and GenAI agent backend, built on [strands-agents](https://strandsagents.com/latest/) and running on [Amazon Bedrock AgentCore](https://aws.amazon.com/bedrock/agentcore/).

## What Gets Created

### **Frontend Infrastructure**
- 🔐 **Cognito Authentication** - Email/password login with full name
- 💬 **React Chat App** - Modern UI with streaming responses
- 📧 **SNS Notifications** - Email alerts when users sign up

### **Backend Infrastructure**  
- ⚡ **Lambda Function** - Streams responses from Bedrock Agent Core
- 🔑 **IAM Role** - `bedrock-agent-core-role` for your Python agent
- 🌐 **Function URL** - Direct Lambda access with AWS IAM auth
- 📊 **CloudWatch Logs** - Full logging and monitoring

## Quick Start


### **Step 1. Deploy Infrastructure Through Amplify UI**

This is a fork from the Amplify quickstart guide that can be found [here](https://docs.amplify.aws). It is recommended that you review the documentation if you are not familiar with Amplify. 

1. **Clone the repository**

```bash
git clone https://github.com/altanalytics/strands-agentcore-react.git
cd strands-agentcore-react
# Push to your remote repository
```

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/home)
2. Click "Deploy an App" or "Create New App" if you already have apps
3. Select your remote git repository to link Amplify to git
4. Choose the branch you want to deploy (e.g., `main`)
5. Click Next and then in Advanced Settings, add two environment variables:
  - `AGENTCORE_RUNTIME_ARN` = `arn:aws:bedrock-agentcore:us-east-1:123456789012:runtime/strands_agent_xyz` 
    * You will get the real one after step 4, but use this placeholder for now before deployment
  - `NOTIFICATION_EMAIL` = `your-email@example.com`
  6. Once you deploy your application
  7. You can login, but your Agent will not work


## Step 2. Build and Deploy Your AI Agent

### **1. Enable Bedrock Model**
Go to AWS Bedrock Console and enable **Nova Micro Model**.

### **2. Test Agent Locally**
```bash

cd strands-agentcore-react/genai

# Install uv if needed
curl -LsSf https://astral.sh/uv/install.sh | sh

# Test locally 
export AWS_PROFILE = yourprofile
uv run uvicorn agent:app --host 0.0.0.0 --port 8080

# Test endpoint
curl -X POST http://localhost:8080/invocations \
  -H "Content-Type: application/json" \
  -d '{"input": {"prompt": "What is artificial intelligence?"}}'
```

### **3. Build and Test Docker Image**
```bash
# Setup Docker buildx (make sure Docker desktop is running)
docker buildx create --use

# Build image
docker buildx build --platform linux/arm64 -t my-agent:arm64 --load .

# Test locally with credentials
docker run --platform linux/arm64 -p 8080:8080 \
  -e AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID" \
  -e AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY" \
  -e AWS_SESSION_TOKEN="$AWS_SESSION_TOKEN" \
  -e AWS_REGION="$AWS_REGION" \
  my-agent:arm64

# Test with credentials file
docker run --platform linux/arm64 -p 8080:8080 \
  --env-file docker.env my-agent:arm64

# Use same test command as above
curl -X POST http://localhost:8080/invocations \
  -H "Content-Type: application/json" \
  -d '{"input": {"prompt": "What is artificial intelligence?"}}'
```

### **4. Build and Push Docker Image**
```bash

# Create ECR repository (replace account ID)
aws ecr create-repository --repository-name my-strands-agent --region us-east-1 --profile default

# Set your AWS account ID as a variable
AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text --profile default)

# Login to ECR using the variable
aws ecr get-login-password --region us-east-1 --profile default | docker login --username AWS --password-stdin $AWS_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com 

# Push to ECR using the variable
docker buildx build --platform linux/arm64 -t $AWS_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/my-strands-agent:latest --push .
```

### **5. Deploy Agent Runtime**
```bash
# Deploy to Bedrock Agent Core
uv run deploy_agent.py

```

The command above will output "Agent Runtime ARN". You will need this value for the next set of steps. 

### **5. Update Environment Variables**

First update the environment variables in Amplify

1. Go into the AWS UI Console
2. Go to Amplify > App > Hosting > Environment Variables
3. Update the AGENTCORE_RUNTIME_ARN (set up above) with the new runtime

Next configure env variables lovally.  
1. Open the .env.example file in the top folder
2. Update the ARN with the new ARN and save


### **6. Test Agent**
```bash
# Test your deployed agent
uv run invoke_agent.py
```

### **7. Deploy**

Make whatever changes are needed and then push to your git repo for an automated deployment. 

## What You Get

- ✅ **Full-stack chat app** with authentication
- ✅ **Streaming AI responses** from your custom agent  
- ✅ **Email notifications** for new user signups
- ✅ **Production-ready infrastructure** on AWS
- ✅ **Easy customization** - modify the agent code in `genai/`


Your chat app will be available at the Amplify-generated URL with full authentication and AI agent integration! 🚀


### **BONUS. Run a working Agent in the CLI**
This is good for prototyping and building out your app and interfacing through the CLI rather than the app. 
```bash
uv run cli_agent.py
```