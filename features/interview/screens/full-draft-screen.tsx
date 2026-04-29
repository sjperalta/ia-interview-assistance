import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  Icon,
  ScrollView,
  Button,
  useToast,
  Divider,
} from 'native-base';
import { LucideChevronLeft, LucideCopy, LucideCheck } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { MotiView } from 'moti';
import { GlassCard } from '#root/ui/atoms/glass-card';

export const FullDraftScreen = () => {
  const router = useRouter();
  const { question, answerBulletsJson } = useLocalSearchParams<{ 
    question: string; 
    answerBulletsJson: string; 
  }>();
  
  const toast = useToast();
  const [copied, setCopied] = React.useState(false);

  const bullets = React.useMemo(() => {
    try {
      return JSON.parse(answerBulletsJson || '[]') as string[];
    } catch (e) {
      return [];
    }
  }, [answerBulletsJson]);

  const handleCopy = async () => {
    const fullText = bullets.join('\n\n');
    await Clipboard.setStringAsync(fullText);
    setCopied(true);
    toast.show({
      description: "Draft copied to clipboard",
      placement: "top",
      duration: 2000,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box flex={1} bg="surface.900" safeArea>
      {/* Header */}
      <HStack px={4} py={4} alignItems="center" space={2}>
        <IconButton
          icon={<Icon as={LucideChevronLeft} size="md" color="primary.200" />}
          variant="ghost"
          borderRadius="full"
          onPress={() => router.back()}
        />
        <Text fontSize="lg" fontWeight="800" color="primary.200" letterSpacing={-0.5}>
          FULL DRAFT
        </Text>
      </HStack>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 10, paddingBottom: 40 }}>
        <VStack space={8}>
          {/* Context Question */}
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 500 } as any}
          >
            <VStack space={3}>
              <Text fontSize="xs" fontWeight="600" color="surface.400" letterSpacing={1.5}>
                INTERVIEWER'S QUESTION
              </Text>
              <Box px={4} py={3} borderRadius="xl" bg="surface.800" borderLeftWidth={3} borderLeftColor="surface.400">
                <Text fontSize="md" color="surface.200" fontStyle="italic">
                  "{question}"
                </Text>
              </Box>
            </VStack>
          </MotiView>

          {/* AI Answer Content */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 600, delay: 100 } as any}
          >
            <VStack space={4}>
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="xs" fontWeight="600" color="surface.300" letterSpacing={1.5}>
                  AI SUGGESTED ANSWER
                </Text>
                <Button
                  size="xs"
                  variant="ghost"
                  leftIcon={<Icon as={copied ? LucideCheck : LucideCopy} size="xs" color="primary.200" />}
                  onPress={handleCopy}
                  _text={{ color: 'primary.200', fontWeight: 'bold' }}
                >
                  {copied ? 'COPIED' : 'COPY ALL'}
                </Button>
              </HStack>

              <GlassCard p={6} bg="surface.600">
                <VStack space={6}>
                  {bullets.map((item, index) => (
                    <VStack key={index} space={2}>
                      <HStack space={4}>
                        <Text fontSize="lg" fontWeight="800" color="primary.200">
                          {(index + 1).toString().padStart(2, '0')}
                        </Text>
                        <Box flex={1}>
                          <Text fontSize="md" color="white" lineHeight="md">
                            {item.split('**').map((part, i) => 
                              i % 2 === 1 
                                ? <Text key={i} fontWeight="bold" color="primary.200">{part}</Text> 
                                : part
                            )}
                          </Text>
                        </Box>
                      </HStack>
                      {index < bullets.length - 1 && (
                        <Divider mt={4} bg="surface.400" opacity={0.1} />
                      )}
                    </VStack>
                  ))}
                </VStack>
              </GlassCard>
            </VStack>
          </MotiView>

          {/* Tips Section */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 800, delay: 300 } as any}
          >
            <Box p={4} borderRadius="xl" bg="rgba(15, 110, 240, 0.1)" borderWidth={1} borderColor="rgba(15, 110, 240, 0.2)">
              <HStack space={3} alignItems="center">
                <Icon as={LucideCheck} size="xs" color="primary.400" />
                <Text fontSize="xs" color="primary.200" flex={1}>
                  This draft is optimized for the "Professional & Confident" style you selected in settings.
                </Text>
              </HStack>
            </Box>
          </MotiView>
        </VStack>
      </ScrollView>

      {/* Bottom Action */}
      <Box px={6} pb={8} pt={4}>
        <Button
          variant="premium"
          size="lg"
          py={4}
          onPress={handleCopy}
          leftIcon={<Icon as={copied ? LucideCheck : LucideCopy} size="sm" color="white" />}
        >
          {copied ? 'COPIED TO CLIPBOARD' : 'COPY FULL DRAFT'}
        </Button>
      </Box>
    </Box>
  );
};
