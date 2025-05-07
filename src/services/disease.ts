/**
 * Represents information about a specific plant disease.
 */
export interface Disease {
  /**
   * The unique identifier for the disease.
   */
  id: string;
  /**
   * The name of the disease.
   */
  name: string;
  /**
   * A description of the disease, including symptoms and causes.
   */
  description: string;
  /**
   * The number of people that currently have the disease.
   */
  prevalence: number;
}

/**
 * Asynchronously retrieves a list of prevalent diseases.
 * @returns A promise that resolves to an array of Disease objects.
 */
export async function getMostPrevalentDiseases(): Promise<Disease[]> {
  // TODO: Implement this by calling an API.

  return [
    {
      id: '1',
      name: 'Wheat Rust',
      description: 'A fungal disease affecting wheat crops.',
      prevalence: 1000,
    },
    {
      id: '2',
      name: 'Corn Blight',
      description: 'A bacterial disease that can decimate corn yields.',
      prevalence: 500,
    },
  ];
}
