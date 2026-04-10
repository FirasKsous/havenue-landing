import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { FeatureOCR } from '../FeatureOCR'
import { ParadigmShift } from '../ParadigmShift'
import { FeatureMenuBuilder } from '../FeatureMenuBuilder'
import { FeatureSafetyEngine } from '../FeatureSafetyEngine'
import { AgitationSection } from '../AgitationSection'
import { HeroSection } from '../HeroSection'

vi.stubGlobal('IntersectionObserver', class {
  observe() {}
  unobserve() {}
  disconnect() {}
})

describe('Section IDs — PRD Navigation Compliance', () => {
  it('FeatureOCR has id="features" (nav anchor target)', () => {
    const { container } = render(<FeatureOCR />)
    const section = container.querySelector('section')
    expect(section).toHaveAttribute('id', 'features')
  })

  it('ParadigmShift has id="solution" (not duplicate features)', () => {
    const { container } = render(<ParadigmShift />)
    const section = container.querySelector('section')
    expect(section).toHaveAttribute('id', 'solution')
  })

  it('FeatureMenuBuilder has id="menu-builder" (not duplicate features)', () => {
    const { container } = render(<FeatureMenuBuilder />)
    const section = container.querySelector('section')
    expect(section).toHaveAttribute('id', 'menu-builder')
  })

  it('FeatureSafetyEngine has id="safety-engine"', () => {
    const { container } = render(<FeatureSafetyEngine />)
    const section = container.querySelector('section')
    expect(section).toHaveAttribute('id', 'safety-engine')
  })

  it('AgitationSection has id="problem" (not pain-points)', () => {
    const { container } = render(<AgitationSection />)
    const section = container.querySelector('section')
    expect(section).toHaveAttribute('id', 'problem')
  })

  it('HeroSection has id="hero"', () => {
    const { container } = render(<HeroSection onVideoClick={() => {}} />)
    const section = container.querySelector('section')
    expect(section).toHaveAttribute('id', 'hero')
  })
})
