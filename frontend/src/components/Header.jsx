const Header = () => (
  <header className="topbar">
    <a className="brand" href="#input-section" aria-label="Code Courtroom home">
      <span className="brand-mark" aria-hidden="true">
        CC
      </span>
      <div>
        <span className="brand-name">CODE COURTROOM</span>
        <span className="brand-tag">Your code is on trial</span>
      </div>
    </a>

    <nav className="topbar-actions" aria-label="Courtroom sections">
      <a className="nav-link" href="#transcript-section">Transcript</a>
      <a className="nav-link ghost" href="#verdict-section">Verdict</a>
    </nav>
  </header>
)

export default Header
