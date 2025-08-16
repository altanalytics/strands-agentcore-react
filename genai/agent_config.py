"""
Shared agent configuration for the GenAI application.
This module provides a centralized way to configure and create agents
to avoid code duplication between CLI and other components.
"""

import os
import boto3
from strands import Agent
from strands.models import BedrockModel
from strands.agent.conversation_manager import SlidingWindowConversationManager
from strands.session.s3_session_manager import S3SessionManager
from strands_tools import shell, editor, python_repl, calculator

def create_strands_agent(model = 'us.amazon.nova-micro-v1:0',
                         personality = 'basic',
                         session_id = None,
                         s3_bucket = None,
                         s3_prefix = None):
    """
    Create and return a configured Strands agent instance.
    
    Model Examples:
    - us.amazon.nova-micro-v1:0
    - us.amazon.nova-premier-v1:0
    - us.amazon.nova-pro-v1:0
    - us.anthropic.claude-sonnet-4-20250514-v1:0
    
    Args:
        model (str): The Bedrock model ID to use
        personality (str): Either 'basic' for default prompt or custom system prompt
        
    Returns:
        Agent: Configured agent ready for use
    """
    
    # Check if this is an Anthropic model that will use thinking
    is_anthropic_model = model.startswith('us.anthropic.') or model.startswith('anthropic.')
    
    # Configure the Bedrock model with Anthropic thinking capabilities
    bedrock_model_config = {
        "inference_profile": model,
        "max_tokens": 2000,
       # "top_p": 0.8,
    }
    
    # Add thinking configuration for Anthropic models
    if is_anthropic_model:
        bedrock_model_config["additional_request_fields"] = {
            "anthropic_beta": ["interleaved-thinking-2025-05-14"],
            "thinking": {
                "type": "enabled",
                "budget_tokens": 1024  # Smaller budget for this template
            }
        }
        # Anthropic requires temperature=1 when thinking is enabled
        bedrock_model_config["temperature"] = 1
    else:
        # Use custom temperature for non-Anthropic models
        bedrock_model_config["temperature"] = 0.3
    
    bedrock_model = BedrockModel(**bedrock_model_config)

    # Configure conversation management for production
    conversation_manager = SlidingWindowConversationManager(
        window_size=10,  # Limit history size
    )

    # Set personality based on input with predefined options
    predefined_personalities = {
        'basic': "You are a helpful assistant.",
        'creative': "You are a creative and imaginative assistant who thinks outside the box.",
        'analytical': "You are a logical and analytical assistant who provides detailed, structured responses.",
        'friendly': "You are a warm, friendly, and conversational assistant who uses a casual tone.",
        'silly': "You are a trickster, you always tell jokes in all your answers and give very silly responses."
    }
    
    print(f"Received personality parameter: '{personality}'")
    
    if personality in predefined_personalities:
        system_prompt = predefined_personalities[personality]
        print(f"Using predefined personality: {system_prompt}")
    else:
        # Treat as custom system prompt
        system_prompt = personality
        print(f"Using custom personality: {system_prompt}")

    # Create session manager based on whether S3 parameters are provided
    session_manager = None
    if session_id and s3_bucket and s3_prefix:
        print(f"Creating S3SessionManager - Session: {session_id}, Bucket: {s3_bucket}, Prefix: {s3_prefix}")
        
        # Create boto3 session for better credential handling
        boto_session = boto3.Session(region_name="us-east-1")
        
        session_manager = S3SessionManager(
            session_id=session_id,
            bucket=s3_bucket,
            prefix=s3_prefix,
            boto_session=boto_session,
            region_name="us-east-1"
        )
    else:
        print("Using default SlidingWindowConversationManager (no S3 session persistence)")

    # Create and return the agent
    strands_agent = Agent(
        model=bedrock_model,
        system_prompt=system_prompt,
        conversation_manager=conversation_manager,
        session_manager=session_manager,  # Add session manager
        # Adding tools is what triggers "Thinking..." in the UI
        #tools=[calculator]
    )
    
    return strands_agent


