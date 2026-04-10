import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { FeatureMenuBuilder } from '../FeatureMenuBuilder'
import { ParadigmShift } from '../ParadigmShift'
import { FeatureSafetyEngine } from '../FeatureSafetyEngine'

vi.stubGlobal('IntersectionObserver', class {
  observe() {}
  unobserve() {}
  disconnect() {}
})

describe('GlassCard in 3D contexts must use noBlur', () => {
  it('FeatureMenuBuilder GlassCard has no backdrop-blur-sm', () => {
    const { container } = render(<FeatureMenuBuilder />)
    const glassCards = container.querySelectorAll('.bg-white\\/\\[0\\.03\\]')
    const blurredInside3D = Array.from(glassCards).filter(
      el => el.className.includes('backdrop-blur-sm')
    )
    expect(blurredInside3D.length).toBe(0)
  })

  it('ParadigmShift GlassCard has no backdrop-blur-sm', () => {
    const { container } = render(<ParadigmShift />)
    const glassCards = container.querySelectorAll('.bg-white\\/\\[0\\.03\\]')
    const blurredInside3D = Array.from(glassCards).filter(
      el => el.className.includes('backdrop-blur-sm')
    )
    expect(blurredInside3D.length).toBe(0)
  })

  it('FeatureSafetyEngine GlassCard has no backdrop-blur-sm', () => {
    const { container } = render(<FeatureSafetyEngine />)
    const glassCards = container.querySelectorAll('.bg-white\\/\\[0\\.03\\]')
    const blurredInside3D = Array.from(glassCards).filter(
      el => el.className.includes('backdrop-blur-sm')
    )
    expect(blurredInside3D.length).toBe(0)
  })
})
