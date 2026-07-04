import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, Mail, Phone, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { Avatar } from '../../components/common/Avatar'
import { useAuth } from '../../hooks/useAuth'
import { useLanguage } from '../../hooks/useLanguage'
import { formatDate } from '../../utils/helpers'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const { t } = useLanguage()
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '+49 170 555 2048',
    bio:
      user?.bio ??
      'Motivated learner with a strong interest in science, collaborative projects, and building consistent study habits.',
  })

  useEffect(() => {
    setForm({
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '+49 170 555 2048',
      bio:
        user?.bio ??
        'Motivated learner with a strong interest in science, collaborative projects, and building consistent study habits.',
    })
  }, [user])

  const handleSave = () => {
    updateUser({
      name: form.name,
      email: form.email,
      phone: form.phone,
      bio: form.bio,
    })
    toast.success('Profile updated successfully!')
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      <Card className="border border-gray-200/70 bg-white/90 dark:border-gray-800 dark:bg-gray-900/80">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <Avatar src={user?.avatar} name={user?.name ?? 'Student'} size="xl" />
          <div className="flex-1">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.name ?? 'Student Profile'}</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{user?.email ?? 'student@digitalschool.edu'}</p>
              </div>
              <Badge variant="primary">{user?.role ?? 'student'}</Badge>
            </div>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Joined {formatDate(user?.joinedAt ?? new Date().toISOString())}
            </p>
          </div>
        </div>
      </Card>

      <Card className="border border-gray-200/70 bg-white/90 dark:border-gray-800 dark:bg-gray-900/80">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-6 dark:border-gray-800 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t.dashboard.profile}</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Update your personal details and profile summary.</p>
          </div>
          <Button
            size="sm"
            leftIcon={<Camera className="h-4 w-4" />}
            onClick={() => toast.success('Photo upload coming soon')}
          >
            Change Photo
          </Button>
        </div>

        <div className="grid gap-5 p-6 md:grid-cols-2">
          <Input
            label="Name"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            leftIcon={<User className="h-4 w-4" />}
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            leftIcon={<Mail className="h-4 w-4" />}
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
            leftIcon={<Phone className="h-4 w-4" />}
          />
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
            <textarea
              value={form.bio}
              onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
              rows={5}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex justify-end px-6 pb-6">
          <Button onClick={handleSave}>{t.common.save}</Button>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border border-gray-200/70 bg-white/90 dark:border-gray-800 dark:bg-gray-900/80">
          <p className="text-sm text-gray-500 dark:text-gray-400">Member since</p>
          <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
            {formatDate(user?.joinedAt ?? new Date().toISOString())}
          </p>
        </Card>
        <Card className="border border-gray-200/70 bg-white/90 dark:border-gray-800 dark:bg-gray-900/80">
          <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
          <p className="mt-2 text-lg font-semibold capitalize text-gray-900 dark:text-white">{user?.role ?? 'student'}</p>
        </Card>
        <Card className="border border-gray-200/70 bg-white/90 dark:border-gray-800 dark:bg-gray-900/80">
          <p className="text-sm text-gray-500 dark:text-gray-400">Class / Subject</p>
          <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
            {user?.class ?? user?.subject ?? 'General account'}
          </p>
        </Card>
      </div>
    </motion.div>
  )
}
