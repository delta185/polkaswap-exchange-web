import { defineMutations } from 'direct-vuex';

import type { VaultState } from './types';
import type { FPNumber } from '@sora-substrate/math';
import type { AccountBalance } from '@sora-substrate/util/build/assets/types';
import type { Collateral, Vault } from '@sora-substrate/util/build/kensetsu/types';
import type { Subscription } from 'rxjs';

const mutations = defineMutations<VaultState>()({
  setCollaterals(state, collaterals: Record<string, Collateral>): void {
    state.collaterals = collaterals;
  },
  resetCollaterals(state): void {
    state.collaterals = {};
  },
  setCollateralsInterval(state, interval: ReturnType<typeof setInterval>): void {
    state.collateralsInterval = interval;
  },
  resetCollateralsInterval(state): void {
    if (state.collateralsInterval) {
      clearInterval(state.collateralsInterval);
    }
    state.collateralsInterval = null;
  },
  setAccountVaultIdsSubscription(state, subscription: Subscription): void {
    state.accountVaultIdsSubscription = subscription;
  },
  resetAccountVaultIdsSubscription(state): void {
    state.accountVaultIdsSubscription?.unsubscribe();
    state.accountVaultIdsSubscription = null;
  },
  setAccountVaults(state, accountVaults: Vault[]): void {
    state.accountVaults = accountVaults;
  },
  resetAccountVaults(state): void {
    state.accountVaults = [];
  },
  setAccountVaultsSubscription(state, subscription: Subscription): void {
    state.accountVaultsSubscription = subscription;
  },
  resetAccountVaultsSubscription(state): void {
    state.accountVaultsSubscription?.unsubscribe();
    state.accountVaultsSubscription = null;
  },
  setCollateralAddress(state, address: string): void {
    state.collateralAddress = address;
  },
  setCollateralTokenBalance(state, balance?: Nullable<AccountBalance>): void {
    state.collateralTokenBalance = balance ?? null;
  },
  setKusdTokenBalance(state, balance?: Nullable<AccountBalance>): void {
    state.kusdTokenBalance = balance ?? null;
  },
  setAverageCollateralPrice(state, price?: Nullable<FPNumber>): void {
    state.averageCollateralPrice = price ?? null;
  },
  setAverageCollateralPriceSubscription(state, subscription?: Nullable<Subscription>): void {
    if (!subscription) {
      state.averageCollateralPriceSubscription?.unsubscribe();
    }
    state.averageCollateralPriceSubscription = subscription;
  },
});

export default mutations;
