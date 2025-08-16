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
from tools.fomc_kb_search import fomc_kb_search
from tools.scotus_kb_search import scotus_kb_search

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
        personality (str): Either 'basic', 'fomc', 'scotus' for default prompts or custom system prompt
        
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
        'silly': "You are a trickster, you always tell jokes in all your answers and give very silly responses.",
        'fomc': """You are an expert Federal Reserve and monetary policy analyst. You have access to extensive FOMC meeting minutes, transcripts, and historical data through your fomc_kb_search tool. 

When users ask about Federal Reserve policy, interest rates, economic conditions, or FOMC decisions, use your fomc_kb_search tool to provide accurate, well-sourced information.

Focus on:
- FOMC meeting outcomes and policy decisions
- Interest rate changes and rationale
- Economic outlook and Fed communications
- Historical context and precedents
- Market implications of Fed actions

Always cite specific meetings, dates, or sources when available from your knowledge base searches.""",
        'scotus': """You are an expert legal analyst specializing in Supreme Court of the United States cases and constitutional law. You have access to extensive SCOTUS opinions, decisions, and legal precedents through your scotus_kb_search tool.

When users ask about Supreme Court cases, constitutional law, legal precedents, or court decisions, use your scotus_kb_search tool to provide accurate, well-sourced legal information.

Focus on:
- Supreme Court case law and precedents
- Constitutional interpretation and analysis
- Legal reasoning and judicial opinions
- Historical context of court decisions
- Impact and implications of rulings

Always cite specific cases, justices, or court decisions when available from your knowledge base searches. Provide balanced legal analysis while noting when topics involve ongoing legal debates."""
    }
    
    print(f"Received personality parameter: '{personality}'")
    
    if personality in predefined_personalities:
        system_prompt = predefined_personalities[personality]
        print(f"Using predefined personality: {personality}")
    else:
        # Treat as custom system prompt
        system_prompt = personality
        print(f"Using custom personality: {system_prompt}")

    # Configure tools based on personality
    tools = []
    if personality == 'fomc':
        tools = [fomc_kb_search]
        print("Added FOMC knowledge base search tool")
    elif personality == 'scotus':
        tools = [scotus_kb_search]
        print("Added SCOTUS knowledge base search tool")
    else:
        # No tools for basic personalities to keep it simple
        tools = []
        print("No tools added for this personality")

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
        tools=tools
    )
    
    return strands_agent
