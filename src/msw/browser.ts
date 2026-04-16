import { setupWorker } from "msw/browser";

import { auditHandlers } from "./auditHandlers";
import { authHandlers } from "./authHandlers";
import { cargosHandlers } from "./cargosHandlers";
import { departmentsHandlers } from "./departmentsHandlers";
import { lotacoesHandlers } from "./lotacoesHandlers";
import { motoristasHandlers } from "./motoristasHandlers";
import { runsHandlers } from "./runsHandlers";
import { usersHandlers } from "./usersHandlers";

import { servidoresHandlers } from "./servidoresHandlers";

/**
 * MSW browser worker — intercepts all API requests in development
 * when NEXT_PUBLIC_MOCK_MODE=true.
 */
export const worker = setupWorker(
  ...auditHandlers,
  ...authHandlers,
  ...cargosHandlers,
  ...departmentsHandlers,
  ...lotacoesHandlers,
  ...motoristasHandlers,
  ...runsHandlers,
  ...servidoresHandlers,
  ...usersHandlers
);
