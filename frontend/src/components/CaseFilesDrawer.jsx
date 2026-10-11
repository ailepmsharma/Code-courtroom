import { useEffect, useRef } from 'react'

const CaseFilesDrawer = ({ files, error, onClose }) => {
  const closeRef = useRef(null)

  useEffect(() => {
    closeRef.current?.focus()
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'Tab') {
        event.preventDefault()
        closeRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="case-files-backdrop" role="presentation" onClick={onClose}>
      <aside
        className="case-files-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="case-files-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="drawer-handle" aria-hidden="true" />
        <header className="drawer-heading">
          <div>
            <div className="eyebrow subtle">Local archive</div>
            <h2 id="case-files-title">Case files</h2>
          </div>
          <button ref={closeRef} type="button" className="drawer-close" onClick={onClose} aria-label="Close case files">×</button>
        </header>
        {error && <p className="archive-error" role="status">{error}</p>}
        {files.length ? (
          <div className="case-file-stack">
            {files.map((file, index) => (
              <article
                className={`case-file case-file-${file.resultType}`}
                key={file.id}
                style={{ '--file-order': index }}
              >
                <span className="case-file-tab">CC · {String(files.length - index).padStart(3, '0')}</span>
                <div className="case-file-content">
                  <h3>{file.title}</h3>
                  <span className="case-file-stamp">{file.status}</span>
                  <p>{file.resultType === 'review' ? 'Unscored · Limited demo' : `${file.score ?? 'No score'}${file.score === null ? '' : '/100'}`}</p>
                  <time dateTime={file.date}>{new Date(file.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</time>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="archive-empty">
            <span aria-hidden="true">§</span>
            <h3>No cases on file</h3>
            <p>Your rulings will be saved here on this device.</p>
          </div>
        )}
      </aside>
    </div>
  )
}

export default CaseFilesDrawer
