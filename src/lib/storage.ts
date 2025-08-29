export type ClassConfig = {
  rows: number
  cols: number
}

export type Student = {
  id: string
  name: string
  photoUrl?: string
}

type SeatingMap = Record<number, string>

const STORAGE_KEY_PREFIX_CONFIG = 'student-data:class-config:'
const STORAGE_KEY_PREFIX_ROSTER = 'student-data:roster:'
const STORAGE_KEY_PREFIX_SEATING = 'student-data:seating:'
const STORAGE_KEY_PREFIX_DISABLED = 'student-data:disabled-seats:'
const STORAGE_KEY_PREFIX_CALLED = 'student-data:called-on:'

export function getClassConfig(classId: string): ClassConfig {
  const key = STORAGE_KEY_PREFIX_CONFIG + classId
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return { rows: 5, cols: 6 }
    const parsed = JSON.parse(raw) as Partial<ClassConfig>
    const rows = typeof parsed.rows === 'number' && parsed.rows > 0 ? parsed.rows : 5
    const cols = typeof parsed.cols === 'number' && parsed.cols > 0 ? parsed.cols : 6
    return { rows, cols }
  } catch {
    return { rows: 5, cols: 6 }
  }
}

export function saveClassConfig(classId: string, config: ClassConfig): void {
  const key = STORAGE_KEY_PREFIX_CONFIG + classId
  const sanitized: ClassConfig = {
    rows: Math.max(1, Math.min(20, Math.floor(config.rows || 1))),
    cols: Math.max(1, Math.min(20, Math.floor(config.cols || 1))),
  }
  localStorage.setItem(key, JSON.stringify(sanitized))
}

function defaultRosterFor(classId: string): Student[] {
  if (classId === 'block-2-algebra-ii') {
    return [
      { id: 's-alg-1', name: 'Alice Johnson' },
      { id: 's-alg-2', name: 'Ben Carter' },
      { id: 's-alg-3', name: 'Chris Lee' },
      { id: 's-alg-4', name: 'Diana Smith' },
      { id: 's-alg-5', name: 'Evan Torres' },
      { id: 's-alg-6', name: 'Fatima Khan' },
      { id: 's-alg-7', name: 'Grace Park' },
      { id: 's-alg-8', name: 'Hector Ruiz' },
      { id: 's-alg-9', name: 'Isla Chen' },
      { id: 's-alg-10', name: 'Jack Brown' },
    ]
  }
  if (classId === 'block-6-htcs') {
    return [
      { id: 's-htcs-1', name: 'Ava Patel' },
      { id: 's-htcs-2', name: 'Logan Wright' },
      { id: 's-htcs-3', name: 'Mia Nguyen' },
      { id: 's-htcs-4', name: 'Noah Kim' },
      { id: 's-htcs-5', name: 'Olivia Davis' },
      { id: 's-htcs-6', name: 'Ryan Scott' },
      { id: 's-htcs-7', name: 'Sophia Martinez' },
      { id: 's-htcs-8', name: 'Theo Murphy' },
    ]
  }
  return [
    { id: 's-g-1', name: 'Student One' },
    { id: 's-g-2', name: 'Student Two' },
    { id: 's-g-3', name: 'Student Three' },
  ]
}

export function getRoster(classId: string): Student[] {
  const key = STORAGE_KEY_PREFIX_ROSTER + classId
  try {
    const raw = localStorage.getItem(key)
    if (!raw) {
      const roster = defaultRosterFor(classId)
      localStorage.setItem(key, JSON.stringify(roster))
      return roster
    }
    const parsed = JSON.parse(raw) as Student[]
    return Array.isArray(parsed) ? parsed : defaultRosterFor(classId)
  } catch {
    return defaultRosterFor(classId)
  }
}

export function saveRoster(classId: string, roster: Student[]): void {
  const key = STORAGE_KEY_PREFIX_ROSTER + classId
  localStorage.setItem(key, JSON.stringify(roster))
}

export function getSeating(classId: string): SeatingMap {
  const key = STORAGE_KEY_PREFIX_SEATING + classId
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as SeatingMap
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function saveSeating(classId: string, seating: SeatingMap): void {
  const key = STORAGE_KEY_PREFIX_SEATING + classId
  localStorage.setItem(key, JSON.stringify(seating))
}

export function getDisabledSeats(classId: string): number[] {
  const key = STORAGE_KEY_PREFIX_DISABLED + classId
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed.filter((n) => typeof n === 'number')
    return []
  } catch {
    return []
  }
}

export function saveDisabledSeats(classId: string, disabledSeatIndexes: number[]): void {
  const key = STORAGE_KEY_PREFIX_DISABLED + classId
  localStorage.setItem(key, JSON.stringify(disabledSeatIndexes))
}

export function getCalledOn(classId: string): string[] {
  const key = STORAGE_KEY_PREFIX_CALLED + classId
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : []
  } catch {
    return []
  }
}

export function saveCalledOn(classId: string, calledStudentIds: string[]): void {
  const key = STORAGE_KEY_PREFIX_CALLED + classId
  localStorage.setItem(key, JSON.stringify(calledStudentIds))
}


