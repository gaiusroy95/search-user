import * as React from 'react'
import { cn } from '@/lib/utils'
import { disabledStyles, focusRing, inputBase } from '@/design-system/styles'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputSize?: 'sm' | 'default' | 'lg'
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, inputSize = 'default', ...props }, ref) => (
    <input
      type={type}
      className={cn(
        inputBase,
        focusRing,
        disabledStyles,
        inputSize === 'sm' && 'h-8 text-xs',
        inputSize === 'default' && 'h-9',
        inputSize === 'lg' && 'h-10 text-base',
        className
      )}
      ref={ref}
      {...props}
    />
  )
)
Input.displayName = 'Input'
