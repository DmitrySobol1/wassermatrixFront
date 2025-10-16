import { useQuery } from '@tanstack/react-query';
import axios from '../axios';
import type { CashbackLevel } from '@/types/i18n.types';

/**
 * Response structure from the cashback API endpoint
 */
export interface CashbackResponse {
  cashbackBall: number;
  purchaseQty: number;
  totalSumInUserCurrency: number;
  valute: string;
  currentCashbackLevel: string;
  deltaToNextLevelInUserCurrency: number;
  currentPercent: string;
  sortedLevelsUserCurrency: CashbackLevel[];
}

/**
 * Fetch cashback data from the API
 * @param tlgid - Telegram user ID
 * @returns Promise with cashback data
 */
const fetchCashbackData = async (tlgid: number): Promise<CashbackResponse> => {
  const { data } = await axios.get('/user_get_orders', {
    params: { tlgid, payStatus: true },
  });

  console.log('Cashback data loaded:', data);
  return data;
};

/**
 * Custom hook for fetching and caching cashback data with React Query
 *
 * Features:
 * - Automatic caching (5 minutes fresh, 10 minutes cache)
 * - Background refetching every 2 minutes
 * - Automatic retry on errors (3 attempts with exponential backoff)
 * - Deduplication of simultaneous requests
 * - Loading and error states management
 *
 * @param tlgid - Telegram user ID (undefined if not available)
 * @returns Query result with data, loading, error states and refetch function
 *
 * @example
 * const { data, isLoading, error, refetch, isFetching } = useCashbackData(tlgid);
 *
 * if (isLoading) return <Spinner />;
 * if (error) return <Error onRetry={refetch} />;
 *
 * return (
 *   <div>
 *     {isFetching && <Badge>Updating...</Badge>}
 *     <div>Cashback: {data.cashbackBall}</div>
 *   </div>
 * );
 */
export const useCashbackData = (tlgid: number | undefined) => {
  return useQuery<CashbackResponse>({
    // Unique query key for caching
    // This creates separate cache entries for different users
    queryKey: ['cashback', tlgid],

    // Function to fetch data
    queryFn: () => {
      if (!tlgid) {
        throw new Error('Telegram ID is required to fetch cashback data');
      }
      return fetchCashbackData(tlgid);
    },

    // Only run query if tlgid is available
    enabled: !!tlgid,

    // Data is considered fresh for 5 minutes
    // During this time, cached data is returned immediately
    staleTime: 5 * 60 * 1000,

    // Cache persists for 10 minutes after last component using it unmounts
    gcTime: 10 * 60 * 1000, // cacheTime is now gcTime in v5

    // Automatically refetch in background every 2 minutes
    // This keeps data fresh while user is on the page
    refetchInterval: 2 * 60 * 1000,

    // Retry failed requests 3 times
    retry: 3,

    // Exponential backoff for retries: 1s, 2s, 4s, max 30s
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
