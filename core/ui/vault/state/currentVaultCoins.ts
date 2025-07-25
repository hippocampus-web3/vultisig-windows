import { Chain } from '@core/chain/Chain'
import { areEqualCoins, CoinKey } from '@core/chain/coin/Coin'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { groupItems } from '@lib/utils/array/groupItems'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useMemo } from 'react'

import { useCurrentVault } from './currentVault'

export const useCurrentVaultCoins = () => {
  const { coins } = useCurrentVault()

  return coins ?? []
}

export const useCurrentVaultNativeCoins = () => {
  const coins = useCurrentVaultCoins()

  return useMemo(() => coins.filter(isFeeCoin), [coins])
}

export const useCurrentVaultChains = () => {
  const nativeCoins = useCurrentVaultNativeCoins()

  return useMemo(() => nativeCoins.map(coin => coin.chain), [nativeCoins])
}

export const useCurrentVaultCoinsByChain = () => {
  const coins = useCurrentVaultCoins()

  return useMemo(() => {
    return groupItems(coins, coin => coin.chain as Chain)
  }, [coins])
}

export const useCurrentVaultAddresses = () => {
  const coins = useCurrentVaultNativeCoins()

  return useMemo(() => {
    return Object.fromEntries(
      coins.map(coin => [coin.chain, coin.address])
    ) as Record<Chain, string>
  }, [coins])
}

export const useCurrentVaultAddress = (chain: string) => {
  const addresses = useCurrentVaultAddresses()

  return shouldBePresent(addresses[chain as Chain])
}

export const useCurrentVaultChainCoins = (chain: string) => {
  const coins = useCurrentVaultCoins()

  return useMemo(
    () => coins.filter(coin => coin.chain === chain),
    [chain, coins]
  )
}

export const useCurrentVaultCoin = (coinKey: CoinKey) => {
  const coins = useCurrentVaultCoins()

  return shouldBePresent(coins.find(coin => areEqualCoins(coin, coinKey)))
}
