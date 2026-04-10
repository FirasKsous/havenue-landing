import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { SocialProof } from '../SocialProof'

vi.stubGlobal('IntersectionObserver', class {
  observe() {}
  unobserve() {}
  disconnect() {}
})

describe('SocialProof — Phase B PRD Compliance', () => {
  it('has id="testimonials" on section element', () => {
    const { container } = render(<SocialProof />)
    const section = container.querySelector('section')
    expect(section).toHaveAttribute('id', 'testimonials')
  })

  it('uses fluid section padding via CSS custom property', () => {
    const { container } = render(<SocialProof />)
    const section = container.querySelector('section')
    expect(section?.style.paddingTop).toBe('var(--section-padding-y)')
    expect(section?.style.paddingBottom).toBe('var(--section-padding-y)')
  })

  it('renders PRD-specified headline copy', () => {
    render(<SocialProof />)
    expect(screen.getByText('What Our Early Adopters Are Saying')).toBeInTheDocument()
  })

  it('renders PRD-specified subheadline copy', () => {
    render(<SocialProof />)
    expect(screen.getByText('Real feedback from chefs, sales managers, and venue staff who tried Havenue.')).toBeInTheDocument()
  })

  it('renders testimonial cards with w-[540px] width (wider horizontal cards)', () => {
    const { container } = render(<SocialProof />)
    const cards = container.querySelectorAll('.w-\\[540px\\]')
    expect(cards.length).toBeGreaterThan(0)
  })

  it('renders cards without fixed height (flexible content-driven height)', () => {
    const { container } = render(<SocialProof />)
    const fixedCards = container.querySelectorAll('.h-\\[280px\\]')
    expect(fixedCards.length).toBe(0)
  })

  it('renders cards with compact padding px-8 py-5 and rounded-2xl', () => {
    const { container } = render(<SocialProof />)
    const cards = container.querySelectorAll('.px-8.py-5.rounded-2xl')
    expect(cards.length).toBeGreaterThan(0)
  })

  it('renders quote text with text-sm for compact horizontal cards', () => {
    const { container } = render(<SocialProof />)
    const quotes = container.querySelectorAll('p.italic.text-sm')
    expect(quotes.length).toBeGreaterThan(0)
  })
})
