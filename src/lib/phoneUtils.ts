/**
 * Phone utility functions for formatting and unformatting
 * Brazilian phone numbers.
 *
 * @module phoneUtils
 */

/**
 * Applies a Brazilian phone mask to a raw digit string.
 *
 * - 11 digits → `(XX) XXXXX-XXXX` (mobile)
 * - 10 digits → `(XX) XXXX-XXXX` (landline)
 * - Other lengths → returns the original value unchanged
 *
 * @param value - A string of digits representing a phone number
 * @returns The formatted phone string, or the original value if the digit
 *          count is not 10 or 11
 *
 * @example
 * ```ts
 * formatPhone("11987654321"); // "(11) 98765-4321"
 * formatPhone("1134567890");  // "(11) 3456-7890"
 * formatPhone("123");         // "123"
 * ```
 */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "");

  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return value;
}

/**
 * Strips all non-digit characters from a phone string, returning only the
 * raw digits.
 *
 * @param value - A phone string in any format (masked or raw)
 * @returns A string containing only digit characters
 *
 * @example
 * ```ts
 * unformatPhone("(11) 98765-4321"); // "11987654321"
 * unformatPhone("11987654321");     // "11987654321"
 * unformatPhone("");                // ""
 * ```
 */
export function unformatPhone(value: string): string {
  return value.replace(/\D/g, "");
}
