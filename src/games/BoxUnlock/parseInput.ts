// 1. Define the shape of our standardized polynomial
export interface SimplifiedPolynomialTerm {
  coefficient: number;
  exponent: number;
}

export interface SimplifiedPolynomial {
  variable: string;
  terms: SimplifiedPolynomialTerm[];
  isSimplified: boolean;
}

/**
 * Parses a raw LaTeX string into a standardized Polynomial object.
 * * @param latex - The input string (e.g., "x^{12} + -2x + 3.5")
 * @returns A Polynomial object with combined and sorted terms.
 */
export function parseLatexPolynomial(latex: string): SimplifiedPolynomial {
  // --- A. Preprocessing ---
  let isSimplified = true;

  // 1. Remove spaces and LaTeX formatting noise like \left, \right
  let cleanPoly = latex.replace(/\s+/g, "").replace(/\\left|\\right/g, "");

  // 2. Normalize signs:
  //    Replace "+-" or "-+" with "-", "--" with "+", etc.
  cleanPoly = cleanPoly
    .replace(/\+\-/g, "-")
    .replace(/\-\+/g, "-")
    .replace(/\-\-/g, "+")
    .replace(/\+\+/g, "+");

  // 3. Detect the variable used (looks for the first alphabetical char)
  //    Default to 'x' if strictly numeric.
  const variableMatch = cleanPoly.match(/[a-zA-Z]/);
  const variable = variableMatch ? variableMatch[0] : "x";

  // --- B. The Parsing Logic ---

  /* Regex Breakdown:
     1. ([+-]?)                  -> Capture the sign (optional)
     2. (\d+(?:\.\d+)?)?         -> Capture the coefficient (optional, supports decimals)
     3. (?:[a-zA-Z])?            -> Match the variable (non-capturing, optional)
     4. (?:\^\{?(-?\d+)\}?)?     -> Capture the exponent (optional). 
                                    Matches "^2" or "^{12}". Handles negative exponents.
  */
  // We construct the regex dynamically to match the specific variable found
  const pattern = new RegExp(
    `([+-]?)(?:(\\d+(?:\\.\\d+)?))?(?:${variable})?(?:\\^\\{?(-?\\d+)\\}?)?`,
    "g"
  );

  const termMap = new Map<number, number>();

  let match;
  // regex.exec loops through all matches in the string
  while ((match = pattern.exec(cleanPoly)) !== null) {
    // Avoid infinite loops on empty string matches (a quirk of "optional" regex groups)
    if (match.index === pattern.lastIndex) {
      pattern.lastIndex++;
    }

    // If the match is empty (blank string), skip it
    if (match[0] === "") continue;

    const [fullMatch, signStr, coeffStr, expStr] = match;

    // --- C. Interpret the Match ---

    // 1. Determine Coefficient
    let coefficient = 1;
    if (coeffStr) {
      coefficient = parseFloat(coeffStr);
    }

    // Apply the sign
    if (signStr === "-") {
      coefficient *= -1;
    }

    // 2. Determine Exponent
    // We must analyze if the variable was present in this specific chunk
    const hasVariable = fullMatch.includes(variable);

    let exponent = 0;
    if (hasVariable) {
      if (expStr) {
        // Explicit exponent (e.g., x^2)
        exponent = parseInt(expStr, 10);
      } else {
        // Implicit exponent (e.g., x)
        exponent = 1;
      }
    } else {
      // No variable means it's a constant (e.g., 5) -> exponent 0
      exponent = 0;
    }

    // --- D. Combine Like Terms ---
    if (termMap.has(exponent)) {
      isSimplified = false;
    }
    const currentCoeff = termMap.get(exponent) || 0;
    termMap.set(exponent, currentCoeff + coefficient);
  }

  // --- E. Format Output ---

  // Convert map to array, filter out zero coefficients, and sort by exponent descending
  const terms: SimplifiedPolynomialTerm[] = Array.from(termMap.entries())
    .map(([exponent, coefficient]) => ({ exponent, coefficient }))
    .filter((term) => term.coefficient !== 0)
    .sort((a, b) => b.exponent - a.exponent);

  return {
    variable,
    terms,
    isSimplified,
  };
}

export function simplifiedPolynomialsAreEqual(
  poly1: SimplifiedPolynomial,
  poly2: SimplifiedPolynomial
): boolean {
  // 1. Check variable
  if (poly1.variable !== poly2.variable) return false;

  // 2. Check number of terms
  if (poly1.terms.length !== poly2.terms.length) return false;

  // 3. Check each term
  for (let i = 0; i < poly1.terms.length; i++) {
    const term1 = poly1.terms[i];
    const term2 = poly2.terms[i];

    if (
      term1.exponent !== term2.exponent ||
      term1.coefficient !== term2.coefficient
    ) {
      return false;
    }
  }

  return true;
}

// --- Re-using definitions from the previous step ---
interface PolynomialTerm {
  coefficient: number;
  exponent: number;
}
interface Polynomial {
  variable: string;
  terms: PolynomialTerm[];
}

// --- New Interface for Factored Structure ---
interface PolynomialFactor {
  base: Polynomial; // The polynomial inside the parens
  power: number; // The exponent applied to the parens
}

export interface FactoredPolynomial {
  factors: PolynomialFactor[];
}

/**
 * Parses a string of multiplied polynomial factors.
 * Example Input: "\left(x^2 - 1\right)^2 (x + 3)"
 */
export function parseFactoredLatex(latex: string): FactoredPolynomial {
  // 1. Pre-process: Clean formatting and standardize delimiters
  //    We replace \left( and \right) with simple ( and ) for easier counting.
  let cleanStr = latex.replace(/\\left/g, "").replace(/\\right/g, "");
  cleanStr = cleanStr.replace(/\s/g, ""); // Remove all spaces

  const factors: PolynomialFactor[] = [];

  // Buffer to capture loose terms between groups (e.g., "2x" in "2x(x+1)")
  let buffer = "";
  let i = 0;

  // Helper to flush the buffer as a distinct factor
  const flushBuffer = () => {
    if (buffer.length > 0) {
      // If the buffer is just a multiplication sign or empty, ignore it
      if (!/^[\*\.]+$/.test(buffer)) {
        factors.push({
          base: parseLatexPolynomial(buffer), // Use previous function
          power: 1,
        });
      }
      buffer = "";
    }
  };

  // 2. Walk the string character by character
  while (i < cleanStr.length) {
    const char = cleanStr[i];

    if (char === "(" || char === "[") {
      // We hit the start of a group. First, process anything pending in the buffer.
      flushBuffer();

      // Find the matching closing bracket
      const openChar = char;
      const closeChar = char === "(" ? ")" : "]";
      let depth = 1;
      let start = i + 1;
      let end = -1;

      // Advance until we find the matching close
      let j = i + 1;
      while (j < cleanStr.length) {
        if (cleanStr[j] === openChar) depth++;
        else if (cleanStr[j] === closeChar) depth--;

        if (depth === 0) {
          end = j;
          break;
        }
        j++;
      }

      if (end === -1) {
        throw new Error("Mismatched parentheses in input string.");
      }

      // Extract the content inside the parens
      const content = cleanStr.substring(start, end);

      // Check for an exponent immediately following the group: (A)^2 or (A)^{12}
      let power = 1;
      let nextIndex = end + 1;

      if (nextIndex < cleanStr.length && cleanStr[nextIndex] === "^") {
        nextIndex++; // Skip '^'
        // Check if the exponent is in braces {n} or just a digit n
        if (cleanStr[nextIndex] === "{") {
          const braceEnd = cleanStr.indexOf("}", nextIndex);
          power = parseInt(cleanStr.substring(nextIndex + 1, braceEnd));
          nextIndex = braceEnd + 1;
        } else {
          // Grab all consecutive digits (e.g. ^12)
          // Note: Standard LaTeX without braces usually only takes one char,
          // but we allow robust parsing here.
          const match = cleanStr.substring(nextIndex).match(/^\d+/);
          if (match) {
            power = parseInt(match[0]);
            nextIndex += match[0].length;
          }
        }
      }

      // Parse the inner content and add to factors
      factors.push({
        base: parseLatexPolynomial(content),
        power: power,
      });

      // Move main cursor to where we finished
      i = nextIndex;
    } else {
      // Not a group start, just add to buffer
      buffer += char;
      i++;
    }
  }

  // Flush any remaining buffer (e.g. the "x" in "(x+1)x")
  flushBuffer();

  return { factors };
}

/**
 * 1. HELPER: Generates a unique "fingerprint" string for a single polynomial.
 * This handles:
 * - Sorting terms by exponent (descending).
 * - explicit coefficients (-x becomes -1x).
 * - Removing zero coefficients.
 */
function getPolynomialSignature(poly: Polynomial): string {
  // 1. Filter out zero coefficients (unless it's the only term, e.g. "0")
  let activeTerms = poly.terms.filter((t) => Math.abs(t.coefficient) > 1e-9);

  // If everything canceled out, it's just 0
  if (activeTerms.length === 0) {
    return "0";
  }

  // 2. Sort by exponent descending (x^2 before x)
  activeTerms.sort((a, b) => b.exponent - a.exponent);

  // 3. Build string: "1x^2+-2x^1+5x^0"
  return activeTerms
    .map((term) => {
      // We use a fixed precision to avoid floating point mismatches (0.33333 vs 1/3)
      // If you need exact fraction support, you'd use a Fraction class here instead of number.
      const coeff = parseFloat(term.coefficient.toFixed(6));
      return `${coeff}${poly.variable}^${term.exponent}`;
    })
    .join("+");
}

/**
 * 2. MAIN COMPARISON FUNCTION
 * Determines if two FactoredPolynomial objects are structurally identical.
 * It allows for reordering factors and merging exponents, but enforces
 * that the actual factors must match (rejecting un-factored versions).
 */
export function areFactoredPolynomialsEqual(
  fp1: FactoredPolynomial,
  fp2: FactoredPolynomial
): boolean {
  // Helper to turn a FactoredPolynomial into a Map of { signature: totalPower }
  // This handles cases where a student writes (x+1)(x+1) vs (x+1)^2
  const createFactorMap = (fp: FactoredPolynomial) => {
    const map = new Map<string, number>();

    for (const factor of fp.factors) {
      const signature = getPolynomialSignature(factor.base);

      // If the base is just "1" (constant 1), we can ignore it effectively
      // unless you want to be strict about constant multipliers.
      // Usually in factoring, 1 is invisible.
      if (signature === `1${factor.base.variable}^0`) continue;

      const currentPower = map.get(signature) || 0;
      map.set(signature, currentPower + factor.power);
    }
    return map;
  };

  const map1 = createFactorMap(fp1);
  const map2 = createFactorMap(fp2);

  // 1. Check if they have the same number of unique factors
  if (map1.size !== map2.size) {
    return false;
  }

  // 2. Check if every factor in Map1 exists in Map2 with the exact same power
  for (const [signature, power1] of map1.entries()) {
    const power2 = map2.get(signature);

    // If the factor is missing in the second map, or the powers don't match
    if (power2 === undefined || power2 !== power1) {
      return false;
    }
  }

  return true;
}
