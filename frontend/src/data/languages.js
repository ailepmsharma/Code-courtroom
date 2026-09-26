export const languageOptions = [
  { value: 'auto', label: 'Auto-detect' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
]

const languagePatterns = [
  {
    value: 'cpp',
    patterns: [
      /#\s*include\s*[<"]/,
      /\busing\s+namespace\s+std\b/,
      /\bstd\s*::|\bcout\b|\bcin\b/,
      /\bint\s+main\s*\(/,
    ],
  },
  {
    value: 'java',
    patterns: [
      /\bpublic\s+class\b|\bprivate\s+class\b/,
      /\bpublic\s+static\s+void\s+main\b/,
      /\bSystem\s*\.\s*out\s*\.\s*println\b/,
      /^\s*package\s+[\w.]+\s*;|^\s*import\s+java\./m,
    ],
  },
  {
    value: 'python',
    patterns: [
      /^\s*def\s+\w+\s*\(/m,
      /^\s*(?:from\s+\S+\s+import|import\s+\w+)/m,
      /^\s*elif\b|\bif\s+__name__\s*==\s*["']__main__["']/m,
      /\bprint\s*\(/,
    ],
  },
  {
    value: 'javascript',
    patterns: [
      /\b(?:const|let|var)\s+\w+\s*=/,
      /\bfunction\s+\w+\s*\(/,
      /=>|\bconsole\s*\.\s*log\s*\(/,
      /^\s*import\s+.+\s+from\s+["']/m,
    ],
  },
]

export const detectLanguage = (code) => {
  if (!code?.trim()) {
    return null
  }

  const scores = languagePatterns.map(({ value, patterns }) => ({
    value,
    score: patterns.reduce((total, pattern) => total + Number(pattern.test(code)), 0),
  })).sort((left, right) => right.score - left.score)

  if (scores[0].score < 2 || scores[0].score === scores[1].score) {
    return null
  }

  return languageOptions.find(({ value }) => value === scores[0].value) ?? null
}

export const getLanguageHint = (code, selection) => {
  if (selection !== 'auto') {
    return { language: selection, detected: false }
  }

  const detectedLanguage = detectLanguage(code)

  return {
    language: detectedLanguage?.value ?? 'auto',
    detected: Boolean(detectedLanguage),
  }
}
