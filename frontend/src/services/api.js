const simulateAnalysis = (code) => {
  if (!code || !code.trim()) {
    return {
      success: false,
      error: 'Add some code before you put it on trial',
    }
  }

  const hasKnownCartFlow = /\bcart\s*=\s*\[\s*\]/.test(code) && /\bcheckout\s*\(/.test(code)
  const isBuggy = hasKnownCartFlow && (
    /(?:^|[;{}\n])\s*cart\s*=\s*\[\]/.test(code) || /return\s+cart\b/.test(code)
  )

  const evidence = [
    {
      line: 3,
      label: 'State mutation during checkout',
      description:
        'The cart array is reassigned directly inside checkout(), which mutates the shared object reference and can clear state unexpectedly during purchase handling.',
      severity: 'Critical',
      confidence: 96,
    },
    {
      line: 8,
      label: 'Return value exposes mutable state',
      description:
        'The function returns the original cart reference instead of a defensive copy, allowing external callers to mutate the same instance.',
      severity: 'Major',
      confidence: 89,
    },
  ]

  const transcript = isBuggy ? [
    {
      speaker: 'Prosecutor',
      side: 'prosecutor',
      text:
        'The checkout routine reassigns the cart array instead of resetting state safely. That creates a mutable reference leak and can wipe the user session mid-flow.',
    },
    {
      speaker: 'Defense',
      side: 'defense',
      text:
        'The mutation is isolated to the reset step, but the original array object is still being exposed outside the function boundary.',
    },
    {
      speaker: 'Judge',
      side: 'judge',
      text:
        'This is a clear state-management issue. The ruling favors a defensive clone and a reset that does not mutate shared references.',
    },
  ] : hasKnownCartFlow ? [
    {
      speaker: 'Prosecutor',
      side: 'prosecutor',
      text:
        'The checkout flow takes a defensive copy before clearing the cart, preserving the live collection for other callers.',
    },
    {
      speaker: 'Defense',
      side: 'defense',
      text:
        'The empty-cart guard and copied order snapshot keep the checkout path predictable without exposing shared state.',
    },
    {
      speaker: 'Judge',
      side: 'judge',
      text:
        'No critical state leak is apparent in this sample. The defensive copy keeps the cart boundary intact through checkout.',
    },
  ] : [
    {
      speaker: 'Prosecutor',
      side: 'prosecutor',
      text:
        'This local demo only examines one known cart-checkout pattern, so it cannot substantiate a charge against this snippet.',
    },
    {
      speaker: 'Defense',
      side: 'defense',
      text:
        'Without a connected analysis service or a recognized cart flow, the code should not be treated as cleared.',
    },
    {
      speaker: 'Judge',
      side: 'judge',
      text:
        'No automated conclusion is available. Use a curated cart sample to see the local demo rules in action.',
    },
  ]

  const verdict = {
    status: isBuggy ? 'Issue found' : hasKnownCartFlow ? 'No critical issues' : 'Limited demo',
    resultType: isBuggy ? 'issue' : hasKnownCartFlow ? 'clear' : 'review',
    score: hasKnownCartFlow ? (isBuggy ? 92 : 87) : null,
    verdict: isBuggy
      ? 'Needs patch before release'
      : hasKnownCartFlow
        ? 'Approved with minor cleanup'
        : 'No automated conclusion',
    summary: isBuggy
      ? 'The cart is mutated by reassigning the array reference inside checkout(), which can silently clear user state and break the purchase flow.'
      : hasKnownCartFlow
        ? 'The submitted logic is structurally sound and avoids destructive state mutation during cleanup.'
        : 'This prototype uses local rules for a curated cart-checkout example. No AI model or backend is connected to review arbitrary code.',
    recommendation: isBuggy
      ? 'Clone the current cart before reset and return a new array instead of mutating the original reference in place.'
      : hasKnownCartFlow
        ? 'Keep the defensive reset pattern and document the state boundary so future changes do not reintroduce shared-reference bugs.'
        : 'Try the buggy or clean cart sample to explore the demo, and do not use this result as a production security review.',
    detected: isBuggy ? 'State mutation' : hasKnownCartFlow ? 'No critical findings' : 'Not assessed',
    impact: isBuggy ? 'Checkout breakage' : hasKnownCartFlow ? 'No release blocker' : 'Unknown',
  }

  return {
    success: true,
    evidence: isBuggy ? evidence : [],
    transcript,
    verdict,
  }
}

export const analyzeCase = async (code, languageHint = { language: 'auto', detected: false }) => {
  await new Promise((resolve) => setTimeout(resolve, 800))
  return {
    ...simulateAnalysis(code),
    languageHint,
  }
}
