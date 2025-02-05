<template>
  <div>
    <synthetic-switcher v-model="isSynthsOnly" />
    <s-table
      ref="table"
      v-loading="loadingState"
      :data="tableItems"
      :highlight-current-row="false"
      size="small"
      class="explore-table"
    >
      <!-- Index -->
      <s-table-column width="280" label="#">
        <template #header>
          <div class="explore-table-item-index">
            <span @click="handleResetSort" :class="['explore-table-item-index--head', { active: isDefaultSort }]">
              #
            </span>
          </div>
          <div class="explore-table-item-logo">
            <s-icon name="various-bone-24" size="14px" class="explore-table-item-logo--head" />
          </div>
          <div class="explore-table-item-info explore-table-item-info--head">
            <span class="explore-table__primary">{{ t('nameText') }}</span>
            <span class="explore-table__secondary">({{ t('tokens.assetId') }})</span>
          </div>
        </template>
        <template v-slot="{ $index, row }">
          <span class="explore-table-item-index explore-table-item-index--body">{{ $index + startIndex + 1 }}</span>
          <token-logo class="explore-table-item-logo" :token-symbol="row.symbol" />
          <div class="explore-table-item-info explore-table-item-info--body">
            <div class="explore-table-item-name">{{ row.symbol }}</div>
            <div class="explore-table__secondary explore-table__token-name">{{ row.name }}</div>
            <div class="explore-table-item-address">
              <token-address
                class="explore-table-item-address__value"
                :show-name="false"
                :name="row.name"
                :symbol="row.symbol"
                :address="row.address"
              />
            </div>
          </div>
        </template>
      </s-table-column>
      <!-- Price -->
      <s-table-column key="price" width="130" header-align="left" align="left">
        <template #header>
          <sort-button name="price" :sort="{ order, property }" @change-sort="changeSort">
            <span class="explore-table__primary">Price</span>
          </sort-button>
        </template>
        <template v-slot="{ row }">
          <formatted-amount
            is-fiat-value
            fiat-default-rounding
            :font-weight-rate="FontWeightRate.MEDIUM"
            :value="row.priceFormatted"
            class="explore-table-item-price"
          />
        </template>
      </s-table-column>

      <template v-if="hasTokensData">
        <!-- 1D Price Change -->
        <s-table-column width="104" header-align="right" align="right">
          <template #header>
            <sort-button name="priceChangeDay" :sort="{ order, property }" @change-sort="changeSort">
              <span class="explore-table__primary">1D %</span>
            </sort-button>
          </template>
          <template v-slot="{ row }">
            <price-change :value="row.priceChangeDayFP" />
          </template>
        </s-table-column>
        <!-- 7D Price Change -->
        <s-table-column width="104" header-align="left" align="left">
          <template #header>
            <sort-button name="priceChangeWeek" :sort="{ order, property }" @change-sort="changeSort">
              <span class="explore-table__primary">7D %</span>
            </sort-button>
          </template>
          <template v-slot="{ row }">
            <price-change :value="row.priceChangeWeekFP" />
          </template>
        </s-table-column>
        <!-- 1D Volume -->
        <s-table-column width="104" header-align="right" align="right">
          <template #header>
            <sort-button name="volumeDay" :sort="{ order, property }" @change-sort="changeSort">
              <span class="explore-table__primary">1D Vol.</span>
            </sort-button>
          </template>
          <template v-slot="{ row }">
            <formatted-amount
              is-fiat-value
              :font-weight-rate="FontWeightRate.MEDIUM"
              :value="row.volumeDayFormatted.amount"
              class="explore-table-item-price explore-table-item-amount"
            >
              {{ row.volumeDayFormatted.suffix }}
            </formatted-amount>
          </template>
        </s-table-column>
        <!-- TVL -->
        <s-table-column width="104" header-align="right" align="right">
          <template #header>
            <sort-button name="tvl" :sort="{ order, property }" @change-sort="changeSort">
              <span class="explore-table__primary">{{ TranslationConsts.TVL }}</span>
              <s-tooltip border-radius="mini" :content="t('tooltips.tvl')">
                <s-icon name="info-16" size="14px" />
              </s-tooltip>
            </sort-button>
          </template>
          <template v-slot="{ row }">
            <formatted-amount
              is-fiat-value
              :font-weight-rate="FontWeightRate.MEDIUM"
              :value="row.tvlFormatted.amount"
              class="explore-table-item-price explore-table-item-amount"
            >
              {{ row.tvlFormatted.suffix }}
            </formatted-amount>
          </template>
        </s-table-column>
        <!-- Velocity -->
        <s-table-column width="88" header-align="right" align="right">
          <template #header>
            <sort-button name="velocity" :sort="{ order, property }" @change-sort="changeSort">
              <span class="explore-table__primary">VC.</span>
              <s-tooltip border-radius="mini">
                <s-icon name="info-16" size="14px" />
                <template #content>
                  <div>{{ t('tooltips.velocity') }}</div>
                  <br />
                  <span style="font-weight: 500">Velocity = Trading Volume USD / Market Cap USD</span>
                </template>
              </s-tooltip>
            </sort-button>
          </template>
          <template v-slot="{ row }">
            <formatted-amount
              :font-weight-rate="FontWeightRate.MEDIUM"
              :value="row.velocityFormatted"
              class="explore-table-item-price explore-table-item-amount"
            />
          </template>
        </s-table-column>
      </template>
    </s-table>

    <history-pagination
      class="explore-table-pagination"
      :current-page="currentPage"
      :page-amount="pageAmount"
      :total="total"
      :last-page="lastPage"
      :loading="loadingState"
      @pagination-click="handlePaginationClick"
    />
  </div>
</template>

<script lang="ts">
import { FPNumber } from '@sora-substrate/util';
import { components } from '@soramitsu/soraneo-wallet-web';
import { SortDirection } from '@soramitsu-ui/ui-vue2/lib/components/Table/consts';
import { Component, Mixins } from 'vue-property-decorator';

import ExplorePageMixin from '@/components/mixins/ExplorePageMixin';
import { Components, ZeroStringValue } from '@/consts';
import { fetchTokensData } from '@/indexer/queries/assets';
import type { TokenData } from '@/indexer/queries/assets';
import { lazyComponent } from '@/router';
import type { AmountWithSuffix } from '@/types/formats';
import { formatAmountWithSuffix, sortAssets } from '@/utils';
import { syntheticAssetRegexp } from '@/utils/regexp';
import storage from '@/utils/storage';

import type { Asset } from '@sora-substrate/util/build/assets/types';

type TableItem = {
  price: number;
  priceFormatted: string;
  priceChangeDay?: number;
  priceChangeDayFP?: FPNumber;
  priceChangeWeek?: number;
  priceChangeWeekFP?: FPNumber;
  volumeDay?: number;
  volumeDayFormatted?: AmountWithSuffix;
  tvl?: number;
  tvlFormatted?: AmountWithSuffix;
  // mcap: number;
  // mcapFormatted: AmountWithSuffix;
  velocity?: number;
  velocityFormatted?: string;
} & Asset;

const storageKey = 'exploreSyntheticTokens';

@Component({
  components: {
    SyntheticSwitcher: components.SyntheticSwitcher,
    PriceChange: lazyComponent(Components.PriceChange),
    SortButton: lazyComponent(Components.SortButton),
    TokenAddress: components.TokenAddress,
    TokenLogo: components.TokenLogo,
    FormattedAmount: components.FormattedAmount,
    HistoryPagination: components.HistoryPagination,
  },
})
export default class Tokens extends Mixins(ExplorePageMixin) {
  private isSynths = storage.get(storageKey) ? JSON.parse(storage.get(storageKey)) : false;

  get isSynthsOnly(): boolean {
    return this.isSynths;
  }

  set isSynthsOnly(value: boolean) {
    storage.set(storageKey, value);
    this.isSynths = value;
  }

  private tokensData: Record<string, TokenData> = {};

  get hasTokensData(): boolean {
    return Object.keys(this.tokensData).length !== 0;
  }

  get items(): TableItem[] {
    if (!this.hasTokensData) {
      return this.allowedAssets.map((asset) => {
        const price = FPNumber.fromCodecValue(this.getAssetFiatPrice(asset) ?? ZeroStringValue);

        return {
          ...asset,
          price: price.toNumber(),
          priceFormatted: price.toLocaleString(7),
        };
      });
    }

    return Object.entries(this.tokensData).reduce<TableItem[]>((buffer, [address, tokenData]) => {
      const asset = this.getAsset(address);

      if (!asset) return buffer;

      buffer.push({
        ...asset,
        price: tokenData.priceUSD.toNumber(),
        priceFormatted: tokenData.priceUSD.toLocaleString(7),
        priceChangeDay: tokenData.priceChangeDay.toNumber(),
        priceChangeDayFP: tokenData.priceChangeDay,
        priceChangeWeek: tokenData.priceChangeWeek.toNumber(),
        priceChangeWeekFP: tokenData.priceChangeWeek,
        volumeDay: tokenData.volumeDayUSD.toNumber(),
        volumeDayFormatted: formatAmountWithSuffix(tokenData.volumeDayUSD),
        tvl: tokenData.tvlUSD.toNumber(),
        tvlFormatted: formatAmountWithSuffix(tokenData.tvlUSD),
        velocity: tokenData.velocity.toNumber(),
        velocityFormatted: String(tokenData.velocity.toNumber(2)),
      });

      return buffer;
    }, []);
  }

  get defaultSorted(): TableItem[] {
    return [...this.items].sort((a, b) => sortAssets(a, b));
  }

  get prefilteredItems(): TableItem[] {
    return this.isSynthsOnly
      ? this.defaultSorted.filter((item) => syntheticAssetRegexp.test(item.address))
      : this.defaultSorted;
  }

  // ExplorePageMixin method implementation
  async updateExploreData(): Promise<void> {
    await this.withLoading(async () => {
      await this.withParentLoading(async () => {
        this.tokensData = Object.freeze(await fetchTokensData(this.allowedAssets));
      });
    });
  }
}
</script>

<style lang="scss">
@include explore-table;
</style>

<style lang="scss" scoped>
.explore-table__token-name {
  max-width: 155px;
  overflow-x: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
