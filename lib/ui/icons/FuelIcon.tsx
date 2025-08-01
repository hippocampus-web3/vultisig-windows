import { SvgProps } from '@lib/ui/props'
import { FC } from 'react'

export const FuelIcon: FC<SvgProps> = props => (
  <svg
    fill="none"
    height="1em"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <path d="M3 22H15M4 9H14M14 22V4C14 3.46957 13.7893 2.96086 13.4142 2.58579C13.0391 2.21071 12.5304 2 12 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V22M14 13H16C16.5304 13 17.0391 13.2107 17.4142 13.5858C17.7893 13.9609 18 14.4696 18 15V17C18 17.5304 18.2107 18.0391 18.5858 18.4142C18.9609 18.7893 19.4696 19 20 19C20.5304 19 21.0391 18.7893 21.4142 18.4142C21.7893 18.0391 22 17.5304 22 17V9.83C22.0002 9.56609 21.9482 9.30474 21.8469 9.06103C21.7457 8.81732 21.5972 8.59606 21.41 8.41L18 5" />
  </svg>
)
