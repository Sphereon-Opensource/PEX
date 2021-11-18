export const LIMIT_DISCLOSURE_SIGNATURES_SUITES =
  process.env.LIMIT_DISCLOSURE_SIGNATURES_SUITES ? ["bbs+"].concat(process.env.LIMIT_DISCLOSURE_SIGNATURES_SUITES.split(', ')): ['bbs+'];