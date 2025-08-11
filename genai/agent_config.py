"""
Shared agent configuration for the GenAI application.
This module provides a centralized way to configure and create agents
to avoid code duplication between CLI and other components.
"""

from strands import Agent
from strands.models import BedrockModel
from strands.agent.conversation_manager import SlidingWindowConversationManager
from strands_tools import shell, editor, python_repl, calculator

def create_strands_agent():
    """
    Create and return a configured Strands agent instance.
    us.amazon.nova-micro-v1:0
    us.amazon.nova-premier-v1:0
    us.amazon.nova-pro-v1:0
    us.anthropic.claude-sonnet-4-20250514-v1:0
    Returns:
        Agent: Configured agent ready for use
    """
    # Configure the Bedrock model
    bedrock_model = BedrockModel(
        model_id="us.amazon.nova-pro-v1:0",
        max_tokens=2000,
        temperature=0.3,
        top_p=0.8,
    )

    # Configure conversation management for production
    conversation_manager = SlidingWindowConversationManager(
        window_size=10,  # Limit history size
    )

    # Create and return the agent
    strands_agent = Agent(
        model=bedrock_model,
        system_prompt="You are a helpful assistant.",
        conversation_manager=conversation_manager,
        tools=[calculator]
    )
    
    return strands_agent


