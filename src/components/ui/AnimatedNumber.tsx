import CountUp from 'react-countup'

interface Props {
  value: number
  format: (n: number) => string
  duration?: number
  className?: string
}

/** Eased count-up that animates between value changes. */
export default function AnimatedNumber({ value, format, duration = 1.3, className }: Props) {
  return (
    <CountUp
      className={className}
      end={value}
      duration={duration}
      preserveValue
      useEasing
      formattingFn={format}
    />
  )
}
