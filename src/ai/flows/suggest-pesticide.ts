
'use server';
/**
 * @fileOverview Provides pesticide suggestions based on the description of a plant problem.
 *
 * - suggestPesticide - A function that suggests pesticides based on a description.
 * - SuggestPesticideInput - The input type for the suggestPesticide function.
 * - SuggestPesticideOutput - The return type for the suggestPesticide function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {getPesticideProducts, Pesticide} from '@/services/product-catalog';

const SuggestPesticideInputSchema = z.object({
  crop: z.string().describe('The crop type for which pesticide is needed.'),
  problemDescription: z.string().describe('A description of the plant problem.'),
  language: z.string().describe('The desired output language for the explanation, e.g., "en", "es", "fr", "gu".'),
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
      suitabilityExplanation: z.string().describe('Explanation of why this pesticide is suitable for the described problem. This explanation should be in the language specified in the input.')
    })
  ).describe('A list of pesticide suggestions with explanations.'),
});

export type SuggestPesticideOutput = z.infer<typeof SuggestPesticideOutputSchema>;

export async function suggestPesticide(input: SuggestPesticideInput): Promise<SuggestPesticideOutput> {
  return suggestPesticideFlow(input);
}

const suggestPesticidePrompt = ai.definePrompt({
  name: 'suggestPesticidePrompt',
  input: {schema: SuggestPesticideInputSchema.extend({ pesticides: z.custom<Pesticide[]>() })}, // Added pesticides to input for type safety in prompt
  output: {schema: SuggestPesticideOutputSchema},
  prompt: `You are an expert agricultural advisor. A farmer is growing {{crop}} and describes this problem: "{{problemDescription}}".

Please provide your response, including all explanations and recommendations, in the following language: {{{language}}}.

Recommend several appropriate pesticides from the following list. For each recommended pesticide, you MUST provide the 'suitabilityExplanation' in the language "{{{language}}}", explaining why it is appropriate for the described problem and crop. The other fields (id, name, description, applicationInstructions, categories, crops) should be taken directly from the provided pesticide list.

Pesticide List:
{{#each pesticides}}
  - ID: {{this.id}}, Name: {{this.name}}, Description: {{this.description}}, Application Instructions: {{this.applicationInstructions}}, Categories: {{#each this.categories}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}, Crops: {{#each this.crops}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
{{/each}}

Output only the JSON matching the output schema. Ensure the 'suitabilityExplanation' for each suggestion is in the language: {{{language}}}.
`,
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

    console.log('AI Flow Response:', output);
    return output!;
  }
);

