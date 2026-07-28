import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { LanguageProvider } from '../../context/LanguageContext'
import ForgotPassword from './ForgotPassword'
import { authApi } from '../../services/authApi'

vi.mock('../../services/authApi', () => ({
  authApi: { forgotPassword: vi.fn().mockResolvedValue(undefined) },
}))

function renderPage() {
  return render(
    <MemoryRouter>
      <LanguageProvider>
        <ForgotPassword />
      </LanguageProvider>
    </MemoryRouter>,
  )
}

describe('ForgotPassword page', () => {
  it('submits the entered email to authApi.forgotPassword', async () => {
    renderPage()

    await userEvent.type(screen.getByLabelText(/email/i), 'leon@example.com')
    await userEvent.click(screen.getByRole('button', { name: /submit|reset|send/i }))

    await waitFor(() => expect(authApi.forgotPassword).toHaveBeenCalledWith('leon@example.com'))
  })

  it('shows the same confirmation screen even if the request fails (no account enumeration)', async () => {
    vi.mocked(authApi.forgotPassword).mockRejectedValueOnce(new Error('boom'))
    renderPage()

    await userEvent.type(screen.getByLabelText(/email/i), 'nobody@example.com')
    await userEvent.click(screen.getByRole('button', { name: /submit|reset|send/i }))

    await waitFor(() => expect(screen.getByRole('button', { name: /back to login/i })).toBeInTheDocument())
  })
})
