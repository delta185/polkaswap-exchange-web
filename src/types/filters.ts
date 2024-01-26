import type { SnapshotTypes } from '@soramitsu/soraneo-wallet-web/lib/services/indexer/types';

export enum Timeframes {
  FIVE_MINUTES = 'FIVE_MINUTES',
  FIFTEEN_MINUTES = 'FIFTEEN_MINUTES',
  THIRTY_MINUTES = 'THIRTY_MINUTES',
  HOUR = 'HOUR',
  FOUR_HOURS = 'FOUR_HOURS',
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  QUARTER = 'QUARTER',
  HALF_YEAR = 'HALF_YEAR',
  YEAR = 'YEAR',
  ALL = 'ALL',
}

export type TimeframeFilter = {
  name: Timeframes;
  label: string;
  type: SnapshotTypes;
  group?: number;
};

export type SnapshotFilter = TimeframeFilter & {
  count: number;
};
