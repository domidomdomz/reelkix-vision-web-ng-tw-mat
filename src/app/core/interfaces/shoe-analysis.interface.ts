export interface ShoeAnalysis {
    brand: string;
    model: string;
    colorway: string;
    sku: string;
    text: string;
    confidence: number;
  }
  
  export interface ImageAnalysisResponse {
    message: string;
    imageUrl: string;
    analysis: ShoeAnalysis;
  }