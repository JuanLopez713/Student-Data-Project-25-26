import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import ClassSeating from './pages/ClassSeating'
import './App.css'

function Home() {
  const navigate = useNavigate()
  const defaultClasses = [
    { id: 'block-2-algebra-ii', name: 'Block 2 - Algebra II' },
    { id: 'block-6-htcs', name: 'Block 6 - Honors Topics in Computer Science' },
  ]

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', textAlign: 'left' }}>
      <h1>Classes</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {defaultClasses.map((c) => (
          <button key={c.id} onClick={() => navigate(`/class/${c.id}`)}>{c.name}</button>
        ))}
      </div>
    </div>
  )
}

function App() {
  return (
    <div>
      <nav style={{ padding: 12 }}>
        <Link to="/">Home</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/class/:classId" element={<ClassSeating />} />
      </Routes>
    </div>
  )
}

export default App
