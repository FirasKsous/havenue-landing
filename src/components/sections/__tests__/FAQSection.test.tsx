import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FAQSection } from '../FAQSection'

describe('FAQSection', () => {
  it('renders every FAQ answer without requiring accordion interaction', () => {
    render(<FAQSection />)

    expect(screen.getByText('How long does it take to set up catering management software?')).toBeInTheDocument()
    expect(screen.getByText(/Havenue is different/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /How long does it take to set up catering management software\?/ })).not.toBeInTheDocument()
  })
})
