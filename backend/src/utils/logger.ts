type LogLevel = 'info' | 'warn' | 'error'

interface LogFields {
  requestId?: string
  [key: string]: unknown
}

/** Minimal structured (JSON-lines) logger — no new dependency, easy to pipe into any log aggregator. */
function log(level: LogLevel, message: string, fields: LogFields = {}): void {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...fields,
  }
  const line = JSON.stringify(entry)
  if (level === 'error') console.error(line)
  else if (level === 'warn') console.warn(line)
  else console.log(line)
}

export const logger = {
  info: (message: string, fields?: LogFields) => log('info', message, fields),
  warn: (message: string, fields?: LogFields) => log('warn', message, fields),
  error: (message: string, fields?: LogFields) => log('error', message, fields),
}
