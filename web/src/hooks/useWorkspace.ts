import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchWorkspaceSettings,
  updateWorkspaceSettings,
  workspaceQueryKeys,
  type IndustryTemplateKey,
} from "@/lib/workspaceApi";
import { banquetQueryKeys } from "@/lib/banquetApi";

export function useWorkspaceQuery() {
  return useQuery({
    queryKey: workspaceQueryKeys.settings,
    queryFn: fetchWorkspaceSettings,
    staleTime: 60_000,
  });
}

export function useUpdateWorkspaceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      industryTemplate?: IndustryTemplateKey;
      enquiryFormId?: string | null;
    }) => updateWorkspaceSettings(input),
    onSuccess: (data) => {
      queryClient.setQueryData(workspaceQueryKeys.settings, data);
      void queryClient.invalidateQueries({ queryKey: banquetQueryKeys.all });
    },
  });
}
