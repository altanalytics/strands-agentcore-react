# scotus_kb_search.py

from strands_tools.retrieve import retrieve
from typing import Any

# 1. Tool Specification
TOOL_SPEC = {
    "name": "scotus_kb_search",
    "description": """Search the SCOTUS knowledge base for Supreme Court cases, opinions, and legal precedents.

This tool provides access to Supreme Court opinions and decisions, enabling queries about:
- Supreme Court case law and precedents
- Constitutional interpretation and analysis
- Legal reasoning and judicial opinions
- Historical context of court decisions
- Impact and implications of rulings

Results are sorted by relevance score and include source metadata.""",
    "inputSchema": {
        "json": {
            "type": "object",
            "properties": {
                "text": {
                    "type": "string",
                    "description": "The query to search for in the SCOTUS knowledge base"
                },
                "numberOfResults": {
                    "type": "integer",
                    "description": "The maximum number of results to return. Default is 5.",
                    "default": 5
                },
                "score": {
                    "type": "number",
                    "description": "Minimum relevance score threshold (0.0-1.0). Results below this score will be filtered out. Default is 0.4.",
                    "default": 0.4,
                    "minimum": 0.0,
                    "maximum": 1.0
                }
            },
            "required": ["text"]
        }
    }
}

# 2. Tool Function
def scotus_kb_search(tool, **kwargs: Any):
    """
    Search the SCOTUS knowledge base with pre-configured settings.
    
    This is a wrapper around the retrieve tool that automatically uses
    the correct knowledge base ID and region for SCOTUS data.
    
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
        "knowledgeBaseId": "XPXXQUL4A6",
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
scotus_kb_search.TOOL_SPEC = TOOL_SPEC
