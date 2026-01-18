interface TimeGroupResult<T> {
  today: T[]
  yesterday: T[]
  thisWeek: T[]
  thisMonth: T[]
  older: T[]
}

type TimeGroupKey = keyof TimeGroupResult<unknown>

export const TIME_GROUP_LABELS: Record<TimeGroupKey, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  thisWeek: 'This Week',
  thisMonth: 'This Month',
  older: 'Older',
}

export const TIME_GROUP_ORDER: TimeGroupKey[] = ['today', 'yesterday', 'thisWeek', 'thisMonth', 'older']

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

export function groupByTimePeriod<T extends { date?: string }>(items: T[]): TimeGroupResult<T> {
  const now = new Date()
  const todayStart = startOfDay(now)

  const yesterdayStart = new Date(todayStart)
  yesterdayStart.setDate(yesterdayStart.getDate() - 1)

  const weekStart = new Date(todayStart)
  weekStart.setDate(weekStart.getDate() - 7)

  const monthStart = new Date(todayStart)
  monthStart.setDate(monthStart.getDate() - 30)

  const groups: TimeGroupResult<T> = {
    today: [],
    yesterday: [],
    thisWeek: [],
    thisMonth: [],
    older: [],
  }

  for (const item of items) {
    if (!item.date) {
      groups.older.push(item)
      continue
    }

    const itemDate = new Date(item.date)

    const group = isSameDay(itemDate, now)
      ? 'today'
      : isSameDay(itemDate, yesterdayStart)
        ? 'yesterday'
        : itemDate >= weekStart
          ? 'thisWeek'
          : itemDate >= monthStart
            ? 'thisMonth'
            : 'older'

    groups[group].push(item)
  }

  return groups
}

export function getOrderedGroups<T extends { date?: string }>(
  items: T[],
): Array<{ key: TimeGroupKey, label: string, items: T[] }> {
  const grouped = groupByTimePeriod(items)

  return TIME_GROUP_ORDER
    .filter(key => grouped[key].length > 0)
    .map(key => ({
      key,
      label: TIME_GROUP_LABELS[key],
      items: grouped[key],
    }))
}
