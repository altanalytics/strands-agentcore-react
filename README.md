# Strands Agent Core React Chat App

A complete starter template for building a custom Agent Chat application with React frontend and GenAI agent backend, built on [strands-agents](https://strandsagents.com/latest/) and running on [Amazon Bedrock AgentCore](https://aws.amazon.com/bedrock/agentcore/).

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

### **1a. Deploy Infrastructure (option 1) **
```bash
git clone 
cd strands-agentcore-react
npm install
AWS_PROFILE=your-profile npx ampx sandbox
```

### OR

### **1b. Deploy Infrastructure (option 2)**

### **2. Configure Environment Variables**
In **Amplify Console** → Environment Variables:
- `AGENTCORE_RUNTIME_ARN` = `your-agent-runtime-arn` (add after step 4)
- `NOTIFICATION_EMAIL` = `your-email@example.com`


## Build and Deploy Your AI Agent

### **1. Enable Bedrock Model**
Go to AWS Bedrock Console and enable **Nova Micro Model**.

### **2. Test Agent Locally**
```bash
cd genai

# Install uv if needed
curl -LsSf https://astral.sh/uv/install.sh | sh

# Test locally
uv run uvicorn agent:app --host 0.0.0.0 --port 8080

# Test endpoint
curl -X POST http://localhost:8080/invocations \
  -H "Content-Type: application/json" \
  -d '{"input": {"prompt": "What is artificial intelligence?"}}'
```

### **3. Build and Push Docker Image**
```bash
# Setup Docker buildx
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

# Create ECR repository (replace account ID)
aws ecr create-repository --repository-name my-strands-agent --region us-east-1

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com

# Push to ECR
docker buildx build --platform linux/arm64 -t YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/my-strands-agent:latest --push .
```

### **4. Deploy Agent Runtime**
```bash
# Deploy to Bedrock Agent Core
uv run deploy_agent.py

```
### **5. Update Environment Variables**
1. Go into the AWS UI Console
2. Navigate to Amazon Bedrock AgentCore
3. Naviagete to Agent Runtime > strands_agent
4. Pull the arn
5. Add a .env file in the top of your project folder and add:

```
# Agentcore
AGENTCORE_RUNTIME_ARN=arn:aws:bedrock-agentcore:us-east-1:1234567890:runtime/strands_agent-SUFFIX

# Notification Configuration
NOTIFICATION_EMAIL=yourname@example.com
```

### **6. Test Agent**
```bash
# Test your deployed agent
uv run invoke_agent.py
```

### **6. Update Frontend**
Add the agent runtime ARN to Amplify Console environment variables and redeploy.

## What You Get

- ✅ **Full-stack chat app** with authentication
- ✅ **Streaming AI responses** from your custom agent  
- ✅ **Email notifications** for new user signups
- ✅ **Production-ready infrastructure** on AWS
- ✅ **Easy customization** - modify the agent code in `genai/`


Your chat app will be available at the Amplify-generated URL with full authentication and AI agent integration! 🚀