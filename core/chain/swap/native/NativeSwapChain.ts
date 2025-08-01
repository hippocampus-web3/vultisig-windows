import { Chain } from '@core/chain/Chain'
import { cosmosRpcUrl } from '@core/chain/chains/cosmos/cosmosRpcUrl'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { withoutDuplicates } from '@lib/utils/array/withoutDuplicates'

export const nativeSwapChains = [Chain.THORChain, Chain.MayaChain] as const
export type NativeSwapChain = (typeof nativeSwapChains)[number]

export const nativeSwapStreamingInterval: Record<NativeSwapChain, number> = {
  [Chain.THORChain]: 1,
  [Chain.MayaChain]: 3,
}

export const nativeSwapApiBaseUrl: Record<NativeSwapChain, string> = {
  [Chain.THORChain]: `${cosmosRpcUrl[Chain.THORChain]}/thorchain`,
  [Chain.MayaChain]: `${cosmosRpcUrl[Chain.MayaChain]}/mayachain`,
}

const thorChainSwapEnabledChains = [
  Chain.Avalanche,
  Chain.BitcoinCash,
  Chain.BSC,
  Chain.Bitcoin,
  Chain.Dogecoin,
  Chain.Ethereum,
  Chain.Cosmos,
  Chain.Litecoin,
  Chain.THORChain,
  Chain.Ripple,
  Chain.Base,
] as const

export const nativeSwapEnabledChainsRecord = {
  [Chain.THORChain]: thorChainSwapEnabledChains,
  [Chain.MayaChain]: [
    Chain.MayaChain,
    Chain.THORChain,
    Chain.Kujira,
    Chain.Ethereum,
    Chain.Dash,
    Chain.Bitcoin,
    Chain.Arbitrum,
    Chain.Zcash,
  ],
} as const

type NativeSwapEnabledChain =
  (typeof nativeSwapEnabledChainsRecord)[NativeSwapChain][number]

export const nativeSwapEnabledChains = withoutDuplicates(
  Object.values(nativeSwapEnabledChainsRecord).flatMap(value => value)
) as NativeSwapEnabledChain[]

export const nativeSwapChainIds: Record<NativeSwapEnabledChain, string> = {
  [Chain.Avalanche]: 'AVAX',
  [Chain.BitcoinCash]: 'BCH',
  [Chain.BSC]: 'BSC',
  [Chain.Bitcoin]: 'BTC',
  [Chain.Dogecoin]: 'DOGE',
  [Chain.Ethereum]: 'ETH',
  [Chain.Cosmos]: 'GAIA',
  [Chain.Litecoin]: 'LTC',
  [Chain.THORChain]: 'THOR',
  [Chain.MayaChain]: 'MAYA',
  [Chain.Kujira]: 'KUJI',
  [Chain.Dash]: 'DASH',
  [Chain.Arbitrum]: 'ARB',
  [Chain.Zcash]: 'ZEC',
  [Chain.Ripple]: 'XRP',
  [Chain.Base]: 'BASE',
}

export type NativeSwapPayloadCase = Extract<
  NonNullable<KeysignPayload['swapPayload']['case']>,
  'thorchainSwapPayload' | 'mayachainSwapPayload'
>

export const nativeSwapPayloadCase: Record<
  NativeSwapChain,
  NativeSwapPayloadCase
> = {
  [Chain.THORChain]: 'thorchainSwapPayload',
  [Chain.MayaChain]: 'mayachainSwapPayload',
}
