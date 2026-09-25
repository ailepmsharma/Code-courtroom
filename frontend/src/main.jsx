import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/variables.css'
import './index.css'
import './App.css'
import Courtroom from './pages/Courtroom.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Courtroom />
  </StrictMode>,
)
