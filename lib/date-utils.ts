import { formatDistanceToNow, parseISO, isValid } from "date-fns";
import { nb } from "date-fns/locale";

/**
 * Format a date as a relative time (e.g., "2 days ago", "in 3 months")
 * @param date Date to format (Date object or ISO string)
 * @param options Additional formatting options
 * @returns Formatted relative date string
 */
export function formatRelativeDate(
  date: Date | string | undefined,
  options: {
    addSuffix?: boolean;
    includeSeconds?: boolean;
  } = { addSuffix: true }
): string {
  if (!date) return "";
  
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    
    if (!isValid(dateObj)) {
      return String(date); // Return the original input if it's not a valid date
    }
    
    return formatDistanceToNow(dateObj, {
      addSuffix: options.addSuffix,
      includeSeconds: options.includeSeconds,
      locale: nb // Norwegian locale
    });
  } catch (error) {
    // If there's an error parsing the date, return the original input
    return String(date);
  }
} 