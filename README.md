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

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/home) in us-east-1
2. Click "Deploy an App" or "Create New App" if you already have apps
3. Select your remote git repository to link Amplify to git
4. Choose the branch you want to deploy (e.g., `main`)
5. Click Next and then in Advanced Settings, add two environment variables:
  - `AGENTCORE_RUNTIME_ARN` = `arn:aws:bedrock-agentcore:us-east-1:123456789012:runtime/strands_agent_xyz` 
    * You will get the real one after step 5, but use this placeholder for now before deployment
  - `NOTIFICATION_EMAIL` = `your-email@example.com`
6. Once you deploy your application
7. You can login, but your Agent will not work
8. Activate the Amazon Bedrock Nova models (Micro, Pro, Premium) in your AWS account (region us-east-1)
9. *You must also enable the Claude Sonnet 4 model - even though we are invoking Nova-Micro - Strands needs the claude model to be enabled to work 

*Pay close attention to the environment variables - these have to be set before you deploy*

### **2. Test Agent Locally**
```bash

cd strands-agentcore-react/genai

# Install uv if needed
curl -LsSf https://astral.sh/uv/install.sh | sh

# Test locally 
export AWS_PROFILE=yourprofile
uv run uvicorn agent:app --host 0.0.0.0 --port 8080

# Test endpoint
curl -X POST http://localhost:8080/invocations \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What is artificial intelligence?"}'
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

# OR Test with credentials file based on a profile
aws configure export-credentials --profile YOUR_PROFILE_NAME --format env-no-export > docker.env
docker run --platform linux/arm64 -p 8080:8080 \
  --env-file docker.env my-agent:arm64

# Use same test command as above but with input paramters
curl -X POST http://localhost:8080/invocations \
  -H "Content-Type: application/json" \
  -d '{
      "prompt": "Tell me a story",
      "model": "us.amazon.nova-micro-v1:0",
      "personality": "You are a storyteller who speaks in the style of Shakespeare."
  }'
```

### **4. Build and Push Docker Image**
```bash

# Set your AWS account ID as a variable
AWS_PROFILE=default
AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text --profile $AWS_PROFILE)

# Create ECR repository - only run this one time
aws ecr create-repository --repository-name my-strands-agent --region us-east-1 --profile $AWS_PROFILE


# Login to ECR using the variable
aws ecr get-login-password --region us-east-1 --profile $AWS_PROFILE | docker login --username AWS --password-stdin $AWS_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com 

# Push to ECR using the variable
docker buildx build --platform linux/arm64 -t $AWS_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/my-strands-agent:latest --push .
```

### **5. Deploy Agent Runtime**
```bash
# Deploy to Bedrock Agent Core
# *** MAKE SURE THE AMPLIFY APP HAS BEEN DEPLOYED AND THE bedrock-agent-core-role OR THIS WILL FAIL
uv run agent_deploy.py

# You can update your existing agent (don't forget to rebuild and push your docker container)
uv run agent_update.py

```

The command above will output "Agent Runtime ARN". You will need this value for the next set of steps. 

### **6. Update Environment Variables**

First update the environment variables in Amplify

1. Go into the AWS UI Console
2. Go to Amplify > App > Hosting > Environment Variables
3. Update the AGENTCORE_RUNTIME_ARN (set up above) with the new runtime

Next configure env variables lovally.  
1. Open the .env.example file in the top folder
2. Update the ARN with the new ARN and save as .env (not as .env.example!!)


### **7. Test Agent**
```bash
# Test your deployed agent
uv run agent_invoke.py
```

### **7. Deploy**

Make whatever changes are needed and then push to your git repo for an automated deployment. 

## What You Get

- ✅ **Full-stack chat app** with authentication
- ✅ **Streaming AI responses** from your custom agent  
- ✅ **Email notifications** for new user signups
- ✅ **Production-ready infrastructure** on AWS
- ✅ **Easy customization** - modify the agent code in `genai/`
- ✅ **Knowledge Base integration** with S3 vectors for domain-specific expertise


Your chat app will be available at the Amplify-generated URL with full authentication and AI agent integration! 🚀


### **BONUS: Test your agent in the CLI**
This is good for prototyping and building out your app and interfacing through the CLI rather than launching the app and using the curl command. 

Both the `agent_cli.py` and `agent.py` reference the same `agent_config.py` file, which is where the agent is built. 

```bash
uv run agent_cli.py
```

## Knowledge Base Integration (Demonstration)

This template demonstrates how to integrate Amazon Bedrock Knowledge Bases with your AI agent to provide domain-specific expertise and data retrieval capabilities.

> **⚠️ Important Note**: The knowledge bases referenced in this template are for **demonstration purposes only**. Other users will not have access to these specific knowledge bases as they are private resources. However, you can use this structure as a template to integrate your own knowledge bases.

### **Demo Knowledge Base Personalities**

The agent includes two specialized personalities that showcase knowledge base integration patterns:

- **`fomc`** - Federal Reserve and monetary policy expert (Demo)
  - Shows integration with FOMC meeting minutes and transcripts (1993-2019)
  - Demonstrates insights on interest rate decisions, economic outlook, and Fed communications
  - Knowledge Base ID: `P7J0PZOXSE` (hardcoded in tool - **not accessible to other users**)

- **`scotus`** - Supreme Court legal analyst (Demo)
  - Shows integration with Supreme Court opinions and legal precedents
  - Demonstrates constitutional law analysis and case law research
  - Knowledge Base ID: `XPXXQUL4A6` (hardcoded in tool - **not accessible to other users**)

### **How the Integration Structure Works**

1. **Structured Tool Approach**: Each knowledge base has its own dedicated search tool (`fomc_kb_search`, `scotus_kb_search`) with hardcoded KB IDs for reliability
2. **Personality-Based Configuration**: The agent automatically gets the appropriate knowledge base tool based on the selected personality
3. **No Loose Coupling**: Knowledge base IDs are baked into the tool code, eliminating the risk of using wrong knowledge bases

### **Data Collection Examples**

The demo knowledge bases were populated using data collection scripts found in `/genai/data_pulls/`. See the [data_pulls README](/genai/data_pulls/README.md) for detailed instructions on data collection and knowledge base setup.

Example data sources:
- **FOMC Data**: Scraped from Federal Reserve website using `fomc_pull.R`
- **SCOTUS Data**: Collected from CourtListener API using `scotus_pull.R`

### **Creating Your Own Knowledge Base Integration**

To integrate your own knowledge bases:

1. **Create your knowledge base** in Amazon Bedrock console and note the KB ID
2. **Create a new tool** in `/genai/tools/` (e.g., `your_kb_search.py`) with your KB ID
3. **Add the new personality** to `predefined_personalities` in `agent_config.py`
4. **Configure the tool assignment** in the personality logic

For detailed guidance on setting up knowledge bases and data collection, see the documentation in the `/genai/data_pulls/` folder.

### **Testing Your Knowledge Base Integration**

```bash
# Test with your own personality
curl -X POST http://localhost:8080/invocations \
  -H "Content-Type: application/json" \
  -d '{
      "prompt": "Your question here",
      "personality": "your_custom_personality"
  }'
```

This structure provides a scalable, reliable foundation for building knowledge-enhanced AI agents with your own data sources.