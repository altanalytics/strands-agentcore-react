import boto3
import os
import secrets
import string
import json
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
parent_dir = Path(__file__).parent.parent
env_path = parent_dir / '.env'
load_dotenv(env_path)



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
session = boto3.Session()
client = session.client('bedrock-agentcore', region_name="us-east-1")

# Test prompt
payload = json.dumps({
    "input": {"prompt": "Who won the superbowl in 1992?"},
})

try:
    # Invoke the agent runtime
    print(f"🤖 Invoking agent with prompt: '{payload}'")
    print(f"📋 Agent Runtime ARN: {agent_runtime_arn}")
    print(f"🔑 Session ID: {session_id}")
    print()
    
    response = client.invoke_agent_runtime(
        agentRuntimeArn=agent_runtime_arn,
        runtimeSessionId=session_id,
        payload=payload,
        qualifier='DEFAULT'
    )
    
    print("✅ Agent invoked successfully!")
    print("📤 Response:")
    
    # Handle streaming response
    stream = response['response']
    for chunk in stream.iter_lines():
        if chunk:
            print(chunk.decode('utf-8'), end='', flush=True)
    
    print("\n\n🎉 Invocation complete!")
    
except Exception as e:
    print(f"❌ Error invoking agent: {e}")
    print("Make sure:")
    print("1. AGENTCORE_RUNTIME_ARN is set correctly in .env")
    print("2. Your agent runtime is in ACTIVE status")
    print("3. You have the correct permissions")