const Header = () => (
  <header className="topbar">
    <a className="brand" href="#input-section" aria-label="Code Courtroom home">
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 40 40" fill="none" focusable="false">
          <path d="M20 6v24M11 11h18M20 9l-8 13m8-13 8 13M8 22h8c-.5 3.2-2 5-4 5s-3.5-1.8-4-5Zm16 0h8c-.5 3.2-2 5-4 5s-3.5-1.8-4-5ZM14 33h12M17 30h6" />
        </svg>
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
