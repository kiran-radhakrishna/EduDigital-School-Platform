import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'

export default function Testimonials() {
  const { t } = useLanguage()

  return (
    <section id="testimonials" className="py-24 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            {t.testimonials.title}
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-300">{t.testimonials.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {t.testimonials.items.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: index * 0.1 }}
              className="relative rounded-2xl border border-gray-100 bg-gray-50 p-8 dark:border-gray-800 dark:bg-gray-900"
            >
              <Quote className="mb-4 h-10 w-10 text-indigo-200 opacity-70 dark:text-indigo-900" />
              <p className="mb-6 italic text-gray-700 dark:text-gray-300">{item.text}</p>

              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 font-semibold text-white">
                  {item.initial}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{item.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{item.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
