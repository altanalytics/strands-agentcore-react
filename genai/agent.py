from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
from datetime import datetime,timezone
from strands import Agent
from fastapi.responses import StreamingResponse
from strands.models import BedrockModel
from strands.agent.conversation_manager import SlidingWindowConversationManager


app = FastAPI(title="Strands Agent Server", version="1.0.0")

# Create a Bedrock model instance
bedrock_model = BedrockModel(
    model_id="us.amazon.nova-micro-v1:0",
    max_tokens=2000,
    temperature=0.3,
    top_p=0.8,
)

# Configure conversation management for production
conversation_manager = SlidingWindowConversationManager(
    window_size=10,  # Limit history size
)

# Create an agent using the BedrockModel instance
strands_agent = Agent(model=bedrock_model,
                      conversation_manager=conversation_manager)

class InvocationRequest(BaseModel):
    input: Dict[str, Any]

class InvocationResponse(BaseModel):
    output: Dict[str, Any]

@app.post("/invocations", response_model=InvocationResponse)
async def invoke_agent_stream(request: InvocationRequest):
    try:
        user_message = request.input.get("prompt", "")
        if not user_message:
            raise HTTPException(
                status_code=400,
                detail="No prompt found in input. Please provide a 'prompt' key in the input."
            )

        async def generate_stream():
            try:
                async for event in strands_agent.stream_async(user_message):
                    if "data" in event:
                        # Stream the actual agent reasoning and responses
                        yield event["data"]
            except Exception as e:
                yield f"Error: {str(e)}"

        return StreamingResponse(
            generate_stream(),
            media_type="text/plain",
            headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent processing failed: {str(e)}")

@app.get("/ping")
async def ping():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)