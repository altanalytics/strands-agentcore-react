from bedrock_agentcore import BedrockAgentCoreApp
from agent_config import create_strands_agent

app = BedrockAgentCoreApp()
agent = create_strands_agent()

@app.entrypoint
async def agent_invocation(payload):
    user_message = payload.get("prompt", "No prompt found in input...")
    # tell UI to reset
    yield {"type": "start"}

    try:
        async for event in agent.stream_async(user_message):
            txt = event.get("data")
            if isinstance(txt, str) and txt:
                # UI will JSON.parse(e.data) and route by type
                yield {"type": "token", "text": txt}
    except Exception as e:
        # optional: surface errors to UI
        yield {"type": "error", "message": str(e)}

    # done marker for UI to stop spinners, etc.
    yield {"type": "done"}

if __name__ == "__main__":
    app.run()
