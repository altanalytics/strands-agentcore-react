import React, { useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Chip,
  Tooltip,
  Paper,
  Collapse,
  IconButton
} from '@mui/material';
import { SmartToy, Psychology, ExpandMore, ExpandLess, Settings } from '@mui/icons-material';
import { MODEL_OPTIONS, PERSONALITY_OPTIONS, ModelOption, PersonalityOption } from '../../config/agentConfig';

interface ChatSettingsProps {
  selectedModel: string;
  selectedPersonality: string;
  onModelChange: (model: string) => void;
  onPersonalityChange: (personality: string) => void;
  disabled?: boolean;
}

const ChatSettings: React.FC<ChatSettingsProps> = ({
  selectedModel,
  selectedPersonality,
  onModelChange,
  onPersonalityChange,
  disabled = false
}) => {
  const [expanded, setExpanded] = useState(false);
  const selectedModelOption = MODEL_OPTIONS.find(m => m.id === selectedModel);
  const selectedPersonalityOption = PERSONALITY_OPTIONS.find(p => p.id === selectedPersonality);

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        background: 'rgba(248, 250, 252, 0.8)',
        borderRadius: 2,
        border: '1px solid rgba(0, 0, 0, 0.08)',
        overflow: 'hidden'
      }}
    >
      {/* Header with current selection */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          p: 2,
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.02)'
          }
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Settings sx={{ color: 'primary.main', fontSize: 20 }} />
          <Typography variant="body2" sx={{ fontWeight: 600, mr: 2 }}>
            Agent Settings
          </Typography>
          <Chip
            icon={<SmartToy />}
            label={selectedModelOption?.name || 'Unknown Model'}
            variant="outlined"
            size="small"
            color="primary"
            sx={{ fontSize: '0.75rem', height: 24 }}
          />
          <Chip
            icon={<Psychology />}
            label={selectedPersonalityOption?.name || 'Unknown Personality'}
            variant="outlined"
            size="small"
            color="secondary"
            sx={{ fontSize: '0.75rem', height: 24 }}
          />
        </Box>
        <IconButton size="small">
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      {/* Expandable Settings */}
      <Collapse in={expanded}>
        <Box sx={{ p: 2, pt: 0, borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {/* Model Selection */}
            <FormControl sx={{ minWidth: 200, flex: 1 }} disabled={disabled}>
              <InputLabel id="model-select-label">AI Model</InputLabel>
              <Select
                labelId="model-select-label"
                value={selectedModel}
                label="AI Model"
                onChange={(e) => onModelChange(e.target.value)}
                size="small"
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              >
                {MODEL_OPTIONS.map((model: ModelOption) => (
                  <MenuItem key={model.id} value={model.id}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {model.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {model.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Personality Selection */}
            <FormControl sx={{ minWidth: 200, flex: 1 }} disabled={disabled}>
              <InputLabel id="personality-select-label">Personality</InputLabel>
              <Select
                labelId="personality-select-label"
                value={selectedPersonality}
                label="Personality"
                onChange={(e) => onPersonalityChange(e.target.value)}
                size="small"
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              >
                {PERSONALITY_OPTIONS.map((personality: PersonalityOption) => (
                  <MenuItem key={personality.id} value={personality.id}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {personality.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {personality.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default ChatSettings;
