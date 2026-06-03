export interface PetEmergencyAnalysis {
  id: number;
  petType: string;
  emergency: string;
  language: string;
  analysisResult: string;
  createdAt: string;
  deleted: boolean;
}

export interface PetEmergencyRequest {
  petType: string;
  emergency: string;
  language: string;
}
