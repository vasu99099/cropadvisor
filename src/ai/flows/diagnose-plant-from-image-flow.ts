
'use server';
/**
 * @fileOverview A plant disease diagnosis AI agent using image analysis.
 *
 * - diagnosePlantFromImage - A function that handles the plant disease diagnosis process from an image.
 * - DiagnosePlantFromImageInput - The input type for the diagnosePlantFromImage function.
 * - DiagnosePlantFromImageOutput - The return type for the diagnosePlantFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DiagnosePlantFromImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  description: z.string().optional().describe("Optional user description of symptoms or observations."),
  language: z.string().describe('The desired output language for the diagnosis, e.g., "en", "es", "fr", "gu".'),
});
export type DiagnosePlantFromImageInput = z.infer<typeof DiagnosePlantFromImageInputSchema>;

const DiagnosePlantFromImageOutputSchema = z.object({
  isPlant: z.boolean().describe("Whether the image appears to contain a plant or part of a plant."),
  plantName: z.string().optional().describe("Identified common name of the plant, if recognizable and relevant. This should be in the specified language."),
  diseaseIdentified: z.boolean().describe("Whether a specific disease was identified in the plant shown in the image."),
  diseaseName: z.string().optional().describe("Name of the identified disease, if any. If no disease, state 'Healthy' or 'No disease detected'. This should be in the specified language."),
  diseaseDescription: z.string().optional().describe("A brief description of the identified disease, its symptoms, or reasons for no disease detection. This should be in the specified language."),
  confidenceScore: z.number().min(0).max(1).optional().describe("Confidence score (0.0 to 1.0) for the disease diagnosis. Provide this only if a disease is identified."),
  treatmentRecommendations: z.array(z.string()).optional().describe("A list of actionable treatment recommendations or care advice if a disease is identified or if general care tips are applicable. These should be in the specified language."),
});
export type DiagnosePlantFromImageOutput = z.infer<typeof DiagnosePlantFromImageOutputSchema>;

export async function diagnosePlantFromImage(input: DiagnosePlantFromImageInput): Promise<DiagnosePlantFromImageOutput> {
  return diagnosePlantFromImageFlow(input);
}

const diagnosePlantPrompt = ai.definePrompt({
  name: 'diagnosePlantFromImagePrompt',
  input: {schema: DiagnosePlantFromImageInputSchema},
  output: {schema: DiagnosePlantFromImageOutputSchema},
  prompt: `You are an expert plant pathologist and botanist. Your task is to analyze the provided image of a plant and an optional user description to identify potential diseases.

IMPORTANT: Generate all textual output (plantName, diseaseName, diseaseDescription, treatmentRecommendations) in the following language: {{{language}}}.

Image: {{media url=imageDataUri}}
{{#if description}}
User Description: {{{description}}}
{{/if}}

Please perform the following analysis and structure your output according to the defined schema:
1.  **Is Plant**: Determine if the image clearly shows a plant or part of a plant. Set 'isPlant' to true or false.
2.  **Plant Name**: If 'isPlant' is true and you can reasonably identify the plant, provide its common name in the language '{{{language}}}'. Otherwise, omit this field or state "Unknown" (translated to '{{{language}}}' if appropriate).
3.  **Disease Identification**:
    *   If 'isPlant' is true, examine the plant for any signs of disease.
    *   Set 'diseaseIdentified' to true if a disease is detected, otherwise false.
    *   If a disease is identified, provide the 'diseaseName' (in '{{{language}}}') and a 'diseaseDescription' (in '{{{language}}}') (e.g., symptoms, potential causes).
    *   If no disease is detected, 'diseaseName' could be "Healthy" or "No disease detected" (translated to '{{{language}}}'), and 'diseaseDescription' should explain why (in '{{{language}}}') (e.g., "No visible signs of common diseases." or "Symptoms unclear for specific diagnosis.").
4.  **Confidence Score**: If a disease is identified ('diseaseIdentified' is true), provide a 'confidenceScore' between 0.0 (low confidence) and 1.0 (high confidence) for your diagnosis. Omit if no disease is identified.
5.  **Treatment Recommendations**: If a disease is identified, suggest 2-3 actionable 'treatmentRecommendations' in '{{{language}}}'. If the plant appears healthy but general care tips are relevant (e.g. for the identified plant type), you can provide those in '{{{language}}}'. Omit if not applicable or if 'isPlant' is false.

If the image quality is too poor for analysis, or if it's not a plant, reflect this in your output (e.g., by setting 'isPlant' to false and providing a suitable 'diseaseDescription' like "Image unclear or not a plant." in '{{{language}}}').
Prioritize accuracy. If unsure, state it (in '{{{language}}}').
Output only the JSON matching the output schema.
`,
});

const diagnosePlantFromImageFlow = ai.defineFlow(
  {
    name: 'diagnosePlantFromImageFlow',
    inputSchema: DiagnosePlantFromImageInputSchema,
    outputSchema: DiagnosePlantFromImageOutputSchema,
  },
  async (input: DiagnosePlantFromImageInput) => {
    console.log("Diagnose Plant From Image Flow - Input:", { hasImage: !!input.imageDataUri, description: input.description, language: input.language });
    const {output} = await diagnosePlantPrompt(input);
    console.log("Diagnose Plant From Image Flow - Output:", output);
    return output!;
  }
);

