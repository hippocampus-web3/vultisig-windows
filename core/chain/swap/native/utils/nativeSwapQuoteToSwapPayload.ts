import { create } from '@bufbuild/protobuf'
import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { CommKeysignSwapPayload } from '@core/mpc/keysign/swap/KeysignSwapPayload'
import { toCommCoin } from '@core/mpc/types/utils/commCoin'
import { THORChainSwapPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/thorchain_swap_payload_pb'
import { convertDuration } from '@lib/utils/time/convertDuration'
import { addMinutes } from 'date-fns'

import { nativeSwapDecimals } from '../config'
import {
  nativeSwapPayloadCase,
  nativeSwapStreamingInterval,
} from '../NativeSwapChain'
import { NativeSwapQuote } from '../NativeSwapQuote'

type Input = {
  quote: NativeSwapQuote
  fromCoin: AccountCoin & { hexPublicKey: string }
  toCoin: AccountCoin & { hexPublicKey: string }
  amount: bigint
}

export const nativeSwapQuoteToSwapPayload = ({
  quote,
  fromCoin,
  amount,
  toCoin,
}: Input): CommKeysignSwapPayload => {
  const isAffiliate = !!quote.fees.affiliate && Number(quote.fees.affiliate) > 0

  const streamingInterval = nativeSwapStreamingInterval[quote.swapChain]

  return {
    case: nativeSwapPayloadCase[quote.swapChain],
    value: create(THORChainSwapPayloadSchema, {
      fromAddress: fromCoin.address,
      fromCoin: toCommCoin(fromCoin),
      toCoin: toCommCoin(toCoin),
      vaultAddress: quote.inbound_address ?? fromCoin.address,
      routerAddress: quote.router,
      fromAmount: amount.toString(),
      toAmountDecimal: fromChainAmount(
        quote.expected_amount_out,
        nativeSwapDecimals
      ).toFixed(nativeSwapDecimals),
      expirationTime: BigInt(
        Math.round(
          convertDuration(addMinutes(Date.now(), 15).getTime(), 'ms', 's')
        )
      ),
      streamingInterval: streamingInterval.toString(),
      streamingQuantity: '0',
      toAmountLimit: '0',
      isAffiliate,
    }),
  }
}
