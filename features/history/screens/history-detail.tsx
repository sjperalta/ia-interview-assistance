import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, HStack, Icon, IconButton, ScrollView, Text, VStack } from 'native-base';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LucideArrowLeft, LucideCopy, LucideTrash2 } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { GlassCard } from '#root/ui/atoms/glass-card';
import type { HistoryItem } from '../types/history-item';
import { historyRepo } from '../services/history-repo';

export function HistoryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const decodedId = useMemo(() => (id ? decodeURIComponent(String(id)) : ''), [id]);

  const [item, setItem] = useState<HistoryItem | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const all = await historyRepo.list();
      const found = all.find((x) => x.id === decodedId) ?? null;
      if (isMounted) setItem(found);
    })();
    return () => {
      isMounted = false;
    };
  }, [decodedId]);

  const goBack = useCallback(() => router.back(), [router]);

  const copyAll = useCallback(async () => {
    if (!item) return;
    const text = [
      `Question: ${item.question}`,
      '',
      'Suggested Answer:',
      ...item.answerBullets.map((b) => `- ${b}`),
    ].join('\n');
    await Clipboard.setStringAsync(text);
  }, [item]);

  const remove = useCallback(async () => {
    if (!item) return;
    await historyRepo.remove(item.id);
    router.back();
  }, [item, router]);

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
          DETAIL
        </Text>
        <HStack space={1}>
          <IconButton
            accessibilityLabel="Copy"
            icon={<Icon as={LucideCopy} size="sm" color="primary.200" />}
            variant="ghost"
            borderRadius="full"
            onPress={() => void copyAll()}
          />
          <IconButton
            accessibilityLabel="Delete"
            icon={<Icon as={LucideTrash2} size="sm" color="surface.300" />}
            variant="ghost"
            borderRadius="full"
            onPress={() => void remove()}
          />
        </HStack>
      </HStack>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24 }}>
        {!item ? (
          <Text color="surface.300">Not found.</Text>
        ) : (
          <VStack space={6}>
            <VStack space={2}>
              <Text fontSize="xs" fontWeight="600" color="surface.300" letterSpacing={1.5}>
                QUESTION
              </Text>
              <GlassCard p={6} borderLeftWidth={2} borderLeftColor="primary.500">
                <Text color="white" fontSize="md" lineHeight="md">
                  {item.question}
                </Text>
              </GlassCard>
            </VStack>

            <VStack space={2}>
              <Text fontSize="xs" fontWeight="600" color="surface.300" letterSpacing={1.5}>
                SUGGESTED ANSWER
              </Text>
              <GlassCard p={6} bg="surface.600">
                <VStack space={4}>
                  {item.answerBullets.map((b, idx) => (
                    <HStack key={idx} space={3} alignItems="flex-start">
                      <Text color="primary.200" fontWeight="800">
                        {(idx + 1).toString().padStart(2, '0')}
                      </Text>
                      <Text color="white" flex={1}>
                        {b}
                      </Text>
                    </HStack>
                  ))}
                </VStack>
              </GlassCard>
            </VStack>
          </VStack>
        )}
      </ScrollView>
    </Box>
  );
}

