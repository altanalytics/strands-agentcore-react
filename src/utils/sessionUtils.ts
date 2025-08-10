// Generate a 33-character session ID with userName as prefix
export const generateSessionId = (userName: string): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  
  // Use userName as prefix, truncate if too long
  const prefix = userName.substring(0, Math.min(userName.length, 20));
  const remainingLength = 33 - prefix.length;
  
  let randomSuffix = '';
  for (let i = 0; i < remainingLength; i++) {
    randomSuffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return prefix + randomSuffix;
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
