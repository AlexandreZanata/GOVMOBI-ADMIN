/**
 * Allowed MIME types for profile photo uploads.
 * Matches the backend's accepted formats: JPEG, PNG, WebP.
 */
export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

/**
 * Maximum allowed file size for profile photo uploads: 5 MB.
 */
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

/**
 * Result of a file validation check.
 */
export interface FileValidationResult {
  /** Whether the file passes all validation rules. */
  valid: boolean;
  /** The specific validation error, if any. */
  error?: "INVALID_TYPE" | "FILE_TOO_LARGE";
}

/**
 * Validates a file for profile photo upload.
 *
 * Checks:
 * 1. MIME type must be one of: image/jpeg, image/png, image/webp
 * 2. File size must not exceed 5 MB (5_242_880 bytes)
 *
 * @param file - The File object to validate
 * @returns A FileValidationResult indicating whether the file is valid
 */
export function validateFile(file: File): FileValidationResult {
  if (!ALLOWED_MIME_TYPES.includes(file.type as AllowedMimeType)) {
    return { valid: false, error: "INVALID_TYPE" };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: "FILE_TOO_LARGE" };
  }
  return { valid: true };
}
