import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { FeatureOCR } from '../FeatureOCR'

vi.stubGlobal('IntersectionObserver', class {
  observe() {}
  unobserve() {}
  disconnect() {}
})

describe('FeatureOCR — C4 Fluid Spacing', () => {
  it('uses fluid section padding via CSS custom property', () => {
    const { container } = render(<FeatureOCR />)
    const section = container.querySelector('section')
    expect(section?.style.paddingTop).toBe('var(--section-padding-y)')
    expect(section?.style.paddingBottom).toBe('var(--section-padding-y)')
  })
})
