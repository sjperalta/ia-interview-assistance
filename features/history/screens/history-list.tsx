import React, { useCallback } from 'react';
import { Box, Center, HStack, Icon, IconButton, Pressable, Spinner, Text, VStack } from 'native-base';
import { useRouter } from 'expo-router';
import { LucideRefreshCw, LucideTrash2, LucideChevronRight } from 'lucide-react-native';
import { GlassCard } from '#root/ui/atoms/glass-card';
import { useHistory } from '../hooks/use-history';

export function HistoryListScreen() {
  const router = useRouter();
  const { items, isLoading, error, refresh, clear } = useHistory();

  const open = useCallback(
    (id: string) => {
      router.push(`/history/${encodeURIComponent(id)}`);
    },
    [router],
  );

  return (
    <Box flex={1} bg="surface.900" safeArea>
      <HStack px={6} py={4} justifyContent="space-between" alignItems="center">
        <Text fontSize="xl" fontWeight="800" letterSpacing={-0.5} color="primary.200">
          HISTORY
        </Text>
        <HStack space={2}>
          <IconButton
            accessibilityLabel="Refresh history"
            icon={<Icon as={LucideRefreshCw} size="sm" color="primary.200" />}
            variant="ghost"
            borderRadius="full"
            onPress={() => void refresh()}
          />
          <IconButton
            accessibilityLabel="Clear history"
            icon={<Icon as={LucideTrash2} size="sm" color="surface.300" />}
            variant="ghost"
            borderRadius="full"
            onPress={() => void clear()}
          />
        </HStack>
      </HStack>

      <Box flex={1} px={6} pt={2}>
        {isLoading ? (
          <Center flex={1}>
            <Spinner color="primary.200" />
          </Center>
        ) : error ? (
          <Center flex={1}>
            <Text color="surface.300">{error}</Text>
          </Center>
        ) : items.length === 0 ? (
          <Center flex={1}>
            <Text color="surface.300">No saved answers yet.</Text>
          </Center>
        ) : (
          <VStack space={4} pb={6}>
            {items.map((item) => (
              <Pressable key={item.id} onPress={() => open(item.id)}>
                <GlassCard p={5}>
                  <HStack space={3} alignItems="center">
                    <VStack flex={1} space={1}>
                      <Text color="white" fontWeight="700" numberOfLines={2}>
                        {item.question}
                      </Text>
                      <Text fontSize="xs" color="surface.400">
                        {new Date(item.createdAt).toLocaleString()}
                      </Text>
                    </VStack>
                    <Icon as={LucideChevronRight} size="sm" color="surface.300" />
                  </HStack>
                </GlassCard>
              </Pressable>
            ))}
          </VStack>
        )}
      </Box>
    </Box>
  );
}

