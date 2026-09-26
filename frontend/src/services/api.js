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
      opening_statement:
        'This checkout routine reassigned the cart array instead of preserving a safe state boundary. The result is a shared-reference mutation that can wipe a user session mid-purchase.',
      charges: [
        {
          title: 'Mutable cart state is overwritten in place',
          description: 'The function replaces the cart reference instead of returning a fresh copy. That creates a destructive state mutation and breaks replay-safe updates.',
          severity: 'Critical',
          line: 3,
        },
        {
          title: 'Checkout leaks the live collection to callers',
          description: 'The function returns the original array instance, exposing internal state to outside mutation and making the payment flow vulnerable to race condition drift.',
          severity: 'Major',
          line: 8,
        },
      ],
      closing_statement:
        'The court should not accept a pattern that mutates shared state from inside the checkout boundary. This issue is structural and should be corrected before release.',
    },
    {
      speaker: 'Defense',
      side: 'defense',
      opening_statement:
        'The recovery step is compact and the reset is intentionally narrow, but the implementation still exposes the original object instead of a defensive clone.',
      charges: [
        {
          title: 'Reset logic is isolated but not isolated enough',
          description: 'The array is cleared in a contained path, yet the return value keeps the caller bound to the same object reference and undermines mutation safety.',
          severity: 'Major',
          line: 12,
        },
        {
          title: 'State cleanup is not non-mutating',
          description: 'A defensive copy would allow the function to clear the working cart without exposing the underlying collection to other consumers.',
          severity: 'Minor',
          line: 18,
        },
      ],
      closing_statement:
        'The function is close to compliant; the fix is straightforward and does not require redesigning the entire checkout flow.',
    },
  ] : hasKnownCartFlow ? [
    {
      speaker: 'Prosecutor',
      side: 'prosecutor',
      opening_statement:
        'The checkout flow preserves the active cart reference by copying the state before any cleanup occurs. That pattern prevents destructive mutation at the boundary.',
      charges: [
        {
          title: 'Defensive reset is in place',
          description: 'The reset path avoids overriding the original cart instance, which keeps the live collection stable for the rest of the session.',
          severity: 'Minor',
          line: 4,
        },
      ],
      closing_statement:
        'The prosecution accepts that the boundary is protected; the concern here is not a direct mutation leak but maintainability around future refactors.',
    },
    {
      speaker: 'Defense',
      side: 'defense',
      opening_statement:
        'The implementation is intentionally conservative: it copies the cart before clearing it, thereby keeping state management predictable without exposing the shared collection.',
      charges: [
        {
          title: 'No destructive mutation at the checkout boundary',
          description: 'The checkout function returns a fresh collection after reset, which keeps callers from unintentionally mutating the same object instance.',
          severity: 'Minor',
          line: 9,
        },
      ],
      closing_statement:
        'The evidence supports a safe reset pattern. This should remain in place unless a broader refactor changes the application state model.',
    },
  ] : [
    {
      speaker: 'Prosecutor',
      side: 'prosecutor',
      opening_statement:
        'This local review only evaluates one known cart-checkout pattern, so there is not enough structured evidence to sustain a finding against the submitted code.',
      charges: [
        {
          title: 'Pattern recognition cannot establish a violation',
          description: 'The demo is intentionally scoped to a curated code shape and does not claim to review arbitrary code beyond the known cart-flow sample.',
          severity: 'Minor',
          line: 1,
        },
      ],
      closing_statement:
        'The prosecution cannot overstate the result. This is a boundary-limited demo rather than a broad static analysis pass.',
    },
    {
      speaker: 'Defense',
      side: 'defense',
      opening_statement:
        'Without a matching cart pattern or live backend review, the system should not infer guilt from a generic code sample. The demo is intentionally safety-first.',
      charges: [
        {
          title: 'No actionable risk can be established from this snippet',
          description: 'The review engine is designed to analyze a selected checkout trace rather than produce a speculative verdict on arbitrary code.',
          severity: 'Minor',
          line: 1,
        },
      ],
      closing_statement:
        'The defense stands on the current limitations of the sample review: no signal means no finding, and no automatic conclusion should be treated as a release guarantee.',
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
    reasoning: isBuggy
      ? 'The issue is not speculative: the cart mutation occurs inside the checkout boundary and returns the live reference rather than a defensive copy. That creates a real risk of state loss and inconsistent purchase handling.'
      : hasKnownCartFlow
        ? 'The pattern preserves state integrity by resetting the working cart without exposing the original instance. The code meets the project’s local compliance requirements for this sample.'
        : 'The current review is intentionally narrow and cannot certify a result on arbitrary code. It only has enough context to evaluate curated cart-checkout examples.',
    recommendation: isBuggy
      ? 'Clone the current cart before reset and return a new array instead of mutating the original reference in place.'
      : hasKnownCartFlow
        ? 'Keep the defensive reset pattern and document the state boundary so future changes do not reintroduce shared-reference bugs.'
        : 'Try the buggy or clean cart sample to explore the demo, and do not use this result as a production security review.',
    detected: isBuggy ? 'State mutation' : hasKnownCartFlow ? 'No critical findings' : 'Not assessed',
    impact: isBuggy ? 'Checkout breakage' : hasKnownCartFlow ? 'No release blocker' : 'Unknown',
    sentence: isBuggy
      ? [
          'The checkout path mutates a shared cart reference instead of preserving a safe reset boundary.',
          'The ruling requires a defensive clone before state cleanup so that other callers do not observe destructive mutation.',
          'The recommended fix is to return a new array and leave the original object untouched.',
        ]
      : hasKnownCartFlow
        ? [
            'The state reset remains contained and does not overwrite the original shared reference.',
            'The checkout logic is consistent with a safe cart boundary and preserves internal integrity.',
            'This is strong enough for a local demo approval, with future changes still requiring explicit review.',
          ]
        : [
            'The engine is limited to the curated cart sample and cannot form a full conclusion for arbitrary code.',
            'No basis exists to classify the submitter’s snippet as a real defect without a recognized pattern match.',
            'Use the curated buggy or clean examples to confirm the review flow, not the general-purpose verdict logic.',
          ],
  }

    const judgeStatement = {
      speaker: 'Judge',
      side: 'judge',
      text: `${verdict.verdict}. ${verdict.summary}`,
      closing_statement: verdict.recommendation,
    }

  return {
    success: true,
    evidence: isBuggy ? evidence : [],
      transcript: [...transcript, judgeStatement],
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
