import { useState } from 'react'
import { motion } from 'framer-motion'
import { Globe, Lock, Moon, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { useAuth } from '../../hooks/useAuth'
import { useLanguage } from '../../hooks/useLanguage'
import { useTheme } from '../../hooks/useTheme'
import { cn } from '../../utils/helpers'

interface ToggleSwitchProps {
  checked: boolean
  onChange: () => void
}

function ToggleSwitch({ checked, onChange }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={onChange}
      className={cn(
        'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors',
        checked ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-700',
      )}
    >
      <span
        className={cn(
          'inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1',
        )}
      />
    </button>
  )
}

export default function Settings() {
  const { user } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const { lang, setLang, t } = useLanguage()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    sms: false,
    digest: true,
  })
  const [privacySettings, setPrivacySettings] = useState({
    profileVisible: true,
    onlineStatus: false,
  })
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  const saveSettings = () => toast.success('Settings saved!')

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      <Card className="border border-gray-200/70 bg-white/90 dark:border-gray-800 dark:bg-gray-900/80">
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{t.dashboard.settings}</h1>
        </div>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage account preferences, privacy, and notifications.</p>
      </Card>

      <Card className="border border-gray-200/70 bg-white/90 dark:border-gray-800 dark:bg-gray-900/80">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Account</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Input label="Email" type="email" value={user?.email ?? 'student@digitalschool.edu'} disabled readOnly />
          <div />
          <Input label="New Password" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </div>
        <div className="mt-6 flex justify-end">
          <Button size="sm" onClick={saveSettings}>
            {t.common.save}
          </Button>
        </div>
      </Card>

      <Card className="border border-gray-200/70 bg-white/90 dark:border-gray-800 dark:bg-gray-900/80">
        <div className="flex items-center gap-2">
          <Moon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance</h2>
        </div>
        <div className="mt-5 flex items-center justify-between rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Switch instantly between light and dark themes.</p>
          </div>
          <ToggleSwitch checked={isDark} onChange={toggleTheme} />
        </div>
      </Card>

      <Card className="border border-gray-200/70 bg-white/90 dark:border-gray-800 dark:bg-gray-900/80">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Language</h2>
        </div>
        <div className="mt-5 inline-flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
          {([
            ['en', 'EN'],
            ['de', 'DE'],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setLang(value)}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                lang === value ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-gray-300',
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <Button size="sm" onClick={saveSettings}>
            {t.common.save}
          </Button>
        </div>
      </Card>

      <Card className="border border-gray-200/70 bg-white/90 dark:border-gray-800 dark:bg-gray-900/80">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>
        <div className="mt-5 space-y-4">
          {([
            ['email', 'Email notifications', 'Receive updates about assignments, grades, and announcements.'],
            ['push', 'Push notifications', 'Get instant alerts in your browser or app.'],
            ['sms', 'SMS alerts', 'Receive urgent reminders via text message.'],
            ['digest', 'Weekly digest', 'Get a summary of your activity every Friday.'],
          ] as const).map(([key, title, description]) => (
            <div
              key={key}
              className="flex items-center justify-between rounded-2xl border border-gray-200 p-4 dark:border-gray-800"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
              </div>
              <ToggleSwitch
                checked={notificationSettings[key]}
                onChange={() =>
                  setNotificationSettings((current) => ({ ...current, [key]: !current[key] }))
                }
              />
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <Button size="sm" onClick={saveSettings}>
            {t.common.save}
          </Button>
        </div>
      </Card>

      <Card className="border border-gray-200/70 bg-white/90 dark:border-gray-800 dark:bg-gray-900/80">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Privacy</h2>
        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Profile visibility</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Allow classmates and teachers to view your profile.</p>
            </div>
            <ToggleSwitch
              checked={privacySettings.profileVisible}
              onChange={() =>
                setPrivacySettings((current) => ({
                  ...current,
                  profileVisible: !current.profileVisible,
                }))
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Show online status</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Display when you are active in the portal.</p>
            </div>
            <ToggleSwitch
              checked={privacySettings.onlineStatus}
              onChange={() =>
                setPrivacySettings((current) => ({
                  ...current,
                  onlineStatus: !current.onlineStatus,
                }))
              }
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button size="sm" onClick={saveSettings}>
            {t.common.save}
          </Button>
        </div>
      </Card>

      <Card className="border border-gray-200/70 bg-white/90 dark:border-gray-800 dark:bg-gray-900/80">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Security</h2>
        </div>
        <div className="mt-5 flex items-center justify-between rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security to your account.</p>
          </div>
          <ToggleSwitch checked={twoFactorEnabled} onChange={() => setTwoFactorEnabled((current) => !current)} />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button
            size="sm"
            className="border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            onClick={() => toast.success('Password change workflow coming soon')}
          >
            Change Password
          </Button>
          <Button size="sm" onClick={saveSettings}>
            {t.common.save}
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}
