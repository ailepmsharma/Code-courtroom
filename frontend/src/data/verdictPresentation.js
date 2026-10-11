const verdictPresentations = {
  issue: {
    symbol: '!',
    className: 'issue',
    accessibleName: 'Issue found',
  },
  clear: {
    symbol: '\u2713',
    className: 'clear',
    accessibleName: 'No critical issues found',
  },
  review: {
    symbol: '?',
    className: 'review',
    accessibleName: 'More evidence required',
  },
}

export const getVerdictPresentation = (resultType) => (
  verdictPresentations[resultType] ?? verdictPresentations.review
)
