import React, { useCallback } from 'react';
import { Box, Divider, HStack, Icon, IconButton, Pressable, ScrollView, Spinner, Switch, Text, VStack } from 'native-base';
import { useRouter } from 'expo-router';
import { LucideArrowLeft, LucideRotateCcw } from 'lucide-react-native';
import { GlassCard } from '#root/ui/atoms/glass-card';
import { historyRepo } from '#root/features/history/services/history-repo';
import { insightsTelemetryRepo } from '#root/features/insights';
import { useSettings } from '../hooks/use-settings';

export function SettingsScreen() {
  const router = useRouter();
  const { settings, isLoading, error, update, reset } = useSettings();

  const goBack = useCallback(() => router.back(), [router]);

  const resetSettings = useCallback(async () => {
    await reset();
  }, [reset]);

  const resetAppData = useCallback(async () => {
    await Promise.all([historyRepo.clear(), insightsTelemetryRepo.clear(), reset()]);
  }, [reset]);

  return (
    <Box flex={1} bg="surface.900" safeArea>
      <HStack px={6} py={4} justifyContent="space-between" alignItems="center">
        <IconButton
          accessibilityLabel="Back"
          icon={<Icon as={LucideArrowLeft} size="sm" color="primary.200" />}
          variant="ghost"
          borderRadius="full"
          onPress={goBack}
        />
        <Text fontSize="md" fontWeight="800" letterSpacing={1.5} color="primary.200">
          SETTINGS
        </Text>
        <IconButton
          accessibilityLabel="Reset settings"
          icon={<Icon as={LucideRotateCcw} size="sm" color="surface.300" />}
          variant="ghost"
          borderRadius="full"
          onPress={() => void resetSettings()}
        />
      </HStack>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 10, paddingBottom: 24 }}>
        {isLoading ? (
          <VStack py={20} alignItems="center">
            <Spinner color="primary.200" />
          </VStack>
        ) : error || !settings ? (
          <Text color="surface.300">{error ?? 'Failed to load settings'}</Text>
        ) : (
          <VStack space={6}>
            <GlassCard p={6}>
              <VStack space={5}>
                <HStack justifyContent="space-between" alignItems="center">
                  <VStack flex={1} pr={3}>
                    <Text color="white" fontWeight="700">
                      Whisper Mode default
                    </Text>
                    <Text fontSize="xs" color="surface.400">
                      Automatically enable whisper mode when you start a session.
                    </Text>
                  </VStack>
                  <Switch
                    isChecked={settings.whisperModeDefault}
                    onToggle={(v) => void update({ whisperModeDefault: v })}
                    onTrackColor="primary.500"
                    offTrackColor="surface.600"
                  />
                </HStack>

                <Divider bg="surface.400" opacity={0.12} />

                <VStack space={3}>
                  <Text color="white" fontWeight="700">
                    Silence threshold
                  </Text>
                  <Text fontSize="xs" color="surface.400">
                    Determines how quickly we finalize a question after the interviewer stops speaking.
                  </Text>

                  <HStack space={3}>
                    {[800, 1000, 1200].map((ms) => {
                      const isActive = settings.vadSilenceMs === ms;
                      return (
                        <Pressable key={ms} onPress={() => void update({ vadSilenceMs: ms })}>
                          <Box
                            px={4}
                            py={2}
                            borderRadius="full"
                            bg={isActive ? 'primary.500' : 'surface.700'}
                            borderWidth={1}
                            borderColor={isActive ? 'primary.300' : 'rgba(109, 117, 140, 0.18)'}
                          >
                            <Text color={isActive ? 'white' : 'surface.300'} fontWeight="700" fontSize="xs">
                              {ms}ms
                            </Text>
                          </Box>
                        </Pressable>
                      );
                    })}
                  </HStack>
                </VStack>

                <Divider bg="surface.400" opacity={0.12} />

                <VStack space={3}>
                  <Text color="white" fontWeight="700">
                    Answer style
                  </Text>
                  <Text fontSize="xs" color="surface.400">
                    Keep it short for quick reading, or slightly more detailed.
                  </Text>
                  <HStack space={3}>
                    {[
                      { id: 'concise', label: 'Concise' },
                      { id: 'slightly_detailed', label: 'Slightly detailed' },
                    ].map((opt) => {
                      const isActive = settings.answerStyle === opt.id;
                      return (
                        <Pressable key={opt.id} onPress={() => void update({ answerStyle: opt.id as any })}>
                          <Box
                            px={4}
                            py={2}
                            borderRadius="full"
                            bg={isActive ? 'primary.500' : 'surface.700'}
                            borderWidth={1}
                            borderColor={isActive ? 'primary.300' : 'rgba(109, 117, 140, 0.18)'}
                          >
                            <Text color={isActive ? 'white' : 'surface.300'} fontWeight="700" fontSize="xs">
                              {opt.label}
                            </Text>
                          </Box>
                        </Pressable>
                      );
                    })}
                  </HStack>
                </VStack>
              </VStack>
            </GlassCard>

            <GlassCard p={6} bg="surface.600">
              <VStack space={3}>
                <Text color="white" fontWeight="800">
                  Reset settings
                </Text>
                <Text fontSize="xs" color="surface.400">
                  Restores settings back to defaults. Keeps your local history.
                </Text>
                <Pressable onPress={() => void resetSettings()}>
                  <Box
                    mt={2}
                    px={4}
                    py={3}
                    borderRadius="xl"
                    bg="rgba(255, 255, 255, 0.06)"
                    borderWidth={1}
                    borderColor="rgba(109, 117, 140, 0.18)"
                  >
                    <Text color="surface.200" fontWeight="800" textAlign="center">
                      RESET SETTINGS
                    </Text>
                  </Box>
                </Pressable>
              </VStack>
            </GlassCard>

            <GlassCard p={6} bg="surface.600">
              <VStack space={3}>
                <Text color="white" fontWeight="800">
                  Reset app data
                </Text>
                <Text fontSize="xs" color="surface.400">
                  Clears local history and resets settings back to defaults.
                </Text>
                <Pressable onPress={() => void resetAppData()}>
                  <Box
                    mt={2}
                    px={4}
                    py={3}
                    borderRadius="xl"
                    bg="rgba(255, 255, 255, 0.06)"
                    borderWidth={1}
                    borderColor="rgba(109, 117, 140, 0.18)"
                  >
                    <Text color="surface.200" fontWeight="800" textAlign="center">
                      RESET APP DATA
                    </Text>
                  </Box>
                </Pressable>
              </VStack>
            </GlassCard>
          </VStack>
        )}
      </ScrollView>
    </Box>
  );
}

