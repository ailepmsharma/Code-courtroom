import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/variables.css'
import './index.css'
import './styles/animations.css'
import './App.css'
import './components/Header.css'
import './components/AmbientEffects.css'
import './components/HeroPanel.css'
import './components/InputPanel.css'
import './components/TranscriptView.css'
import './components/TrialProgress.css'
import './components/CourtroomCast.css'
import './components/ChatBubble.css'
import './components/CourtroomShared.css'
import './components/EvidencePanel.css'
import './components/LoadingState.css'
import './components/ErrorBanner.css'
import './components/VerdictCard.css'
import './components/CaseFilesDrawer.css'
import './components/IntroOverlay.css'
import './components/CourtroomStory.css'
import './styles/responsive.css'
import './styles/redesign.css'
import Courtroom from './pages/Courtroom.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Courtroom />
  </StrictMode>,
)
