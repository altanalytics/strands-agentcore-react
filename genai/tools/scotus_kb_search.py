"""
SCOTUS Knowledge Base Search Tool
Searches the Supreme Court of the United States knowledge base for relevant legal information.
"""

import boto3
from strands.tools import tool

@tool
def scotus_kb_search(query: str) -> str:
    """
    Search the SCOTUS knowledge base for information about Supreme Court cases,
    opinions, and legal precedents.
    
    Args:
        query: The search query to find relevant SCOTUS information
        
    Returns:
        str: Relevant information from the SCOTUS knowledge base
    """
    try:
        # Initialize Bedrock Agent Runtime client
        client = boto3.client('bedrock-agent-runtime', region_name='us-east-1')
        
        # Knowledge base ID for SCOTUS data
        knowledge_base_id = "XPXXQUL4A6"
        
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
            return "No relevant SCOTUS information found for your query."
            
    except Exception as e:
        return f"Error searching SCOTUS knowledge base: {str(e)}"
