import React from 'react';
import { Box, Text, VStack, Icon } from 'native-base';
import { LucideIcon } from 'lucide-react-native';

interface StatCardProps {
  icon: LucideIcon;
  iconColor: string;
  value: string | number;
  label: string;
}

export const StatCard: React.FC<StatCardProps> = ({ icon, iconColor, value, label }) => {
  return (
    <Box bg="surface.600" p={6} rounded="2xl" flex={1} justifyContent="space-between" minH={120}>
      <Icon as={icon} size="md" color={iconColor} mb={4} fill={iconColor} fillOpacity={0.2} />
      <VStack>
        <Text fontSize="3xl" fontWeight="800" color="white" fontFamily="heading">
          {value}
        </Text>
        <Text fontSize="10px" fontWeight="500" color="surface.300" textTransform="uppercase" letterSpacing={1.5}>
          {label}
        </Text>
      </VStack>
    </Box>
  );
};
