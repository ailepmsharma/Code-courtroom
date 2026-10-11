import { useEffect, useState } from 'react'
import ScrambleText from './ScrambleText.jsx'

const Header = ({ reduceEffects, onToggleEffects, onOpenCaseFiles, caseFilesCount, onRunDemo, onTogglePresentation, presentationMode, demoRunning }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const updateScroll = () => setIsScrolled(window.scrollY > 12)
    const closeOnEscape = (event) => {
      if (event.key === 'Escape' || event.key.toLowerCase() === 'p') setMenuOpen(false)
    }
    window.addEventListener('scroll', updateScroll, { passive: true })
    window.addEventListener('keydown', closeOnEscape)
    updateScroll()
    return () => {
      window.removeEventListener('scroll', updateScroll)
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const openFiles = () => {
    setMenuOpen(false)
    onOpenCaseFiles()
  }

  return (
    <>
      <header className={`topbar ${isScrolled ? 'is-scrolled' : ''}`}>
        <a className="brand" href="#page-title" aria-label="Code Courtroom home">
          <span className="brand-name">CODE COURTROOM</span>
        </a>
        <div className="topbar-actions">
          <button
            type="button"
            className={`menu-toggle ${menuOpen ? 'is-open' : ''}`}
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="courtroom-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <span /><span />
          </button>
        </div>
      </header>

      <div
        className={`menu-overlay ${menuOpen ? 'is-open' : ''}`}
        id="courtroom-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Courtroom menu"
        aria-hidden={!menuOpen}
        inert={!menuOpen}
      >
        <div className="menu-overlay-inner">
          <div className="menu-overlay-top">
            <span>CODE COURTROOM</span>
            <button type="button" className="menu-close" onClick={() => setMenuOpen(false)}>CLOSE ×</button>
          </div>
          <nav className="menu-links" aria-label="Courtroom sections">
            <a href="#input-section" aria-label="The evidence" onClick={() => setMenuOpen(false)}><span>01</span> <ScrambleText text="The evidence" /></a>
            <a href="#transcript-section" aria-label="The argument" onClick={() => setMenuOpen(false)}><span>02</span> <ScrambleText text="The argument" /></a>
            <a href="#verdict-section" aria-label="The verdict" onClick={() => setMenuOpen(false)}><span>03</span> <ScrambleText text="The verdict" /></a>
          </nav>
          <div className="menu-tools">
            <button type="button" className="menu-tool-button" onClick={() => { setMenuOpen(false); onRunDemo() }} disabled={demoRunning}>
              Run demo
            </button>
            <button type="button" className="menu-tool-button" onClick={() => { setMenuOpen(false); onTogglePresentation() }} aria-pressed={presentationMode}>
              {presentationMode ? 'Exit presentation' : 'Presentation mode'}
            </button>
            <button type="button" className="menu-tool-button" onClick={openFiles}>
              Case files <span>{caseFilesCount}</span>
            </button>
            <button
              type="button"
              className="menu-tool-button"
              onClick={onToggleEffects}
              aria-pressed={reduceEffects}
            >
              {reduceEffects ? 'Restore animations' : 'Reduce animations'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Header
