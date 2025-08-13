"""
Shared agent configuration for the GenAI application.
This module provides a centralized way to configure and create agents
to avoid code duplication between CLI and other components.
"""

from strands import Agent
from strands.models import BedrockModel
from strands.agent.conversation_manager import SlidingWindowConversationManager
from strands_tools import shell, editor, python_repl, calculator

def create_strands_agent(model = 'us.amazon.nova-micro-v1:0',
                         personality = 'basic'):
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
    
    # Configure the Bedrock model
    bedrock_model = BedrockModel(
        inference_profile=model,
        max_tokens=2000,
        temperature=0.3,
        top_p=0.8,
    )

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

    # Create and return the agent
    strands_agent = Agent(
        model=bedrock_model,
        system_prompt=system_prompt,
        conversation_manager=conversation_manager,
        # Adding tools is what triggers "Thinking..." in the UI
        #tools=[calculator]
    )
    
    return strands_agent


