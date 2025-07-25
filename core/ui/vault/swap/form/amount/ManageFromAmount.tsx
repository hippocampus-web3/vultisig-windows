import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { AmountSuggestion } from '@core/ui/vault/send/amount/AmountSuggestion'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { AmountTextInput } from '@lib/ui/inputs/AmountTextInput'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { useCallback, useState } from 'react'
import styled from 'styled-components'

import { useCoreViewState } from '../../../../navigation/hooks/useCoreViewState'
import { useFromAmount } from '../../state/fromAmount'
import { SwapCoinBalanceDependant } from '../balance/SwapCoinBalanceDependant'
import { AmountContainer } from './AmountContainer'
import { SwapFiatAmount } from './SwapFiatAmount'

const suggestions = [0.25, 0.5, 1]

export const ManageFromAmount = () => {
  const [value, setValue] = useFromAmount()
  const [{ coin: fromCoinKey }] = useCoreViewState<'swap'>()
  const valueAsString = value?.toString() ?? ''
  const [inputValue, setInputValue] = useState<string>(valueAsString)

  const swapCoin = useCurrentVaultCoin(fromCoinKey)
  const { decimals } = swapCoin

  const handleInputValueChange = useCallback(
    (value: string) => {
      value = value.replace(/-/g, '')

      if (value === '') {
        setInputValue('')
        if (value !== inputValue) setValue?.(null)
        return
      }

      const valueAsNumber = parseFloat(value)
      if (isNaN(valueAsNumber)) {
        return
      }

      setInputValue(
        valueAsNumber.toString() !== value ? value : valueAsNumber.toString()
      )
      setValue?.(valueAsNumber)
    },
    [inputValue, setValue]
  )

  return (
    <VStack gap={4} alignItems="flex-end">
      <AmountContainer gap={6} alignItems="flex-end">
        <PositionedAmountInput
          type="number"
          placeholder={'0'}
          onWheel={event => event.currentTarget.blur()}
          value={value}
          onChange={e => handleInputValueChange(e.target.value)}
        />
        {value !== null && (
          <SwapFiatAmount value={{ amount: value, ...fromCoinKey }} />
        )}
      </AmountContainer>
      <SwapCoinBalanceDependant
        coin={swapCoin}
        pending={() => null}
        error={() => null}
        success={amount => (
          <HStack alignItems="center" gap={4}>
            {suggestions.map(suggestion => (
              <AmountSuggestion
                onClick={() =>
                  handleInputValueChange(
                    String(fromChainAmount(amount, decimals) * suggestion)
                  )
                }
                key={suggestion}
                value={suggestion}
              />
            ))}
          </HStack>
        )}
      />
    </VStack>
  )
}

const PositionedAmountInput = styled(AmountTextInput)`
  text-align: right;
  border: none;
  font-family: inherit;
  &:hover {
    outline: none;
  }
  &::placeholder {
    font-size: 18px;
  }
`
