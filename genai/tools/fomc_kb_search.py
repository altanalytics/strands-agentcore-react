# fomc_kb_search.py

from strands_tools.retrieve import retrieve
from typing import Any

# 1. Tool Specification
TOOL_SPEC = {
    "name": "fomc_kb_search",
    "description": "Search the FOMC knowledge base for Federal Reserve monetary policy information, meeting minutes, and economic decisions.",
    "inputSchema": {
        "json": {
            "type": "object",
            "properties": {
                "text": {
                    "type": "string",
                    "description": "The query to search for in the FOMC knowledge base"
                },
                "numberOfResults": {
                    "type": "integer",
                    "description": "The maximum number of results to return. Default is 5.",
                    "default": 5
                },
                "score": {
                    "type": "number",
                    "description": "Minimum relevance score threshold (0.0-1.0). Default is 0.4.",
                    "default": 0.4
                }
            },
            "required": ["text"]
        }
    }
}

# 2. Tool Function
def fomc_kb_search(tool, **kwargs: Any):
    """
    Search the FOMC knowledge base with pre-configured settings.
    
    This is a wrapper around the retrieve tool that automatically uses
    the correct knowledge base ID and region for FOMC data.
    
    Args:
        tool: Tool object containing toolUseId and input parameters
        **kwargs: Additional keyword arguments
        
    Returns:
        dict: Structured response from the knowledge base search
    """
    # Extract the original input
    tool_input = tool["input"]
    
    # Add the pre-configured knowledge base settings
    enhanced_input = {
        **tool_input,
        "knowledgeBaseId": "P7J0PZOXSE",
        "region": "us-east-1"
    }
    
    # Create a new tool object with the enhanced input
    enhanced_tool = {
        **tool,
        "input": enhanced_input
    }
    
    # Call the original retrieve function with our pre-configured settings
    return retrieve(enhanced_tool, **kwargs)

# Attach TOOL_SPEC to function for Strands framework
fomc_kb_search.TOOL_SPEC = TOOL_SPEC
