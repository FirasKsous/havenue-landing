import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ParadigmShift } from '../ParadigmShift'

vi.stubGlobal('IntersectionObserver', class {
  observe() {}
  unobserve() {}
  disconnect() {}
})

describe('Container Widths — C1 Desktop Scaling', () => {
  it('ParadigmShift uses max-w-7xl container', () => {
    const { container } = render(<ParadigmShift />)
    const wrapper = container.querySelector('.max-w-7xl')
    expect(wrapper).not.toBeNull()
  })
})
