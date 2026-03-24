/**
 * A lightweight profanity filter utility.
 */

// A mock list of common profanity words. In a real application, 
// this would be a much larger list or managed via a dedicated API.
const FORBIDDEN_WORDS = [
  "badword", "dumb", "stupid", "idiot", "damn", "heck", "crap", "shit", "fuck", "bitch", 'asshole', 'bastard'
];

/**
 * Checks if the given text contains any forbidden words.
 * Returns true if profanity is found.
 */
export function containsProfanity(text: string): boolean {
  if (!text) return false;
  
  const lowerText = text.toLowerCase();
  
  // Create a regex to match exact words (word boundaries)
  // This prevents partially matching words (e.g. "scrapes" containing "crap")
  for (const word of FORBIDDEN_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(lowerText)) {
      return true;
    }
  }
  
  return false;
}
