import { apiRequest } from "@/lib/apiClient";
import type { Paginated } from "@/lib/apiTypes";
import type {
  FormAnswers,
  FormDetail,
  FormListItem,
  FormPublic,
  FormQuestion,
  FormResponseItem,
} from "@/lib/formTypes";

export const formQueryKeys = {
  all: ["forms"] as const,
  list: () => [...formQueryKeys.all, "list"] as const,
  detail: (id: string) => [...formQueryKeys.all, "detail", id] as const,
  responses: (id: string) => [...formQueryKeys.all, "responses", id] as const,
  public: (slug: string) => [...formQueryKeys.all, "public", slug] as const,
};

function toQuestionPayload(question: FormQuestion) {
  return {
    ...( /^\d+$/.test(question.id) ? { id: question.id } : {}),
    type: question.type,
    title: question.title.trim() || "Untitled question",
    description: question.description,
    required: question.required,
    options: question.options,
  };
}

export async function fetchForms(): Promise<FormListItem[]> {
  const page = await apiRequest<Paginated<FormListItem>>("/forms?limit=100&sortBy=updatedAt&order=desc");
  return page.items;
}

export async function fetchForm(id: string): Promise<FormDetail> {
  return apiRequest<FormDetail>(`/forms/${id}`);
}

export async function createForm(input: { title?: string; description?: string | null } = {}): Promise<FormDetail> {
  return apiRequest<FormDetail>("/forms", { method: "POST", body: input });
}

export async function updateForm(
  id: string,
  input: {
    title?: string;
    description?: string | null;
    published?: boolean;
    questions?: FormQuestion[];
  },
): Promise<FormDetail> {
  return apiRequest<FormDetail>(`/forms/${id}`, {
    method: "PATCH",
    body: {
      ...input,
      questions: input.questions?.map(toQuestionPayload),
    },
  });
}

export async function deleteForm(id: string): Promise<void> {
  await apiRequest(`/forms/${id}`, { method: "DELETE" });
}

export async function fetchFormResponses(id: string): Promise<FormResponseItem[]> {
  const page = await apiRequest<Paginated<FormResponseItem>>(`/forms/${id}/responses?limit=100&order=desc`);
  return page.items;
}

export async function fetchPublicForm(slug: string): Promise<FormPublic> {
  return apiRequest<FormPublic>(`/forms/public/${slug}`, { auth: false });
}

export async function submitPublicForm(slug: string, answers: FormAnswers): Promise<{ id: string; submittedAt: string }> {
  return apiRequest(`/forms/public/${slug}/responses`, {
    method: "POST",
    body: { answers },
    auth: false,
  });
}
