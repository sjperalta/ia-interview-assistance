import React from 'react';
import { Box, ScrollView, HStack, VStack, Text, Heading, Spinner, Center, IconButton, Icon } from 'native-base';
import { LucideBarChart2, LucideZap, LucideMessageCircle, LucideHistory, LucideSettings } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useInsights } from '../hooks/use-insights';
import { StatCard } from '../components/stat-card';
import { SkillBreakdown } from '../components/skill-breakdown';

export function InsightsScreen() {
  const router = useRouter();
  const { data, isLoading } = useInsights();

  if (isLoading || !data) {
    return (
      <Box flex={1} bg="surface.900" safeArea>
        <Center flex={1}>
          <Spinner color="primary.200" />
        </Center>
      </Box>
    );
  }

  return (
    <Box flex={1} bg="surface.900" safeArea>
      <VStack flex={1}>
        {/* Header */}
        <HStack px={6} py={4} justifyContent="space-between" alignItems="center">
          <HStack space={3} alignItems="center">
            <Box w={10} h={10} rounded="full" overflow="hidden" borderWidth={2} borderColor="primary.200">
              <Box bg="surface.500" flex={1} />
            </Box>
            <Heading fontSize="2xl" fontWeight="800" color="primary.200">
              Insights
            </Heading>
          </HStack>
          <IconButton
            accessibilityLabel="Settings"
            icon={<Icon as={LucideSettings} size="sm" color="primary.200" />}
            variant="ghost"
            borderRadius="full"
            _pressed={{ bg: 'surface.600' }}
            onPress={() => router.push('/settings')}
          />
        </HStack>

        <ScrollView px={6} py={8} showsVerticalScrollIndicator={false}>
          {/* Statistics Grid */}
          <VStack space={4}>
            <HStack space={4}>
              <StatCard
                icon={LucideBarChart2}
                iconColor="primary.200"
                value={data.stats.totalSessions}
                label="Total Sessions"
              />
              <StatCard
                icon={LucideZap}
                iconColor="tertiary.500"
                value={data.stats.avgConfidence == null ? '—' : `${data.stats.avgConfidence}%`}
                label="Avg Confidence"
              />
            </HStack>
            <HStack space={4}>
              <StatCard
                icon={LucideMessageCircle}
                iconColor="primary.500"
                value={data.stats.questionsAnswered}
                label="Questions Answered"
              />
              <StatCard
                icon={LucideHistory}
                iconColor="surface.300"
                value={data.stats.practiceTime}
                label="Practice Time"
              />
            </HStack>
          </VStack>

          {/* Skill Breakdown */}
          <VStack mt={12} mb={8} space={6}>
            <VStack px={1} space={1}>
              <Heading size="md" color="white">
                Skill Breakdown
              </Heading>
              <Text fontSize="xs" color="surface.400">
                Estimated from your practice
              </Text>
            </VStack>
            <SkillBreakdown skills={data.skills} />
          </VStack>
        </ScrollView>
      </VStack>
    </Box>
  );
}
