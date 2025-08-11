#!/usr/bin/env python3
"""
Very basic Strands CLI chatbot - bare bones version
"""

import asyncio
from agent_config import create_strands_agent

async def main():
    # Create agent using shared configuration
    agent = create_strands_agent()
    
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