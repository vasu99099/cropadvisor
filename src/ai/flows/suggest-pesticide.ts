// 'use server';
/**
 * @fileOverview Provides pesticide suggestions based on the description of a plant problem.
 *
 * - suggestPesticide - A function that suggests pesticides based on a description.
 * - SuggestPesticideInput - The input type for the suggestPesticide function.
 * - SuggestPesticideOutput - The return type for the suggestPesticide function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {getPesticideProducts, Pesticide} from '@/services/product-catalog';

const SuggestPesticideInputSchema = z.object({
  crop: z.string().describe('The crop type for which pesticide is needed.'),
  problemDescription: z.string().describe('A description of the plant problem.'),
});
export type SuggestPesticideInput = z.infer<typeof SuggestPesticideInputSchema>;

const SuggestPesticideOutputSchema = z.object({
  pesticideSuggestions: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      applicationInstructions: z.string(),
      categories: z.array(z.string()),
      crops: z.array(z.string()),
      suitabilityExplanation: z.string().describe('Explanation of why this pesticide is suitable for the described problem.')
    })
  ).describe('A list of pesticide suggestions with explanations.'),
});

export type SuggestPesticideOutput = z.infer<typeof SuggestPesticideOutputSchema>;

export async function suggestPesticide(input: SuggestPesticideInput): Promise<SuggestPesticideOutput> {
  return suggestPesticideFlow(input);
}

const suggestPesticidePrompt = ai.definePrompt({
  name: 'suggestPesticidePrompt',
  input: {schema: SuggestPesticideInputSchema},
  output: {schema: SuggestPesticideOutputSchema},
  prompt: `You are an expert agricultural advisor. A farmer is growing  {{crop}} and describes this problem: {{problemDescription}}. Recommend several appropriate pesticides from the following list, and explain why each is appropriate. 

Pesticide List:

{{#each pesticides}}
  - Name: {{this.name}}, Description: {{this.description}}, Categories: {{this.categories}}, Crops: {{this.crops}}
{{/each}}`,
});

const suggestPesticideFlow = ai.defineFlow(
  {
    name: 'suggestPesticideFlow',
    inputSchema: SuggestPesticideInputSchema,
    outputSchema: SuggestPesticideOutputSchema,
  },
  async input => {
    // Fetch pesticide products, can filter if needed.
    const pesticides = await getPesticideProducts(undefined, input.crop);

    const promptInput = {
      ...input,
      pesticides,
    };
    const {output} = await suggestPesticidePrompt(promptInput);

    //Need to attach reason of why this pesticide is suitable for the user input
    return output!;
  }
);

