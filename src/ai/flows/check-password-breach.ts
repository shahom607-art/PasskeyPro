'use server';

/**
 * @fileOverview Checks if a password has been breached using the Have I Been Pwned API.
 *
 * - checkPasswordBreach - A function that checks if a password has been breached.
 * - CheckPasswordBreachInput - The input type for the checkPasswordBreach function.
 * - CheckPasswordBreachOutput - The return type for the checkPasswordBreach function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CheckPasswordBreachInputSchema = z.object({
  password: z.string().describe('The password to check for breaches.'),
});
export type CheckPasswordBreachInput = z.infer<typeof CheckPasswordBreachInputSchema>;

const CheckPasswordBreachOutputSchema = z.object({
  isBreached: z
    .boolean()
    .describe('Whether the password has been found in any data breaches.'),
  breachDetails: z
    .string()
    .optional()
    .describe('Details about the breach, if any.'),
});
export type CheckPasswordBreachOutput = z.infer<typeof CheckPasswordBreachOutputSchema>;

export async function checkPasswordBreach(input: CheckPasswordBreachInput): Promise<CheckPasswordBreachOutput> {
  return checkPasswordBreachFlow(input);
}

const checkPasswordBreachFlow = ai.defineFlow(
  {
    name: 'checkPasswordBreachFlow',
    inputSchema: CheckPasswordBreachInputSchema,
    outputSchema: CheckPasswordBreachOutputSchema,
  },
  async input => {
    const apiKey = process.env.HAVEIBEENPWNED_API_KEY;
    if (!apiKey) {
      console.warn('HAVEIBEENPWNED_API_KEY is not set.  Breach checking will always return false.');
      return {isBreached: false};
    }
    const passwordHash = await sha1(input.password);
    const prefix = passwordHash.substring(0, 5);
    const suffix = passwordHash.substring(5);

    const url = `https://api.pwnedpasswords.com/range/${prefix}`;

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'PassKeyPro',
        },
      });

      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`);
        return {isBreached: false};
      }

      const text = await response.text();
      const matches = text.split('\r\n').map(line => line.split(':'))
      const match = matches.find(m => m[0] === suffix);

      const isBreached = !!match;

      return {isBreached};
    } catch (e: any) {
      console.error('Error checking password breach:', e);
      return {isBreached: false, breachDetails: e.message};
    }
  }
);

async function sha1(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return hashHex.toUpperCase();
}

