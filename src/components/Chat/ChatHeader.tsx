import React from 'react';
import { Box, Typography, Button, Avatar } from '@mui/material';
import { Add, AutoAwesome } from '@mui/icons-material';

interface ChatHeaderProps {
  onNewChat: () => void;
  isLoading: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onNewChat, isLoading }) => {
  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #581c87 0%, #7c3aed 100%)',
      color: 'white',
      p: 3,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ position: 'relative' }}>
          <Avatar sx={{ 
            background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
            width: 48, 
            height: 48,
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
          }}>
            <AutoAwesome sx={{ fontSize: 24 }} />
          </Avatar>
          <Box sx={{
            position: 'absolute',
            bottom: 2,
            right: 2,
            width: 12,
            height: 12,
            bgcolor: '#10b981',
            borderRadius: '50%',
            border: '2px solid white',
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)', opacity: 1 },
              '50%': { transform: 'scale(1.1)', opacity: 0.7 },
              '100%': { transform: 'scale(1)', opacity: 1 },
            }
          }} />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ 
            fontWeight: 700, 
            lineHeight: 1.2,
            color: '#f8fafc'
          }}>
            GenAI Agent
          </Typography>
          <Typography variant="body2" sx={{ 
            opacity: 0.9,
            color: '#e9d5ff',
            fontWeight: 500
          }}>
            Powered by strands-agents • Markdown Support
          </Typography>
        </Box>
      </Box>

      <Button
        variant="outlined"
        startIcon={<Add />}
        onClick={onNewChat}
        disabled={isLoading}
        sx={{
          color: '#f8fafc',
          borderColor: 'rgba(255, 255, 255, 0.4)',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          fontWeight: 600,
          '&:hover': {
            borderColor: 'rgba(255, 255, 255, 0.6)',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(255, 255, 255, 0.1)',
          },
          '&:disabled': {
            opacity: 0.5,
          },
          transition: 'all 0.2s ease',
        }}
      >
        New Chat
      </Button>
    </Box>
  );
};

export default ChatHeader;
