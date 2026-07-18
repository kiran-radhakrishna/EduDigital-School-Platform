import { Mail } from 'lucide-react'
import type { TeacherMessage } from '../../types/parent'

interface ChildMessagesTabProps {
  messages: TeacherMessage[]
}

export function ChildMessagesTab({ messages }: ChildMessagesTabProps) {
  return (
    <div className="space-y-4">
      {messages.length > 0 ? (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="flex gap-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-dark-800"
            >
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900">
                <Mail className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{msg.teacher}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{msg.subject}</p>
                  </div>
                  <span className="whitespace-nowrap text-xs text-gray-500 dark:text-gray-500">{msg.date}</span>
                </div>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{msg.message}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-600 dark:bg-dark-700">
          <Mail className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">No messages yet</p>
        </div>
      )}
    </div>
  )
}
