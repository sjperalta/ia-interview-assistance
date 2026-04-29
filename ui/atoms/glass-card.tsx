import React from 'react';
import { Box, IBoxProps } from 'native-base';

interface GlassCardProps extends IBoxProps {
  children: React.ReactNode;
  blur?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, ...props }) => {
  return (
    <Box
      {...props}
      bg="rgba(25, 37, 64, 0.4)"
      borderRadius="2xl"
      borderWidth={1}
      borderColor="rgba(109, 117, 140, 0.1)"
      style={[
        {
          // For iOS backdrop filter equivalent, we'd use BlurView, 
          // but for now we stick to the background color and border.
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
          elevation: 5,
        },
        props.style,
      ]}
    >
      {children}
    </Box>
  );
};
