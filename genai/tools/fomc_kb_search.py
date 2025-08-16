"""
FOMC Knowledge Base Search Tool
Searches the Federal Open Market Committee knowledge base for relevant information.
"""

import boto3
from strands.tools import tool

@tool
def fomc_kb_search(query: str) -> str:
    """
    Search the FOMC knowledge base for information about Federal Reserve monetary policy,
    meeting minutes, and economic decisions.
    
    Args:
        query: The search query to find relevant FOMC information
        
    Returns:
        str: Relevant information from the FOMC knowledge base
    """
    try:
        # Initialize Bedrock Agent Runtime client
        client = boto3.client('bedrock-agent-runtime', region_name='us-east-1')
        
        # Knowledge base ID for FOMC data
        knowledge_base_id = "P7J0PZOXSE"
        
        # Perform the search
        response = client.retrieve(
            knowledgeBaseId=knowledge_base_id,
            retrievalQuery={
                'text': query
            },
            retrievalConfiguration={
                'vectorSearchConfiguration': {
                    'numberOfResults': 5
                }
            }
        )
        
        # Extract and format the results
        results = []
        for result in response.get('retrievalResults', []):
            content = result.get('content', {}).get('text', '')
            if content:
                results.append(content)
        
        if results:
            return "\n\n".join(results)
        else:
            return "No relevant FOMC information found for your query."
            
    except Exception as e:
        return f"Error searching FOMC knowledge base: {str(e)}"
