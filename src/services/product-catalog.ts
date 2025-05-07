/**
 * Represents a pesticide product.
 */
export interface Pesticide {
  /**
   * The unique identifier for the pesticide.
   */
  id: string;
  /**
   * The name of the pesticide.
   */
  name: string;
  /**
   * A description of the pesticide.
   */
  description: string;
  /**
   * Instructions on how to apply the pesticide.
   */
  applicationInstructions: string;
  /**
   * Categories to which the product belongs
   */
  categories: string[];
  /**
   * Crops that the pesticide can be used for
   */
  crops: string[];
}

/**
 * Asynchronously retrieves a list of pesticide products.
 * @param category An optional category to filter the products by.
 * @param crop An optional crop to filter the products by.
 *
 * @returns A promise that resolves to an array of Pesticide objects.
 */
export async function getPesticideProducts(category?: string, crop?: string): Promise<Pesticide[]> {
  // TODO: Implement this by calling an API.

  return [
    {
      id: '1',
      name: 'Pesticide A',
      description: 'A broad-spectrum pesticide.',
      applicationInstructions: 'Apply to affected areas twice a week.',
      categories: ['Insecticide'],
      crops: ['Wheat', 'Corn'],
    },
    {
      id: '2',
      name: 'Pesticide B',
      description: 'A fungicide for fruit trees.',
      applicationInstructions: 'Spray on leaves every 10 days.',
      categories: ['Fungicide'],
      crops: ['Apple', 'Orange'],
    },
  ];
}
