
export interface I18nConfig {
  defaultLocale: Locale;
  locales: readonly Locale[];
}

export type Locale = 'en' | 'gu' | 'es' | 'fr';


// It's better to define a more specific type for your translations
// to get better autocompletion and type checking.
export interface Translations {
  appName: string;
  header: {
    navCropSuggestions: string;
    navProductCatalog: string;
    navDiseaseStats: string;
    navPlantIdentifier: string; // New navigation item
  };
  hero: {
    titleLine1: string;
    titleHighlight: string;
    titleLine2: string;
    subtitle: string;
    ctaGetSuggestions: string;
    ctaViewCatalog: string;
    imageAlt: string;
    imageCaption: string;
  };
  cropSuggester: {
    title: string;
    description: string;
    cropLabel: string;
    cropPlaceholder: string;
    problemDescriptionLabel: string;
    problemDescriptionPlaceholder: string;
    problemDescriptionHint: string;
    submitButton: string;
    suggestionsTitle: string;
    suitability: string;
    applicationInstructions: string;
    categories: string;
    crops: string;
    noSuggestions: string;
    noSuggestionsDescription: string;
    errorFetching: string;
  };
  productCatalog: {
    title: string;
    description: string;
    searchLabel: string;
    searchPlaceholder: string;
    categoryFilterLabel: string;
    categoryFilterPlaceholder: string;
    cropFilterLabel: string;
    cropFilterPlaceholder: string;
    allCategories: string;
    allCrops: string;
    applicationInstructions: string;
    categories: string;
    crops: string;
    noProductsFound: string;
    noProductsFoundDescription: string;
  };
  diseaseStats: {
    title: string;
    description: string;
    chartTitle: string;
    chartDescription: string;
    diseaseName: string;
    prevalence: string;
    noDataTitle: string;
    noDataDescription: string;
  };
  plantDiseaseIdentifier: { // New section for Plant Disease Identifier
    title: string;
    description: string;
    uploadCardTitle: string;
    uploadLabel: string;
    uploadHint: string;
    orDragAndDrop: string;
    useWebcamButton: string;
    captureFromWebcamButton: string;
    closeWebcamButton: string;
    clearImageButton: string;
    descriptionLabel: string;
    descriptionPlaceholder: string;
    submitButton: string;
    submittingButton: string;
    resultsTitle: string;
    isPlantLabel: string;
    plantNameLabel: string;
    diseaseIdentifiedLabel: string;
    diseaseNameLabel: string;
    diseaseDescriptionLabel: string;
    confidenceScoreLabel: string;
    treatmentRecommendationsLabel: string;
    noPlantDetected: string;
    noDiseaseDetected: string;
    errorFetching: string;
    errorNoImage: string;
    webcamError: string;
    webcamNotSupported: string;
    cameraAccessRequiredTitle: string;
    cameraAccessRequiredDescription: string;
    imagePreviewAlt: string;
    booleanYes: string;
    booleanNo: string;
  };
  footer: {
    copyrightText: string;
  };
  validation: {
    cropRequired: string;
    problemDescriptionRequired: string;
    problemDescriptionMinLength: string;
  };
  commonCrops: string[];
}
