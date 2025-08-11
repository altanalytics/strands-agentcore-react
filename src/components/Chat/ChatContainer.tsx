import React, { useState, useRef, useEffect } from 'react';
import { Box, Paper } from '@mui/material';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { Message, getWelcomeMessage } from '../../types/message';
import { generateSessionId } from '../../utils/sessionUtils';
import { makeAuthenticatedRequest } from '../../utils/apiUtils';

interface ChatContainerProps {
  userName: string;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ userName }) => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([getWelcomeMessage()]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState('');
  const [sessionId, setSessionId] = useState(() => generateSessionId(userName));
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingResponse]);

  // Log session ID whenever it changes
  useEffect(() => {
    console.log('Current Session ID:', sessionId);
  }, [sessionId]);

  const handleNewChat = () => {
    const newSessionId = generateSessionId(userName);
    setSessionId(newSessionId);
    setMessages([getWelcomeMessage()]);
    setStreamingResponse('');
    setIsLoading(false);
    setPrompt('');
    console.log('New chat started with Session ID:', newSessionId);
  };

  const parseSSEChunk = (chunk: string): string => {
    const lines = chunk.split('\n');
    let extractedText = '';
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const jsonStr = line.slice(6); // Remove 'data: ' prefix
          const data = JSON.parse(jsonStr);
          
          if (data.type === 'token' && data.text) {
            extractedText += data.text;
          }
        } catch (e) {
          // Skip invalid JSON lines
          console.warn('Failed to parse SSE line:', line);
        }
      }
    }
    
    return extractedText;
  };

  const handleSubmit = async (message: string) => {
    if (!message.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setPrompt('');
    setIsLoading(true);
    setStreamingResponse('');
    
    try {
      const response = await makeAuthenticatedRequest({
        prompt: message,
        session_id: sessionId
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          console.log('Received chunk:', chunk); // Debug log
          
          // Parse the SSE format and extract text tokens
          const extractedText = parseSSEChunk(chunk);
          
          if (extractedText) {
            fullResponse += extractedText;
            setStreamingResponse(fullResponse);
            console.log('Updated streaming response:', fullResponse); // Debug log
          }
        }

        // Add the complete response as a message
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: fullResponse,
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        setStreamingResponse('');
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `**Error:** ${error instanceof Error ? error.message : 'Failed to get response from AI'}`,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      p: 2 
    }}>
      <Paper 
        elevation={3}
        sx={{ 
          width: '100%',
          maxWidth: 800,
          height: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
          overflow: 'hidden',
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <ChatHeader onNewChat={handleNewChat} isLoading={isLoading} />
        <MessageList 
          messages={messages}
          streamingResponse={streamingResponse}
          isLoading={isLoading}
          messagesEndRef={messagesEndRef}
        />
        <MessageInput
          prompt={prompt}
          setPrompt={setPrompt}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </Paper>
    </Box>
  );
};

export default ChatContainer;
