import { motion, type Variants } from 'framer-motion'
import { LineChart } from 'lucide-react'
import AIChatPanel from '../../components/ai/AIChatPanel'
import { useAuth } from '../../hooks/useAuth'
import { getCurrentUserIdentity } from '../../utils/helpers'
import { aiApi } from '../../services/aiApi'
import { getGenericDemoResponse } from '../../utils/demoAiResponses'

const container: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }

const SUGGESTED_PROMPTS = [
  'School performance summary',
  'Attendance insights',
  'Academic insights',
  'Wellbeing insights',
  'Suggested interventions',
]

export default function AIInsights() {
  const { user, isDemoMode } = useAuth()
  const currentUser = getCurrentUserIdentity(user, 'admin')

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="pb-4">
      <AIChatPanel
        icon={LineChart}
        title="AI Insights"
        subtitle={`Powered by EduDigital AI · ${user?.schoolName ?? 'your school'}`}
        welcomeMessage={`Hi ${currentUser.firstName}! I can generate school performance summaries, attendance and academic insights, wellbeing insights, and suggested interventions using your school's current data. What would you like to review?`}
        suggestedPrompts={SUGGESTED_PROMPTS}
        placeholder="Ask about school performance, attendance, wellbeing…"
        userAvatarLabel={currentUser.avatar}
        onSend={async (text, conversationId) => {
          if (isDemoMode) {
            await new Promise((resolve) => setTimeout(resolve, 800))
            return { content: getGenericDemoResponse('admin', text) }
          }
          const result = await aiApi.adminChat(text, conversationId)
          return { content: result.message.content, conversationId: result.conversation.id }
        }}
      />
    </motion.div>
  )
}
