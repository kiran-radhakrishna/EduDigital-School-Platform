import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { LanguageProvider } from '../../context/LanguageContext'
import { AuthProvider } from '../../context/AuthContext'
import Login from './Login'
import { authApi } from '../../services/authApi'

vi.mock('../../services/authApi', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn().mockResolvedValue(undefined),
    me: vi.fn(),
  },
}))

function renderPage() {
  return render(
    <MemoryRouter>
      <LanguageProvider>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </LanguageProvider>
    </MemoryRouter>,
  )
}

describe('Login page', () => {
  it('renders email and password fields and a submit button', () => {
    renderPage()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /log in|sign in/i })).toBeInTheDocument()
  })

  it('submits credentials through authApi.login', async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      id: 'u1',
      firstName: 'Leon',
      lastName: 'Schmidt',
      name: 'Leon Schmidt',
      email: 'leon@example.com',
      role: 'student',
      avatar: 'LS',
      joinedAt: new Date().toISOString(),
    })

    renderPage()

    await userEvent.type(screen.getByLabelText(/email/i), 'leon@example.com')
    await userEvent.type(screen.getByLabelText(/^password$/i), 'Passw0rd!')
    await userEvent.click(screen.getByRole('button', { name: /log in|sign in/i }))

    await waitFor(() => expect(authApi.login).toHaveBeenCalledWith('leon@example.com', 'Passw0rd!'))
  })
})
