import { useCallback, useEffect, useRef, useState } from 'react'
import ChatBubble from './ChatBubble'
import ErrorBanner from './ErrorBanner'
import EvidencePanel from './EvidencePanel'
import LoadingState from './LoadingState'
import TrialProgress from './TrialProgress'
import CourtroomCast from './CourtroomCast'

const roleFilters = [
  { label: 'All', value: 'all' },
  { label: 'Prosecutor', value: 'prosecutor' },
  { label: 'Defense', value: 'defense' },
  { label: 'Judge', value: 'judge' },
]

const TranscriptView = ({ transcript, evidence, isSubmitting, loadingStage, progress, error, onRetry, onDismissError, onSelectLine }) => {
  const [activeRole, setActiveRole] = useState('all')
  const [soundsEnabled, setSoundsEnabled] = useState(false)
  const audioContextRef = useRef(null)
  const previousLengthRef = useRef(0)
  const wasSubmittingRef = useRef(false)

  const playCourtSound = useCallback((kind) => {
    if (!soundsEnabled) return

    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return
    const context = audioContextRef.current ?? new AudioContextClass()
    audioContextRef.current = context
    if (context.state === 'suspended') void context.resume()

    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const now = context.currentTime
    oscillator.type = kind === 'gavel' ? 'triangle' : 'sine'
    oscillator.frequency.setValueAtTime(kind === 'gavel' ? 150 : 440, now)
    oscillator.frequency.exponentialRampToValueAtTime(kind === 'gavel' ? 65 : 330, now + (kind === 'gavel' ? 0.16 : 0.12))
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(kind === 'gavel' ? 0.13 : 0.035, now + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + (kind === 'gavel' ? 0.22 : 0.15))
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start(now)
    oscillator.stop(now + 0.24)
  }, [soundsEnabled])

  useEffect(() => () => {
    if (audioContextRef.current) void audioContextRef.current.close()
  }, [])

  useEffect(() => {
    if (transcript.length > previousLengthRef.current) playCourtSound('voice')
    if (wasSubmittingRef.current && !isSubmitting && transcript.length > 0) playCourtSound('gavel')
    previousLengthRef.current = transcript.length
    wasSubmittingRef.current = isSubmitting
  }, [isSubmitting, playCourtSound, transcript.length])

  const visibleTranscript = activeRole === 'all'
    ? transcript
    : transcript.filter((entry) => entry.side === activeRole)

  return (
    <section id="transcript-section" data-section="02" aria-labelledby="transcript-heading" className={`panel transcript-panel ${transcript.length > 0 || isSubmitting ? 'is-visible' : ''}`}>
      <div className="section-header-row compact">
        <div>
          <div className="eyebrow subtle">The Argument</div>
          <h2 id="transcript-heading">Trial transcript</h2>
        </div>
        <button
          type="button"
          className="sound-toggle"
          aria-pressed={soundsEnabled}
          onClick={() => {
            const nextEnabled = !soundsEnabled
            setSoundsEnabled(nextEnabled)
            if (nextEnabled) {
              const AudioContextClass = window.AudioContext || window.webkitAudioContext
              if (AudioContextClass) {
                audioContextRef.current ??= new AudioContextClass()
                if (audioContextRef.current.state === 'suspended') void audioContextRef.current.resume()
              }
            }
          }}
        >
          {soundsEnabled ? 'Sound on' : 'Sound off'}
        </button>
      </div>

      {(transcript.length > 0 || isSubmitting) && <CourtroomCast activeSpeaker={isSubmitting ? loadingStage : ''} />}
      {isSubmitting && (
        <svg className={`tension-line tension-${loadingStage}`} viewBox="0 0 600 48" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 24h145l12-1 10 1 12-2 12 4 10-24 11 38 12-16h44l12-1 10 1 12-2 12 4 10-24 11 38 12-16h44l12-1 10 1 12-2 12 4 10-24 11 38 12-16h145" />
        </svg>
      )}
      {isSubmitting && (
        <div className={`court-session-badge ${loadingStage === 'judge' ? 'is-deliberating' : ''}`} role="status">
          <span className="heartbeat" aria-hidden="true" />
          COURT IS IN SESSION
        </div>
      )}
      <TrialProgress progress={progress} />
      <ErrorBanner message={error} onRetry={onRetry} onDismiss={onDismissError} isRetrying={isSubmitting} />

      {transcript.length > 0 && (
        <div className="transcript-role-tabs" role="group" aria-label="Filter transcript by courtroom role">
          {roleFilters.map((role) => (
            <button
              key={role.value}
              type="button"
              aria-pressed={activeRole === role.value}
              className={`transcript-role-tab ${activeRole === role.value ? 'is-active' : ''}`}
              onClick={() => setActiveRole(role.value)}
            >
              {role.label}
            </button>
          ))}
        </div>
      )}

      {transcript.length > 0 ? (
        <div className="transcript-list" aria-live="polite">
          {visibleTranscript.map((entry) => (
            <ChatBubble
              key={`${entry.side}-${entry.speaker}`}
              speaker={entry.speaker}
              side={entry.side}
              text={entry.text}
              entry={entry}
            />
          ))}
          {isSubmitting && loadingStage && <LoadingState stage={loadingStage} progress={progress} />}
        </div>
      ) : isSubmitting ? (
        <LoadingState stage={loadingStage} progress={progress} />
      ) : (
        <article className="empty-state" aria-labelledby="transcript-empty-title">
          <div className="empty-icon" aria-hidden="true">
            §
          </div>
          <h3 id="transcript-empty-title">Awaiting trial…</h3>
          <p>Submit a case to begin the examination.</p>
        </article>
      )}
      <EvidencePanel evidence={evidence} onSelectLine={onSelectLine} />
    </section>
  )
}

export default TranscriptView
