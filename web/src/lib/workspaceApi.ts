import { apiRequest } from "@/lib/apiClient";
import type { FormQuestionType } from "@/lib/formTypes";

export type PipelineStageKind = "open" | "convert" | "close" | "post_confirm";

export type PipelineStage = {
  key: string;
  label: string;
  kind: PipelineStageKind;
  sortOrder: number;
  leadStatus: string;
};

export type IndustryTemplateKey = "BANQUET" | "REAL_ESTATE" | "DOCTOR";

export type WorkspaceEnquiryQuestion = {
  id: string;
  sortOrder: number;
  type: FormQuestionType;
  title: string;
  description: string | null;
  required: boolean;
  options: string[];
  fieldKey: string | null;
};

export type WorkspaceSettings = {
  industryTemplate: IndustryTemplateKey;
  industryLabel: string;
  industryDescription: string;
  enquiryFormId: string | null;
  enquiryForm: {
    id: string;
    title: string;
    description: string | null;
    published: boolean;
    questions: WorkspaceEnquiryQuestion[];
  } | null;
  followUpStages: PipelineStage[];
  postConfirmStages: PipelineStage[];
  availableTemplates: Array<{
    key: IndustryTemplateKey;
    label: string;
    description: string;
  }>;
};

export const workspaceQueryKeys = {
  all: ["workspace"] as const,
  settings: ["workspace", "settings"] as const,
};

export async function fetchWorkspaceSettings(): Promise<WorkspaceSettings> {
  return apiRequest<WorkspaceSettings>("/workspace");
}

export async function updateWorkspaceSettings(input: {
  industryTemplate?: IndustryTemplateKey;
  enquiryFormId?: string | null;
}): Promise<WorkspaceSettings> {
  return apiRequest<WorkspaceSettings>("/workspace", {
    method: "PATCH",
    body: input,
  });
}
