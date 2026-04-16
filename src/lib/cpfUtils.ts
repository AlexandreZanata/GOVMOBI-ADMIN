/**
 * CPF utility functions for formatting, unformatting, and validating
 * Brazilian CPF (Cadastro de Pessoas Físicas) numbers.
 *
 * @module cpfUtils
 */

// Re-export formatCpf from the original module for centralised access
export { formatCpf } from "./formatCpf";

/**
 * Strips all non-digit characters from a CPF string, returning only the
 * raw digits.
 *
 * @param value - A CPF string in any format (masked or raw)
 * @returns A string containing only digit characters
 *
 * @example
 * ```ts
 * unformatCpf("123.456.789-09"); // "12345678909"
 * unformatCpf("12345678909");    // "12345678909"
 * unformatCpf("");               // ""
 * ```
 */
export function unformatCpf(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Checks whether a value represents a valid CPF format — exactly 11 digits
 * after stripping all non-digit characters.
 *
 * This validates the **format** only (digit count), not the mathematical
 * check-digit algorithm.
 *
 * @param value - A CPF string in any format (masked or raw)
 * @returns `true` if the value contains exactly 11 digits, `false` otherwise
 *
 * @example
 * ```ts
 * isValidCpfFormat("123.456.789-09"); // true
 * isValidCpfFormat("12345678909");    // true
 * isValidCpfFormat("1234567890");     // false (10 digits)
 * isValidCpfFormat("");               // false
 * ```
 */
export function isValidCpfFormat(value: string): boolean {
  return unformatCpf(value).length === 11;
}
