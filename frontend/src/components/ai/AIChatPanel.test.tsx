import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AIChatPanel from './AIChatPanel'

describe('AIChatPanel', () => {
  it('renders the welcome message on mount', () => {
    render(
      <AIChatPanel
        title="AI Tutor"
        subtitle="test"
        welcomeMessage="Hello there!"
        userAvatarLabel="LS"
        onSend={vi.fn()}
      />,
    )
    expect(screen.getByText('Hello there!')).toBeInTheDocument()
  })

  it('sends a typed message and renders the assistant reply', async () => {
    const onSend = vi.fn().mockResolvedValue({ content: 'The answer is 4.', conversationId: 'conv-1' })
    render(
      <AIChatPanel title="AI Tutor" subtitle="test" welcomeMessage="Hi" userAvatarLabel="LS" onSend={onSend} />,
    )

    const input = screen.getByPlaceholderText('Ask me anything…')
    await userEvent.type(input, 'What is 2+2?{enter}')

    expect(onSend).toHaveBeenCalledWith('What is 2+2?', undefined)
    await waitFor(() => expect(screen.getByText('The answer is 4.')).toBeInTheDocument())
  })

  it('passes the returned conversationId back on the next send, to continue the thread', async () => {
    const onSend = vi.fn().mockResolvedValue({ content: 'reply', conversationId: 'conv-42' })
    render(
      <AIChatPanel title="AI Tutor" subtitle="test" welcomeMessage="Hi" userAvatarLabel="LS" onSend={onSend} />,
    )

    const input = screen.getByPlaceholderText('Ask me anything…')
    await userEvent.type(input, 'first message{enter}')
    await waitFor(() => expect(onSend).toHaveBeenCalledTimes(1))

    await userEvent.type(input, 'second message{enter}')
    await waitFor(() => expect(onSend).toHaveBeenCalledTimes(2))

    expect(onSend).toHaveBeenNthCalledWith(2, 'second message', 'conv-42')
  })

  it('shows an error toast-worthy state gracefully when onSend rejects, without crashing', async () => {
    const onSend = vi.fn().mockRejectedValue(new Error('network error'))
    render(
      <AIChatPanel title="AI Tutor" subtitle="test" welcomeMessage="Hi" userAvatarLabel="LS" onSend={onSend} />,
    )

    const input = screen.getByPlaceholderText('Ask me anything…')
    await userEvent.type(input, 'hello{enter}')

    await waitFor(() => expect(onSend).toHaveBeenCalled())
    // The user's own message still renders even though the assistant reply failed.
    expect(screen.getByText('hello')).toBeInTheDocument()
  })

  it('renders suggested prompt chips and sends them on click', async () => {
    const onSend = vi.fn().mockResolvedValue({ content: 'reply' })
    render(
      <AIChatPanel
        title="AI Tutor"
        subtitle="test"
        welcomeMessage="Hi"
        userAvatarLabel="LS"
        onSend={onSend}
        suggestedPrompts={['Explain fractions']}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: /Explain fractions/ }))
    expect(onSend).toHaveBeenCalledWith('Explain fractions', undefined)
  })
})
