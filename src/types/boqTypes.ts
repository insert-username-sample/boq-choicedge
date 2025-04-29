export interface BOQItem {
  id: number;
  description: string;
  specifications: string;
  materials: string;
  unit: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface ProjectDetails {
  clientName: string;
  projectName: string;
  location: string;
  projectType: string;
  carpetArea: string;
  numberOfRooms?: string;
}

export interface Category {
  id: string;
  type: string;
  description: string;
  image?: string;
}

export interface BOQData {
  projectDetails: ProjectDetails;
  selectedCategory: Category;
  items: BOQItem[];
  generatedDate: string;
}