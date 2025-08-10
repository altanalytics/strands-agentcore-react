#!/usr/bin/env python3
"""
Very basic Strands CLI chatbot - bare bones version
"""

import asyncio
from strands import Agent
from strands.models import BedrockModel
from strands_tools import shell, editor, python_repl

async def main():
    # Create a basic agent with minimal tools

    # Create a Bedrock model instance
    bedrock_model = BedrockModel(
        model_id="amazon.nova-micro-v1:0",
        max_tokens=2000,
        temperature=0.3,
        top_p=0.8,
    )
    agent = Agent(
        model=bedrock_model,
        system_prompt="You are a helpful assistant.",
        tools=[shell, editor, python_repl]
    )
    
    print("🤖 Strands CLI Chatbot - Type 'quit' to exit")
    print("-" * 50)
    
    while True:
        try:
            # Get user input
            user_input = input("\nYou: ").strip()
            
            # Check for exit
            if user_input.lower() in ['quit', 'exit', 'q']:
                print("Goodbye! 👋")
                break
                
            # Skip empty input
            if not user_input:
                continue
                
            # Get agent response
            print("\nBot: ", end="", flush=True)
            
            # Use async invoke with just the text prompt
            response = await agent.invoke_async(user_input)
            print(response)
            
        except KeyboardInterrupt:
            print("\n\nGoodbye! 👋")
            break
        except Exception as e:
            print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())