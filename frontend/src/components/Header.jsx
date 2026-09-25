const Header = () => (
  <header className="topbar">
    <div className="brand" aria-label="Code Courtroom brand">
      <span className="brand-mark" aria-hidden="true">
        ⚖️
      </span>
      <div>
        <span className="brand-name">Code Courtroom</span>
        <span className="brand-tag">Your code is on trial</span>
      </div>
    </div>

    <div className="topbar-actions">
      <button type="button" className="nav-link">
        Case log
      </button>
      <button type="button" className="nav-link ghost">
        Live verdicts
      </button>
    </div>
  </header>
)

export default Header
