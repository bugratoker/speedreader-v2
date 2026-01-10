/**
 * Utility helper functions
 */

/**
 * Delay execution for specified milliseconds
 */
export const delay = (ms: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Format a number with thousand separators
 */
export const formatNumber = (num: number): string =>
    num.toLocaleString();

/**
 * Capitalize the first letter of a string
 */
export const capitalize = (str: string): string =>
    str.charAt(0).toUpperCase() + str.slice(1);

/**
 * Truncate a string to specified length with ellipsis
 */
export const truncate = (str: string, length: number): string =>
    str.length > length ? `${str.substring(0, length)}...` : str;

/**
 * Check if a value is empty (null, undefined, empty string, or empty array)
 */
export const isEmpty = (value: unknown): boolean => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
};
