/**
 * Shabbat-Aware Scheduler
 *
 * Utility for scheduling reminders and notifications that respect
 * Shabbat and Jewish holidays in Israel.
 *
 * Shabbat: Friday sunset to Saturday sunset (approx 18:00 Fri - 20:00 Sat)
 * Uses simplified sunset calculation for Israel timezone.
 */

export interface ShabbatConfig {
  fridayCutoff: number  // hour to stop sending (default: 14 = 2PM Friday)
  saturdayResume: number // hour to resume (default: 21 = 9PM Saturday)
  respectHolidays: boolean
}

const DEFAULT_CONFIG: ShabbatConfig = {
  fridayCutoff: 14,
  saturdayResume: 21,
  respectHolidays: true,
}

// Major Jewish holidays 2025-2026 (dates when sending should pause)
// Format: [month (0-indexed), day]
const HOLIDAYS_2025: [number, number][] = [
  // Pessah 2025: April 12-19
  [3, 12], [3, 13], [3, 18], [3, 19],
  // Shavuot 2025: June 1-2
  [5, 1], [5, 2],
  // Rosh Hashana 2025: Sep 22-24
  [8, 22], [8, 23], [8, 24],
  // Yom Kippur 2025: Oct 1-2
  [9, 1], [9, 2],
  // Sukkot 2025: Oct 6-13
  [9, 6], [9, 7], [9, 13],
]

const HOLIDAYS_2026: [number, number][] = [
  // Pessah 2026: April 1-8
  [3, 1], [3, 2], [3, 7], [3, 8],
  // Shavuot 2026: May 21-22
  [4, 21], [4, 22],
  // Rosh Hashana 2026: Sep 11-13
  [8, 11], [8, 12], [8, 13],
  // Yom Kippur 2026: Sep 20-21
  [8, 20], [8, 21],
  // Sukkot 2026: Sep 25 - Oct 2
  [8, 25], [8, 26], [9, 2],
]

function isHoliday(date: Date): boolean {
  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDate()
  const holidays = year === 2025 ? HOLIDAYS_2025 : year === 2026 ? HOLIDAYS_2026 : []
  return holidays.some(([m, d]) => m === month && d === day)
}

/**
 * Check if a given datetime falls during Shabbat or a holiday
 */
export function isDuringShabbat(date: Date, config: ShabbatConfig = DEFAULT_CONFIG): boolean {
  // Convert to Israel time
  const israelTime = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' }))
  const dayOfWeek = israelTime.getDay() // 0=Sun, 5=Fri, 6=Sat
  const hour = israelTime.getHours()

  // Friday after cutoff
  if (dayOfWeek === 5 && hour >= config.fridayCutoff) return true
  // All Saturday until resume
  if (dayOfWeek === 6 && hour < config.saturdayResume) return true

  // Holidays
  if (config.respectHolidays && isHoliday(israelTime)) return true

  return false
}

/**
 * Get the next valid sending time after a given date.
 * If the date is valid, returns it as-is.
 * If during Shabbat/holiday, returns the next valid time.
 */
export function getNextValidSendTime(date: Date, config: ShabbatConfig = DEFAULT_CONFIG): Date {
  const result = new Date(date)
  let attempts = 0

  while (isDuringShabbat(result, config) && attempts < 72) {
    // Move forward 1 hour at a time
    result.setHours(result.getHours() + 1)
    attempts++
  }

  return result
}

/**
 * Schedule a reminder at a specific date, adjusted for Shabbat.
 * Returns the adjusted send time and whether it was moved.
 */
export function scheduleReminder(
  targetDate: Date,
  config: ShabbatConfig = DEFAULT_CONFIG
): { sendAt: Date; wasMoved: boolean; reason: string | null } {
  if (!isDuringShabbat(targetDate, config)) {
    return { sendAt: targetDate, wasMoved: false, reason: null }
  }

  const israelTime = new Date(targetDate.toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' }))
  const dayOfWeek = israelTime.getDay()
  const isHol = isHoliday(israelTime)

  let reason = 'Shabbat'
  if (dayOfWeek === 5) reason = 'Veille de Shabbat (vendredi apres-midi)'
  else if (dayOfWeek === 6) reason = 'Shabbat'
  if (isHol) reason = 'Jour ferie juif'

  const sendAt = getNextValidSendTime(targetDate, config)
  return { sendAt, wasMoved: true, reason }
}

/**
 * Get upcoming Shabbat times for display in UI
 */
export function getNextShabbatTimes(): { start: Date; end: Date } {
  const now = new Date()
  const israelNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' }))
  const dayOfWeek = israelNow.getDay()

  // Days until Friday
  const daysToFriday = (5 - dayOfWeek + 7) % 7 || 7
  const friday = new Date(israelNow)
  friday.setDate(friday.getDate() + daysToFriday)
  friday.setHours(18, 0, 0, 0) // Approximate candle lighting

  const saturday = new Date(friday)
  saturday.setDate(saturday.getDate() + 1)
  saturday.setHours(20, 0, 0, 0) // Approximate havdalah

  return { start: friday, end: saturday }
}
