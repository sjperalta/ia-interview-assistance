import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  Icon,
  ScrollView,
  Pressable,
  Progress,
  Circle,
  Divider,
  Button
} from 'native-base';
import { LucideMic, LucideSettings, LucideLightbulb, LucideCloud, LucideVolume2, LucideBug, LucideTrash2 } from 'lucide-react-native';
import { GlassCard } from '#root/ui/atoms/glass-card';
import { useRouter } from 'expo-router';
import { StatusPill } from '#root/ui/molecules/status-pill';
import { useInterview } from '../hooks/use-interview';

export const LiveSessionScreen = () => {
  const router = useRouter();
  const [showDebug, setShowDebug] = useState(false);
  const {
    isListening,
    status,
    transcript,
    suggestedAnswer,
    confidence,
    sessionDuration,
    startListening,
    stopListening,
    toggleWhisperMode,
    whisperModeEnabled,
    speakAnswer,
    micPermissionStatus,
    lastAudioError,
    debugEvents,
    clearDebug,
  } = useInterview();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Box flex={1} bg="surface.900" safeArea>
      {/* Header */}
      <HStack px={6} py={4} justifyContent="space-between" alignItems="center">
        <HStack space={3} alignItems="center">
          <Circle size="32px" bg="surface.500" borderWidth={1} borderColor="surface.400">
            <Icon as={LucideMic} size="xs" color="primary.200" />
          </Circle>
          <Text fontSize="xl" fontWeight="800" letterSpacing={-0.5} color="primary.200">
            LUCID AI
          </Text>
        </HStack>
        <HStack space={1}>
          <IconButton
            accessibilityLabel="Toggle debug"
            icon={<Icon as={LucideBug} size="sm" color={showDebug ? 'primary.200' : 'surface.300'} />}
            variant="ghost"
            borderRadius="full"
            onPress={() => setShowDebug((v) => !v)}
          />
          <IconButton
            accessibilityLabel="Settings"
            icon={<Icon as={LucideSettings} size="sm" color="primary.200" />}
            variant="ghost"
            borderRadius="full"
            onPress={() => router.push('/settings')}
          />
        </HStack>
      </HStack>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 120 }}>
        <VStack space={8}>
          {/* Status Section */}
          <HStack justifyContent="space-between" alignItems="center">
            <HStack space={3}>
              <StatusPill
                label={status === 'Idle' ? 'IDLE' : status.toUpperCase()}
                tone={status === 'Idle' ? 'idle' : status === 'Thinking' ? 'warn' : 'active'}
                isPulsing={status !== 'Idle'}
              />
              <Box px={4} py={2} borderRadius="full" bg="surface.800">
                <Text fontSize="xs" fontWeight="600" color="surface.300" letterSpacing={1.5}>
                  CONFIDENCE: {confidence}%
                </Text>
              </Box>
            </HStack>

            <Pressable onPress={toggleWhisperMode}>
              <HStack space={2} px={4} py={2} borderRadius="full" bg="surface.600" alignItems="center">
                <Icon as={LucideVolume2} size="xs" color="primary.200" />
                <Text fontSize="xs" fontWeight="600" color="surface.300" letterSpacing={1.5}>
                  WHISPER: {whisperModeEnabled ? 'ON' : 'OFF'}
                </Text>
              </HStack>
            </Pressable>
          </HStack>

          {/* Interviewer Question */}
          <VStack space={4}>
            <Text fontSize="xs" fontWeight="600" color="surface.300" letterSpacing={1.5}>
              INTERVIEWER'S QUESTION
            </Text>
            <GlassCard p={6} borderLeftWidth={2} borderLeftColor="primary.500">
              <Text fontSize="lg" color="white" fontStyle="italic" lineHeight="md">
                "{transcript}"
              </Text>
            </GlassCard>

            {/* Speech Pace Indicator */}
            <VStack space={1}>
              <HStack justifyContent="space-between">
                <Text fontSize="2xs" color="surface.400" letterSpacing={1.5}>SPEECH PACE</Text>
                <Text fontSize="2xs" color="primary.200" letterSpacing={1.5}>OPTIMAL</Text>
              </HStack>
              <Progress value={66} size="xs" bg="surface.500" _filledTrack={{ bg: 'primary.500' }} />
            </VStack>
          </VStack>

          {/* AI Suggested Answer */}
          <VStack space={4}>
            <Text fontSize="xs" fontWeight="600" color="surface.300" letterSpacing={1.5}>
              AI SUGGESTED ANSWER
            </Text>
            <GlassCard p={6} bg="surface.600">
              <Box position="absolute" top={3} right={3}>
                <HStack space={2} alignItems="center">
                  <IconButton
                    accessibilityLabel="Speak answer"
                    icon={<Icon as={LucideVolume2} size="sm" color="primary.200" />}
                    variant="ghost"
                    borderRadius="full"
                    onPress={speakAnswer}
                    opacity={suggestedAnswer.length > 0 ? 1 : 0.35}
                  />
                  <Icon as={LucideLightbulb} size="xl" color="primary.200" opacity={0.2} fill="currentColor" />
                </HStack>
              </Box>

              <VStack space={6}>
                {suggestedAnswer.map((item, index) => (
                  <HStack key={index} space={4}>
                    <Text fontSize="lg" fontWeight="800" color="primary.200">
                      {(index + 1).toString().padStart(2, '0')}
                    </Text>
                    <Text fontSize="sm" color="white" flex={1} lineHeight="sm">
                      {item.split('**').map((part, i) => i % 2 === 1 ? <Text key={i} fontWeight="bold" color="primary.200">{part}</Text> : part)}
                    </Text>
                  </HStack>
                ))}
              </VStack>

              <Divider my={8} bg="surface.400" opacity={0.1} />

              <Button
                variant="premium"
                py={3}
                _text={{ fontSize: 'sm', fontWeight: 'bold' }}
                isDisabled={suggestedAnswer.length === 0}
                onPress={() => router.push({
                  pathname: '/interview/full-draft',
                  params: {
                    question: transcript,
                    answerBulletsJson: JSON.stringify(suggestedAnswer)
                  }
                })}
              >
                VIEW FULL DRAFT
              </Button>
            </GlassCard>
          </VStack>

          {showDebug && (
            <VStack space={3}>
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="xs" fontWeight="600" color="surface.300" letterSpacing={1.5}>
                  DEBUG (AUDIO)
                </Text>
                <IconButton
                  accessibilityLabel="Clear debug"
                  icon={<Icon as={LucideTrash2} size="sm" color="surface.300" />}
                  variant="ghost"
                  borderRadius="full"
                  onPress={clearDebug}
                />
              </HStack>

              <GlassCard p={5}>
                <VStack space={2}>
                  <HStack justifyContent="space-between">
                    <Text fontSize="xs" color="surface.400">
                      Mic permission
                    </Text>
                    <Text fontSize="xs" color="primary.200" fontWeight="700">
                      {micPermissionStatus.toUpperCase()}
                    </Text>
                  </HStack>

                  <HStack justifyContent="space-between">
                    <Text fontSize="xs" color="surface.400">
                      Last audio error
                    </Text>
                    <Text fontSize="xs" color={lastAudioError ? 'amber.300' : 'surface.400'} fontWeight="700">
                      {lastAudioError ? 'YES' : 'NO'}
                    </Text>
                  </HStack>

                  {lastAudioError && (
                    <Text fontSize="xs" color="amber.200">
                      {lastAudioError}
                    </Text>
                  )}

                  <Divider my={2} bg="surface.400" opacity={0.12} />

                  <VStack space={1}>
                    {debugEvents.length === 0 ? (
                      <Text fontSize="xs" color="surface.400">
                        No debug events yet.
                      </Text>
                    ) : (
                      debugEvents.map((e, idx) => (
                        <Text key={idx} fontSize="xs" color="surface.300">
                          {e}
                        </Text>
                      ))
                    )}
                  </VStack>
                </VStack>
              </GlassCard>
            </VStack>
          )}
        </VStack>
      </ScrollView>

      {/* Bottom Bar */}
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        bg="rgba(9, 19, 40, 0.8)"
        px={6}
        pb={8}
        pt={4}
        style={{ borderTopWidth: 1, borderTopColor: 'rgba(109, 117, 140, 0.1)' }}
      >
        <HStack justifyContent="space-between" alignItems="center">
          <VStack>
            <Text fontSize="2xs" color="surface.400" letterSpacing={1.5}>SESSION DURATION</Text>
            <Text fontSize="lg" fontWeight="800" color="white">{formatTime(sessionDuration)}</Text>
          </VStack>

          <Pressable onPress={isListening ? stopListening : startListening}>
            <VStack alignItems="center" space={2}>
              <Circle size="64px" bg={isListening ? "primary.500" : "surface.600"} shadow={9}>
                <Icon as={LucideMic} size="xl" color="white" />
              </Circle>
              <Text fontSize="2xs" fontWeight="bold" color="primary.200" letterSpacing={1.5}>
                {isListening ? 'STOP LISTENING' : 'START LISTENING'}
              </Text>
            </VStack>
          </Pressable>

          <VStack alignItems="flex-end">
            <Text fontSize="2xs" color="surface.400" letterSpacing={1.5}>TRANSCRIPTION STATE</Text>
            <HStack space={2} alignItems="center">
              <Text fontSize="xs" fontWeight="600" color="primary.200">SYNCED</Text>
              <Icon as={LucideCloud} size="xs" color="primary.200" />
            </HStack>
          </VStack>
        </HStack>
      </Box>
    </Box>
  );
};
