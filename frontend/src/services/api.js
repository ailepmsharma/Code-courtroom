const simulateAnalysis = (code) => {
  if (!code || !code.trim()) {
    return {
      success: false,
      error: 'Add some code before you put it on trial',
    }
  }

  const isBuggy = /(?:^|[;{}\n])\s*cart\s*=\s*\[\]/.test(code) || /return\s+cart\b/.test(code)

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
  ] : [
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
  ]

  const verdict = {
    status: isBuggy ? 'Issue found' : 'No critical issues',
    score: isBuggy ? 92 : 87,
    verdict: isBuggy ? 'Needs patch before release' : 'Approved with minor cleanup',
    summary: isBuggy
      ? 'The cart is mutated by reassigning the array reference inside checkout(), which can silently clear user state and break the purchase flow.'
      : 'The submitted logic is structurally sound and avoids destructive state mutation during cleanup.',
    recommendation: isBuggy
      ? 'Clone the current cart before reset and return a new array instead of mutating the original reference in place.'
      : 'Keep the defensive reset pattern and document the state boundary so future changes do not reintroduce shared-reference bugs.',
  }

  return {
    success: true,
    evidence: isBuggy ? evidence : [],
    transcript,
    verdict,
  }
}

export const analyzeCase = async (code) => {
  await new Promise((resolve) => setTimeout(resolve, 800))
  return simulateAnalysis(code)
}
