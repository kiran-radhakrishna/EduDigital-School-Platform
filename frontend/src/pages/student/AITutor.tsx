import AIChatPanel from '../../components/ai/AIChatPanel'
import { AI_TUTOR_QUESTIONS } from '../../data/studentData'
import { useAuth } from '../../hooks/useAuth'
import { getCurrentUserIdentity } from '../../utils/helpers'
import { aiApi } from '../../services/aiApi'

const QUICK_RESPONSES: Record<string, string> = {
  default: "That's a great question! Let me help you with that. In your studies at DIS, it's important to understand the fundamentals. Would you like me to explain this step by step?",
  fractions: "Fractions are easy when you think of pizza! 🍕 If you have 1/2 of a pizza, that means one piece out of two equal pieces. Let's practise: what is 1/2 + 1/4? Remember to find a common denominator!",
  photosynthesis: "Photosynthesis is how plants make their own food! 🌿 Plants use sunlight, water, and carbon dioxide to produce glucose and oxygen. The formula is: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂. Cool, right?",
  german: "Guten Tag! 🇩🇪 Let's practise German Artikel. In German, every noun has a gender: der (masculine), die (feminine), das (neuter). For example: der Hund (the dog), die Katze (the cat), das Buch (the book). Try one!",
  multiplication: "Let's quiz you! 🔢 What is 7 × 8? Take your time... The answer is 56! A trick: 7 × 8 = 56, remember '5, 6, 7, 8' – five-six-seven-eight! Ready for another one?",
  'solar system': "Our solar system has 8 planets! 🪐 In order from the Sun: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune. Remember this with: 'My Very Educated Mother Just Served Us Noodles'!",
}

function getDemoAIResponse(text: string, firstName: string): string {
  const lower = text.toLowerCase()
  if (lower.includes('fraction')) return QUICK_RESPONSES.fractions
  if (lower.includes('photo')) return QUICK_RESPONSES.photosynthesis
  if (lower.includes('german') || lower.includes('artikel')) return `Guten Tag, ${firstName}! ${QUICK_RESPONSES.german}`
  if (lower.includes('multipl') || lower.includes('times table')) return QUICK_RESPONSES.multiplication
  if (lower.includes('solar') || lower.includes('planet')) return QUICK_RESPONSES['solar system']
  return QUICK_RESPONSES.default
}

export default function AITutor() {
  const { user, isDemoMode } = useAuth()
  const currentUser = getCurrentUserIdentity(user, 'student')

  return (
    <AIChatPanel
      title="AI Tutor"
      subtitle="Powered by EduDigital AI · Always here to help"
      welcomeMessage={`Hello ${currentUser.firstName}! 👋 I'm your AI Tutor. I'm here to help you with any subject – Maths, English, German, Science, and more. What would you like to learn today?`}
      suggestedPrompts={AI_TUTOR_QUESTIONS}
      userAvatarLabel={currentUser.avatar}
      onSend={async (text, conversationId) => {
        if (isDemoMode) {
          await new Promise((resolve) => setTimeout(resolve, 900))
          return { content: getDemoAIResponse(text, currentUser.firstName) }
        }
        const result = await aiApi.tutorChat(text, conversationId)
        return { content: result.message.content, conversationId: result.conversation.id }
      }}
    />
  )
}
