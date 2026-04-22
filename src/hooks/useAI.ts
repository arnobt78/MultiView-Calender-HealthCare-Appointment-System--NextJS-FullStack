import { useMutation } from "@tanstack/react-query";
import { apiClient, handleApiError } from "@/lib/api-client";

interface ParsedAppointment {
  title: string;
  start: string;
  end: string;
  location?: string;
  notes?: string;
  suggestedCategory?: string;
  suggestedPatient?: string;
}

interface TimeSuggestion {
  start: string;
  end: string;
}

export function useAI() {
  const parseAppointmentMutation = useMutation({
    mutationFn: async (text: string) => {
      const data = await apiClient<{ appointment: ParsedAppointment }>(
        "/api/ai/parse-appointment",
        {
          method: "POST",
          body: JSON.stringify({ text }),
        }
      );
      return data.appointment;
    },
    onError: (error) => handleApiError(error, "AI parsing failed"),
  });

  const summarizeMutation = useMutation({
    mutationFn: async ({ notes, activities }: { notes: string; activities?: string[] }) => {
      const data = await apiClient<{ summary: string }>("/api/ai/summarize", {
        method: "POST",
        body: JSON.stringify({ notes, activities }),
      });
      return data.summary;
    },
    onError: (error) => handleApiError(error, "AI summarization failed"),
  });

  const categorizeMutation = useMutation({
    mutationFn: async ({ title, notes }: { title: string; notes?: string }) => {
      const data = await apiClient<{ category: string }>("/api/ai/categorize", {
        method: "POST",
        body: JSON.stringify({ title, notes }),
      });
      return data.category;
    },
    onError: (error) => handleApiError(error, "AI categorization failed"),
  });

  const suggestTimesMutation = useMutation({
    mutationFn: async ({
      preferredDate,
      duration,
    }: {
      preferredDate?: string;
      duration?: number;
    }) => {
      const data = await apiClient<{ suggestions: TimeSuggestion[] }>(
        "/api/ai/suggest-times",
        {
          method: "POST",
          body: JSON.stringify({ preferredDate, duration }),
        }
      );
      return data.suggestions;
    },
    onError: (error) => handleApiError(error, "AI time suggestion failed"),
  });

  return {
    parseAppointment: parseAppointmentMutation.mutateAsync,
    isParsing: parseAppointmentMutation.isPending,
    parsedResult: parseAppointmentMutation.data,

    summarize: summarizeMutation.mutateAsync,
    isSummarizing: summarizeMutation.isPending,
    summary: summarizeMutation.data,

    categorize: categorizeMutation.mutateAsync,
    isCategorizing: categorizeMutation.isPending,

    suggestTimes: suggestTimesMutation.mutateAsync,
    isSuggestingTimes: suggestTimesMutation.isPending,
    suggestedTimes: suggestTimesMutation.data,
  };
}
