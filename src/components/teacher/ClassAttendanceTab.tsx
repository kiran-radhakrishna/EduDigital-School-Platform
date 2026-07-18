import { useState } from 'react'
import { Check, X, Clock, ShieldAlert, Download } from 'lucide-react'
import type { ClassStudent } from '../../types/teacher'

interface ClassAttendanceTabProps {
  students: ClassStudent[]
}

export function ClassAttendanceTab({ students }: ClassAttendanceTabProps) {
  const [attendance, setAttendance] = useState<Record<string, string>>({})

  const handleAttendance = (studentId: string, status: string) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }))
  }

  const markedCount = Object.keys(attendance).length
  const totalStudents = students.length

  const attendanceStats = {
    present: Object.values(attendance).filter((s) => s === 'present').length,
    absent: Object.values(attendance).filter((s) => s === 'absent').length,
    late: Object.values(attendance).filter((s) => s === 'late').length,
    excused: Object.values(attendance).filter((s) => s === 'excused').length,
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Mark Attendance
          </h3>
          <div className="flex gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        <div className="mb-4 grid gap-3 sm:grid-cols-4">
          <StatBox
            label="Present"
            value={attendanceStats.present}
            color="emerald"
          />
          <StatBox
            label="Absent"
            value={attendanceStats.absent}
            color="red"
          />
          <StatBox label="Late" value={attendanceStats.late} color="amber" />
          <StatBox
            label="Excused"
            value={attendanceStats.excused}
            color="blue"
          />
        </div>

        <div className="mb-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Marked: <span className="font-bold text-gray-900 dark:text-white">{markedCount}/{totalStudents}</span>
          </p>
          <div className="mt-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${(markedCount / totalStudents) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {students.map((student) => (
          <div
            key={student.id}
            className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <img
                src={student.photo}
                alt={student.name}
                className="h-10 w-10 rounded-lg object-cover"
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {student.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Attendance: {student.attendancePercent}%
                </p>
              </div>
            </div>

            <div className="flex gap-1">
              <AttendanceButton
                icon={<Check className="h-4 w-4" />}
                label="Present"
                status="present"
                isSelected={attendance[student.id] === 'present'}
                onClick={() => handleAttendance(student.id, 'present')}
                color="emerald"
              />
              <AttendanceButton
                icon={<X className="h-4 w-4" />}
                label="Absent"
                status="absent"
                isSelected={attendance[student.id] === 'absent'}
                onClick={() => handleAttendance(student.id, 'absent')}
                color="red"
              />
              <AttendanceButton
                icon={<Clock className="h-4 w-4" />}
                label="Late"
                status="late"
                isSelected={attendance[student.id] === 'late'}
                onClick={() => handleAttendance(student.id, 'late')}
                color="amber"
              />
              <AttendanceButton
                icon={<ShieldAlert className="h-4 w-4" />}
                label="Excused"
                status="excused"
                isSelected={attendance[student.id] === 'excused'}
                onClick={() => handleAttendance(student.id, 'excused')}
                color="blue"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700"
      >
        Save Attendance
      </button>
    </div>
  )
}

interface StatBoxProps {
  label: string
  value: number
  color: 'emerald' | 'red' | 'amber' | 'blue'
}

function StatBox({ label, value, color }: StatBoxProps) {
  const colors = {
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  }
  return (
    <div className={`rounded-lg ${colors[color]} p-3 text-center`}>
      <p className="text-xs font-medium opacity-75">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}

interface AttendanceButtonProps {
  icon: React.ReactNode
  label: string
  status: string
  isSelected: boolean
  onClick: () => void
  color: string
}

function AttendanceButton({
  icon,
  label,
  isSelected,
  onClick,
  color,
}: AttendanceButtonProps) {
  const colorClasses = {
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  }

  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`rounded-lg p-2 transition-all ${
        isSelected
          ? colorClasses[color as keyof typeof colorClasses]
          : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
      }`}
    >
      {icon}
    </button>
  )
}
