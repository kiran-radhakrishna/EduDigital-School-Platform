import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider } from '../context/AuthContext'
import { useAuth } from './useAuth'
import { authApi } from '../services/authApi'

vi.mock('../services/authApi', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn().mockResolvedValue(undefined),
    me: vi.fn(),
  },
}))

function TestConsumer() {
  const { user, isAuthenticated, login, logout } = useAuth()
  return (
    <div>
      <p data-testid="status">{isAuthenticated ? `logged in as ${user?.name}` : 'logged out'}</p>
      <button onClick={() => login('leon@example.com', 'Passw0rd!')}>Log in</button>
      <button onClick={logout}>Log out</button>
    </div>
  )
}

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

describe('useAuth (via AuthProvider)', () => {
  it('starts logged out with no stored session', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )
    expect(screen.getByTestId('status')).toHaveTextContent('logged out')
  })

  it('logs in through authApi.login and updates state', async () => {
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

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Log in' }))

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('logged in as Leon Schmidt'))
    expect(authApi.login).toHaveBeenCalledWith('leon@example.com', 'Passw0rd!')
  })

  it('logs out and calls authApi.logout for a real (non-demo) session', async () => {
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

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Log in' }))
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('logged in'))

    await userEvent.click(screen.getByRole('button', { name: 'Log out' }))

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('logged out'))
    expect(authApi.logout).toHaveBeenCalledOnce()
  })
})
