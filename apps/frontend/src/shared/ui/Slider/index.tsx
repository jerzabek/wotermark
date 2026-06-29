import { css, cx } from '@shadow-panda/styled-system/css'

import { Label } from '@/shared/ui'

type SliderProps = {
  id: string
  label: string
  value: number
  min: number
  max: number
  step?: number
  /** Accessible/visible formatting of the current value, e.g. "50%". */
  formatValue?: (value: number) => string
  onChange: (value: number) => void
}

/** Accessible range input styled with the native accent color. */
export const Slider = ({ id, label, value, min, max, step = 1, formatValue, onChange }: SliderProps) => {
  const display = formatValue ? formatValue(value) : String(value)

  return (
    <div className={css({ w: '100%' })}>
      <div className={css({ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' })}>
        <Label htmlFor={id} className={css({ fontSize: 'sm', color: 'gray.600', _dark: { color: 'gray.400' } })}>
          {label}
        </Label>
        <span
          aria-hidden="true"
          className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.700', _dark: { color: 'gray.300' } })}
        >
          {display}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={display}
        onChange={e => onChange(Number(e.target.value))}
        className={cx(
          'wm-slider',
          css({
            w: '100%',
            cursor: 'pointer',
            accentColor: 'wmSlider',
          }),
        )}
      />
    </div>
  )
}
