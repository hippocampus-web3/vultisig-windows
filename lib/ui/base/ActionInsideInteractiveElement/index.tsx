import { ActionProp } from '@lib/ui/props'
import { Dimensions } from '@lib/utils/entities/Dimensions'
import { ComponentProps, CSSProperties, ReactNode, Ref } from 'react'
import styled from 'styled-components'

import { ElementSizeAware } from '../ElementSizeAware'

type ActionInsideInteractiveElementRenderParams<
  T extends CSSProperties = CSSProperties,
> = {
  actionSize: Dimensions
  actionPlacerStyles: T
}

const Container = styled.div`
  position: relative;
`

type ActionInsideInteractiveElementProps<
  T extends CSSProperties = CSSProperties,
> = ComponentProps<typeof Container> &
  ActionProp & {
    render: (params: ActionInsideInteractiveElementRenderParams<T>) => ReactNode
    actionPlacerStyles: T
    ref?: Ref<HTMLDivElement>
  }

const ActionPlacer = styled.div`
  position: absolute;
`

export function ActionInsideInteractiveElement<
  T extends CSSProperties = CSSProperties,
>({
  render,
  action,
  actionPlacerStyles,
  ...rest
}: ActionInsideInteractiveElementProps<T>) {
  return (
    <Container {...rest}>
      <ElementSizeAware
        render={({ setElement, size }) => (
          <>
            {render({
              actionPlacerStyles,
              actionSize: size ?? { width: 0, height: 0 },
            })}
            <ActionPlacer
              ref={setElement}
              style={{ opacity: size ? 1 : 0, ...actionPlacerStyles }}
            >
              {action}
            </ActionPlacer>
          </>
        )}
      />
    </Container>
  )
}
