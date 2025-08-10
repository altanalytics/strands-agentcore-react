import boto3
import os
import secrets
import string
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def generate_session_id():
    """Generate exactly 33 character random session ID"""
    characters = string.ascii_letters + string.digits  # a-z, A-Z, 0-9
    return ''.join(secrets.choice(characters) for _ in range(33))

# Get environment variables
agent_runtime_arn = os.getenv('AGENTCORE_RUNTIME_ARN')
if not agent_runtime_arn:
    raise ValueError("AGENTCORE_RUNTIME_ARN not found in environment variables")

# Generate session ID
session_id = generate_session_id()
print(f"Generated Session ID: {session_id}")

# Create boto3 session
session = boto3.Session(profile_name='wsand')
client = session.client('bedrock-agentcore', region_name="us-east-1")

# Test prompt
prompt = "What is artificial intelligence?"

try:
    # Invoke the agent runtime
    print(f"🤖 Invoking agent with prompt: '{prompt}'")
    print(f"📋 Agent Runtime ARN: {agent_runtime_arn}")
    print(f"🔑 Session ID: {session_id}")
    print()
    
    response = client.invoke_agent_runtime(
        agentRuntimeArn=agent_runtime_arn,
        sessionId=session_id,
        inputText=prompt,
        qualifier='DEFAULT'
    )
    
    print("✅ Agent invoked successfully!")
    print("📤 Response:")
    
    # Handle streaming response
    if 'completion' in response:
        for chunk in response['completion']:
            if 'chunk' in chunk and 'bytes' in chunk['chunk']:
                text = chunk['chunk']['bytes'].decode('utf-8')
                print(text, end='', flush=True)
    
    print("\n\n🎉 Invocation complete!")
    
except Exception as e:
    print(f"❌ Error invoking agent: {e}")
    print("Make sure:")
    print("1. AGENTCORE_RUNTIME_ARN is set correctly in .env")
    print("2. Your agent runtime is in ACTIVE status")
    print("3. You have the correct permissions")