import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { useCore } from '@core/ui/state/core'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { useTransformQueriesData } from '@lib/ui/query/hooks/useTransformQueriesData'
import {
  noPersistQueryOptions,
  noRefetchQueryOptions,
} from '@lib/ui/query/utils/options'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'
import { withoutDuplicates } from '@lib/utils/array/withoutDuplicates'
import { sortEntitiesWithOrder } from '@lib/utils/entities/EntityWithOrder'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { getVaultId, Vault, VaultKeyShares } from '../vault/Vault'
import { StorageKey } from './StorageKey'

export type UpdateVaultInput = {
  vaultId: string
  fields: Partial<Vault>
}

export const vaultsInitialValue: Vault[] = []

type CreateVaultFunction = (vault: Vault) => Promise<Vault>

export type UpdateVaultFunction = (input: UpdateVaultInput) => Promise<Vault>

type GetVaultsFunction = () => Promise<Vault[]>

type DeleteVaultFunction = (vaultId: string) => Promise<void>

type UpdateVaultsKeyShares = (
  value: Record<string, VaultKeyShares>
) => Promise<void>

export type VaultsStorage = {
  getVaults: GetVaultsFunction
  createVault: CreateVaultFunction
  updateVault: UpdateVaultFunction
  deleteVault: DeleteVaultFunction
  updateVaultsKeyShares: UpdateVaultsKeyShares
}

type MergeVaultsWithCoinsInput = {
  vaults: Vault[]
  coins: Record<string, AccountCoin[]>
}

const mergeVaultsWithCoins = ({ vaults, coins }: MergeVaultsWithCoinsInput) => {
  return sortEntitiesWithOrder(vaults).map(vault => {
    const vaultCoins = coins[getVaultId(vault)] ?? []
    const vaultChains = vaultCoins.filter(isFeeCoin).map(coin => coin.chain)

    return {
      ...vault,
      coins: vaultCoins.filter(coin => vaultChains.includes(coin.chain)),
    }
  })
}

export const { useValue: useVaults, provider: VaultsProvider } =
  getValueProviderSetup<(Vault & { coins: AccountCoin[] })[]>('VaultsProvider')

export const useVaultsQuery = () => {
  const { getVaults, getCoins } = useCore()

  const vaults = useQuery({
    queryKey: [StorageKey.vaults],
    queryFn: getVaults,
    ...noPersistQueryOptions,
    ...noRefetchQueryOptions,
  })

  const coins = useQuery({
    queryKey: [StorageKey.vaultsCoins],
    queryFn: getCoins,
    ...noPersistQueryOptions,
    ...noRefetchQueryOptions,
  })

  return useTransformQueriesData(
    useMemo(
      () => ({
        vaults,
        coins,
      }),
      [vaults, coins]
    ),
    mergeVaultsWithCoins
  )
}

export const useFolderlessVaults = () => {
  const vaults = useVaults()

  return useMemo(() => vaults.filter(({ folderId }) => !folderId), [vaults])
}

export const useFolderVaults = (folderId: string) => {
  const vaults = useVaults()

  return useMemo(
    () => vaults.filter(vault => vault.folderId === folderId),
    [vaults, folderId]
  )
}

export const useVaultNames = () => {
  const vaults = useVaults()

  return useMemo(() => withoutDuplicates(vaults.map(v => v.name)), [vaults])
}

export const useVaultOrders = () => {
  const vaults = useVaults()

  return useMemo(() => vaults.map(v => v.order), [vaults])
}

export const useDeleteVaultMutation = () => {
  const { deleteVault } = useCore()
  const invalidateQueries = useInvalidateQueries()

  const mutationFn: DeleteVaultFunction = async input => {
    await deleteVault(input)
    await invalidateQueries([StorageKey.vaults])
  }

  return useMutation({
    mutationFn,
  })
}
