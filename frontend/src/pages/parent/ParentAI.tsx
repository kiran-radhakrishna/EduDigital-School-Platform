import { motion, type Variants } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import AIChatPanel from '../../components/ai/AIChatPanel'
import { useAuth } from '../../hooks/useAuth'
import { useParent } from '../../hooks/useParent'
import { getCurrentUserIdentity } from '../../utils/helpers'
import { aiApi } from '../../services/aiApi'
import { getGenericDemoResponse } from '../../utils/demoAiResponses'

const container: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }

const SUGGESTED_PROMPTS = ['Weekly summary', 'Progress summary', 'Attendance summary', 'Wellbeing summary', 'What should we work on?']

export default function ParentAI() {
  const { user, isDemoMode } = useAuth()
  const { children, selectedChildId, setSelectedChildId } = useParent()
  const currentUser = getCurrentUserIdentity(user, 'parent')
  const selectedChild = children.find((child) => child.id === selectedChildId) ?? children[0]

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 pb-4">
      {children.length > 1 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Child:</span>
          {children.map((child) => (
            <button
              key={child.id}
              type="button"
              onClick={() => setSelectedChildId(child.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                child.id === selectedChild?.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              {child.name}
            </button>
          ))}
        </div>
      )}

      {selectedChild ? (
        <AIChatPanel
          key={selectedChild.id}
          icon={Sparkles}
          title="Parent AI"
          subtitle={`For ${selectedChild.name} · ${selectedChild.grade}`}
          welcomeMessage={`Hi ${currentUser.firstName}! I can generate a weekly summary, progress summary, attendance summary, or wellbeing summary for ${selectedChild.name}, plus suggested actions. What would you like to know?`}
          suggestedPrompts={SUGGESTED_PROMPTS}
          placeholder={`Ask about ${selectedChild.name}…`}
          userAvatarLabel={currentUser.avatar}
          onSend={async (text, conversationId) => {
            if (isDemoMode) {
              await new Promise((resolve) => setTimeout(resolve, 800))
              return { content: getGenericDemoResponse('parent', text) }
            }
            const result = await aiApi.parentChat(selectedChild.id, text, conversationId)
            return { content: result.message.content, conversationId: result.conversation.id }
          }}
        />
      ) : (
        <p className="text-sm text-gray-500">No children linked to this account yet.</p>
      )}
    </motion.div>
  )
}
