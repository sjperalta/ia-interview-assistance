import React from 'react';
import { Box, HStack, Text, VStack, Progress } from 'native-base';
import { SkillScore } from '../types';

interface SkillBreakdownProps {
  skills: SkillScore[];
}

export const SkillBreakdown: React.FC<SkillBreakdownProps> = ({ skills }) => {
  return (
    <VStack space={8} bg="surface.600" p={8} rounded="2xl">
      {skills.map((skill) => (
        <VStack key={skill.name} space={3}>
          <HStack justifyContent="space-between" alignItems="flex-end">
            <Text fontSize="sm" fontWeight="500" color="white">
              {skill.name}
            </Text>
            <Text fontSize="sm" fontWeight="800" color="primary.200">
              {skill.score}%
            </Text>
          </HStack>
          <Box h={2} w="full" bg="surface.500" rounded="full" overflow="hidden">
            <Box h="full" w={`${skill.score}%`} bg="primary.200" rounded="full" />
          </Box>
        </VStack>
      ))}
    </VStack>
  );
};
