import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getClassConfig, saveClassConfig, getRoster, saveRoster, getSeating, saveSeating, getDisabledSeats, saveDisabledSeats, type Student } from '../lib/storage'

function NumberInput({ label, value, onChange, min = 1, max = 20 }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span>{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value))))}
        style={{ padding: 8, width: 120 }}
      />
    </label>
  )
}

function RosterEditor({ roster, onChange }: { roster: Student[]; onChange: (next: Student[]) => void }) {
  async function handlePhotoPick(index: number, file: File) {
    const dataUrl = await fileToDataUrl(file)
    const next = roster.slice()
    next[index] = { ...next[index], photoUrl: dataUrl }
    onChange(next)
  }

  function handleNameChange(index: number, name: string) {
    const next = roster.slice()
    next[index] = { ...next[index], name }
    onChange(next)
  }

  function handleRemove(index: number) {
    const next = roster.slice()
    next.splice(index, 1)
    onChange(next)
  }

  function handleAdd() {
    const newStudent: Student = { id: `s-${crypto.randomUUID()}`, name: 'New Student' }
    onChange([...roster, newStudent])
  }

  return (
    <div style={{ border: '1px solid #444', borderRadius: 8, padding: 8 }}>
      <h3 style={{ marginTop: 0 }}>Edit Roster</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {roster.map((s, i) => (
          <div key={s.id} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 8, alignItems: 'center' }}>
            <Avatar name={s.name} photoUrl={s.photoUrl} size={32} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <input value={s.name} onChange={(e) => handleNameChange(i, e.target.value)} style={{ padding: 6 }} />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                  <span style={{ border: '1px solid #555', padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}>Upload photo</span>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => e.target.files && e.target.files[0] && handlePhotoPick(i, e.target.files[0])} />
                </label>
                <button onClick={() => handleRemove(i)} style={{ background: '#7f1d1d' }}>Remove</button>
              </div>
            </div>
          </div>
        ))}
        <div>
          <button onClick={handleAdd}>Add student</button>
        </div>
      </div>
    </div>
  )
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
function RosterArea({ students, onDropUnseat }: { students: Student[]; onDropUnseat: (studentId: string) => void }) {
  return (
    <div
      id="roster-area"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        const studentId = e.dataTransfer.getData('text/plain')
        if (studentId) onDropUnseat(studentId)
      }}
      style={{ border: '1px solid #444', borderRadius: 8, padding: 8, display: 'flex', flexDirection: 'column', gap: 8 }}
    >
      <h3 style={{ marginTop: 0 }}>Roster</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
        {students.map((s) => (
          <DraggableStudent key={s.id} student={s} />
        ))}
      </div>
    </div>
  )
}

function DraggableStudent({ student }: { student: Student }) {
  // Minimal drag handle via native draggable
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', student.id)
      }}
      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8, border: '1px solid #555', borderRadius: 6, background: 'rgba(255,255,255,0.06)' }}
    >
      <Avatar name={student.name} photoUrl={student.photoUrl} size={28} />
      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{student.name}</span>
    </div>
  )
}

function SeatCell({ id, student, disabled, onDropStudent, onToggleDisabled }: { id: number; student?: Student; disabled?: boolean; onDropStudent: (studentId: string) => void; onToggleDisabled: () => void }) {
  return (
    <div
      onClick={() => {
        if (!student) onToggleDisabled()
      }}
      onDragOver={(e) => {
        if (!disabled) e.preventDefault()
      }}
      onDrop={(e) => {
        if (disabled) return
        const studentId = e.dataTransfer.getData('text/plain')
        if (studentId) onDropStudent(studentId)
      }}
      style={{ position: 'relative', border: disabled ? '1px solid #555' : student ? '2px solid #374151' : '1px dashed #777', borderRadius: 6, background: disabled ? '#555' : student ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: !student ? 'pointer' : 'default' }}
    >
      {student ? <StudentCard student={student} /> : <span style={{ color: disabled ? '#ddd' : '#777', fontSize: 12 }}>{disabled ? 'No seat' : 'Empty'}</span>}
    </div>
  )
}

function StudentCard({ student }: { student: Student }) {
  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData('text/plain', student.id)}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: 6 }}
    >
      <Avatar name={student.name} photoUrl={student.photoUrl} size={48} />
      <span style={{ fontSize: 12, textAlign: 'center', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{student.name}</span>
    </div>
  )
}

function Avatar({ name, photoUrl, size = 40 }: { name: string; photoUrl?: string; size?: number }) {
  const initials = name
    .split(' ')
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return photoUrl ? (
    <img src={photoUrl} alt={name} width={size} height={size} style={{ borderRadius: '50%', objectFit: 'cover' }} />
  ) : (
    <div style={{ width: size, height: size, borderRadius: '50%', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
      {initials}
    </div>
  )
}

export default function ClassSeating() {
  const { classId = '' } = useParams()
  const [rows, setRows] = useState(5)
  const [cols, setCols] = useState(6)
  const [roster, setRoster] = useState<Student[]>([])
  const [seating, setSeating] = useState<Record<number, string>>({})
  const [editingRoster, setEditingRoster] = useState(false)
  const [disabledSeats, setDisabledSeats] = useState<number[]>([])

  useEffect(() => {
    if (!classId) return
    const cfg = getClassConfig(classId)
    setRows(cfg.rows)
    setCols(cfg.cols)
    setRoster(getRoster(classId))
    setSeating(getSeating(classId))
    setDisabledSeats(getDisabledSeats(classId))
  }, [classId])

  // Save occurs immediately in onChange handlers to avoid overwriting loaded values on mount

  const gridTemplate = useMemo(() => ({
    gridTemplateColumns: `repeat(${cols}, minmax(80px, 1fr))`,
    gridTemplateRows: `repeat(${rows}, 80px)`,
  }), [rows, cols])

  const cells = useMemo(() => Array.from({ length: rows * cols }, (_, i) => i), [rows, cols])

  const unseatedStudents = useMemo(() => {
    const seatedIds = new Set(Object.values(seating))
    return roster.filter((s) => !seatedIds.has(s.id))
  }, [roster, seating])

  function assignStudentToSeat(studentId: string, seatIndex: number) {
    if (!classId) return
    if (disabledSeats.includes(seatIndex)) return
    const updated = { ...seating }
    for (const key of Object.keys(updated)) {
      if (updated[Number(key)] === studentId) delete updated[Number(key)]
    }
    updated[seatIndex] = studentId
    setSeating(updated)
    saveSeating(classId, updated)
  }

  function unseatStudent(studentId: string) {
    if (!classId) return
    const updated = { ...seating }
    for (const key of Object.keys(updated)) {
      if (updated[Number(key)] === studentId) delete updated[Number(key)]
    }
    setSeating(updated)
    saveSeating(classId, updated)
  }

  function updateRoster(next: Student[]) {
    if (!classId) return
    setRoster(next)
    saveRoster(classId, next)
    // Clean seating for removed students
    const validIds = new Set(next.map((s) => s.id))
    const cleaned: Record<number, string> = {}
    for (const [k, v] of Object.entries(seating)) {
      if (validIds.has(v)) cleaned[Number(k)] = v
    }
    if (JSON.stringify(cleaned) !== JSON.stringify(seating)) {
      setSeating(cleaned)
      saveSeating(classId, cleaned)
    }
  }

  function clearSeating() {
    if (!classId) return
    setSeating({})
    saveSeating(classId, {})
  }

  function handleRowsChange(v: number) {
    setRows(v)
    if (classId) saveClassConfig(classId, { rows: v, cols })
  }

  function handleColsChange(v: number) {
    setCols(v)
    if (classId) saveClassConfig(classId, { rows, cols: v })
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/">← Back</Link>
          <h2 style={{ margin: 0 }}>Class: {classId}</h2>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <NumberInput label="Rows" value={rows} onChange={handleRowsChange} />
          <NumberInput label="Cols" value={cols} onChange={handleColsChange} />
          <button onClick={() => setEditingRoster((v) => !v)}>{editingRoster ? 'Close roster editor' : 'Edit roster'}</button>
          <button onClick={clearSeating} title="Remove all assignments">Clear seating</button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 320px) 1fr', alignItems: 'start', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '70vh', overflow: 'auto', paddingRight: 4 }}>
          <RosterArea students={unseatedStudents} onDropUnseat={unseatStudent} />
          {editingRoster && (
            <RosterEditor roster={roster} onChange={updateRoster} />
          )}
        </div>

        <div
          style={{
            display: 'grid',
            gap: 8,
            border: '1px solid #444',
            padding: 8,
            borderRadius: 8,
            ...gridTemplate,
          }}
        >
          {cells.map((i) => (
            <SeatCell
              key={i}
              id={i}
              disabled={disabledSeats.includes(i)}
              student={roster.find((s) => s.id === seating[i])}
              onDropStudent={(studentId) => assignStudentToSeat(studentId, i)}
              onToggleDisabled={() => {
                if (!classId) return
                const next = disabledSeats.includes(i)
                  ? disabledSeats.filter((x) => x !== i)
                  : [...disabledSeats, i]
                setDisabledSeats(next)
                if (next.includes(i) && seating[i]) {
                  const updated = { ...seating }
                  delete updated[i]
                  setSeating(updated)
                  saveSeating(classId, updated)
                }
                saveDisabledSeats(classId, next)
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}


