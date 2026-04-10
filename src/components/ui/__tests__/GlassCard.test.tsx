import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { GlassCard } from '../GlassCard'

describe('GlassCard — noBlur prop', () => {
  it('includes backdrop-blur-sm by default', () => {
    const { container } = render(<GlassCard>content</GlassCard>)
    const card = container.firstElementChild
    expect(card?.className).toContain('backdrop-blur-sm')
  })

  it('excludes backdrop-blur-sm when noBlur is true', () => {
    const { container } = render(<GlassCard noBlur>content</GlassCard>)
    const card = container.firstElementChild
    expect(card?.className).not.toContain('backdrop-blur-sm')
  })
})
