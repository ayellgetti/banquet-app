import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createForm,
  deleteForm,
  fetchForm,
  fetchFormResponses,
  fetchForms,
  fetchPublicForm,
  formQueryKeys,
  submitPublicForm,
  updateForm,
} from "@/lib/formsApi";
import type { FormAnswers, FormQuestion } from "@/lib/formTypes";

export function useFormsQuery() {
  return useQuery({
    queryKey: formQueryKeys.list(),
    queryFn: fetchForms,
  });
}

export function useFormQuery(id?: string) {
  return useQuery({
    queryKey: formQueryKeys.detail(id ?? ""),
    queryFn: () => fetchForm(id!),
    enabled: !!id,
  });
}

export function useFormResponsesQuery(id?: string, enabled = true) {
  return useQuery({
    queryKey: formQueryKeys.responses(id ?? ""),
    queryFn: () => fetchFormResponses(id!),
    enabled: !!id && enabled,
  });
}

export function usePublicFormQuery(slug?: string) {
  return useQuery({
    queryKey: formQueryKeys.public(slug ?? ""),
    queryFn: () => fetchPublicForm(slug!),
    enabled: !!slug,
  });
}

export function useCreateFormMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input?: { title?: string }) => createForm(input ?? {}),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: formQueryKeys.list() });
    },
  });
}

export function useUpdateFormMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      title?: string;
      description?: string | null;
      published?: boolean;
      questions?: FormQuestion[];
    }) => updateForm(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: formQueryKeys.list() });
    },
  });
}

export function useDeleteFormMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteForm,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: formQueryKeys.all });
    },
  });
}

export function useSubmitPublicFormMutation(slug: string) {
  return useMutation({
    mutationFn: (answers: FormAnswers) => submitPublicForm(slug, answers),
  });
}
