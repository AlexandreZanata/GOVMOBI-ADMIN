"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import "@/i18n/config";

import { departmentsFacade } from "@/facades/departmentsFacade";
import { departmentsKeys } from "@/lib/queryKeys/departmentsKeys";
import type { Department } from "@/models/Department";
import type { CreateDepartmentInput } from "@/types/departments";
import { ApiError } from "@/types";

/**
 * Mutation hook for creating a new department.
 * On success, invalidates the department list cache and shows a success toast.
 * On 409, shows a duplicate-name error toast.
 * On all other errors, shows a generic server error toast.
 *
 * @returns TanStack Query mutation object
 */
export function useCreateDepartment() {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["departments", "common"]);

  return useMutation<Department, ApiError, CreateDepartmentInput>({
    mutationFn: (input) => departmentsFacade.createDepartment(input),

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: departmentsKeys.list() });
      toast.success(t("toast.created"));
    },

    onError: (error) => {
      if (error.status === 409) {
        toast.error(t("toast.duplicateName"));
      } else {
        toast.error(t("common:toast.serverError"));
      }
    },
  });
}
