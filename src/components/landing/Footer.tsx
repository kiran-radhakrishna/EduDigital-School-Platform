import {
  GraduationCap,
  Globe,
  Send,
  Share2,
  Rss,
} from 'lucide-react'

const socialLinks = [Globe, Send, Share2, Rss]

const footerGroups = [
  {
    title: 'Product',
    links: ['Features', 'Pricing', 'Security', 'Updates'],
  },
  {
    title: 'Company',
    links: ['About', 'Careers', 'Blog', 'Press'],
  },
  {
    title: 'Support',
    links: ['Help Center', 'Contact Us', 'Status', 'Community'],
  },
]

export default function Footer() {
  return (
    <footer id="contact" className="bg-gray-900 dark:bg-gray-950 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2 md:col-span-2">
          <div className="inline-flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-indigo-400" />
            <span className="text-xl font-bold text-white">EduDigital</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-gray-400">
            Empowering schools with intelligent digital tools for the next generation of
            learners.
          </p>

          <div className="mt-6 flex items-center gap-3">
            {socialLinks.map((Icon, index) => (
              <a
                key={index}
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-gray-300 transition hover:bg-indigo-600 hover:text-white"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {footerGroups.map((group) => (
          <div key={group.title}>
            <h3 className="mb-4 font-semibold text-white">{group.title}</h3>
            <ul>
              {group.links.map((link) => (
                <li key={link} className="mb-2">
                  <a href="#" className="text-sm text-gray-400 transition hover:text-white">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div
        id="footer"
        className="border-t border-gray-800 mt-12 pt-8 max-w-7xl mx-auto px-6 lg:px-8 flex flex-col items-center justify-between gap-4 text-sm text-gray-500 sm:flex-row"
      >
        <p>© {new Date().getFullYear()} EduDigital. All rights reserved.</p>
        <div className="flex items-center gap-3">
          <a href="#" className="transition hover:text-white">
            Privacy Policy
          </a>
          <span>•</span>
          <a href="#" className="transition hover:text-white">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  )
}
