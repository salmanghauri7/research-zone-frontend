export type RadarAlertType = "contradiction" | "relevance";

export interface RadarPaper {
  authors: string[];
  title: string;
  link: string;
}

export interface RadarFinding {
  _id: string;
  workspaceId: string;
  category: string;
  alertType: RadarAlertType[] | RadarAlertType;
  papersScanned: number;
  newPapers: RadarPaper[];
  createdAt?: string;
  updatedAt?: string;
}

export interface RadarCategoryDonePayload {
  category: string;
  found: number;
}

export interface RadarErrorPayload {
  workspaceId: string;
  category?: string;
  queue?: string;
  message: string;
}
