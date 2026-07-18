export function WellbeingPrivacyNotice() {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
      <p className="font-semibold">Privacy First</p>
      <p className="mt-1 leading-relaxed">
        Camera processing happens locally in your browser. No photos are stored. No videos are
        uploaded. Only emotion data is saved.
      </p>
    </div>
  )
}
