import React from 'react';
import { HStack, Text, Box } from 'native-base';
import { MotiView } from 'moti';

export type StatusPillTone = 'idle' | 'active' | 'warn';

export function StatusPill({
  label,
  tone,
  isPulsing = false,
}: {
  label: string;
  tone: StatusPillTone;
  isPulsing?: boolean;
}) {
  const dotColor =
    tone === 'active' ? 'primary.500' : tone === 'warn' ? 'amber.400' : 'surface.400';

  return (
    <HStack space={2} px={4} py={2} borderRadius="full" bg="rgba(25, 37, 64, 0.4)" alignItems="center">
      {isPulsing ? (
        <MotiView
          from={{ opacity: 0.3, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 1000, loop: true } as any}
        >
          <Box size="8px" rounded="full" bg={dotColor} />
        </MotiView>
      ) : (
        <Box size="8px" rounded="full" bg={dotColor} />
      )}
      <Text fontSize="xs" fontWeight="600" color="primary.200" letterSpacing={1.5}>
        {label}
      </Text>
    </HStack>
  );
}

