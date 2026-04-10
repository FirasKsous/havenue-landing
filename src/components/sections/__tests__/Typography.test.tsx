import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { HeroSection } from '../HeroSection'
import { ROIAnchor } from '../ROIAnchor'

vi.stubGlobal('IntersectionObserver', class {
  observe() {}
  unobserve() {}
  disconnect() {}
})

describe('Typography — C2 Desktop Scaling', () => {
  it('Hero H1 uses fluid font-size-hero CSS variable', () => {
    const { container } = render(<HeroSection onVideoClick={() => {}} />)
    const h1 = container.querySelector('h1')
    expect(h1?.style.fontSize).toBe('var(--font-size-hero)')
  })

  it('ROI metric numbers use scaled-up text-4xl+ sizing', () => {
    const { container } = render(<ROIAnchor />)
    const metrics = container.querySelectorAll('.text-4xl')
    expect(metrics.length).toBeGreaterThan(0)
  })
})
