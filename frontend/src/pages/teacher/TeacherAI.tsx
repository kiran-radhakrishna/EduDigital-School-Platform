import { motion, type Variants } from 'framer-motion'
import { GraduationCap } from 'lucide-react'
import AIChatPanel from '../../components/ai/AIChatPanel'
import { useAuth } from '../../hooks/useAuth'
import { getCurrentUserIdentity } from '../../utils/helpers'
import { aiApi } from '../../services/aiApi'
import { getGenericDemoResponse } from '../../utils/demoAiResponses'

const container: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }

const SUGGESTED_PROMPTS = [
  'Generate a lesson plan',
  'Generate a quiz',
  'Generate a rubric',
  'Draft student feedback',
  'Generate an exam paper',
]

export default function TeacherAI() {
  const { user, isDemoMode } = useAuth()
  const currentUser = getCurrentUserIdentity(user, 'teacher')

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="pb-4">
      <AIChatPanel
        icon={GraduationCap}
        title="Teacher AI"
        subtitle={`Powered by EduDigital AI · ${user?.subject ?? 'your classroom'}`}
        welcomeMessage={`Hi ${currentUser.firstName}! I can generate lesson plans, assignments, quizzes, rubrics, student feedback, and exam papers. What would you like to create?`}
        suggestedPrompts={SUGGESTED_PROMPTS}
        placeholder="Ask for a lesson plan, quiz, rubric, feedback…"
        userAvatarLabel={currentUser.avatar}
        onSend={async (text, conversationId) => {
          if (isDemoMode) {
            await new Promise((resolve) => setTimeout(resolve, 800))
            return { content: getGenericDemoResponse('teacher', text) }
          }
          const result = await aiApi.teacherChat(text, conversationId)
          return { content: result.message.content, conversationId: result.conversation.id }
        }}
      />
    </motion.div>
  )
}
