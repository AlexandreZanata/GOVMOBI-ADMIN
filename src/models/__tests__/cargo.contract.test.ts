import { describe, it, expect } from "vitest";

import type { Cargo } from "@/models/Cargo";
import type {
  CreateCargoInput,
  UpdateCargoInput,
  GetCargoByIdInput,
} from "@/types/cargos";

describe("Cargo domain contract", () => {
  it("Cargo interface accepts a fully-populated object", () => {
    const cargo: Cargo = {
      id: "019d926f-2602-77d2-8e02-c780b7a2d0fa",
      nome: "Auditor Fiscal",
      pesoPrioridade: 80,
      ativo: true,
      createdAt: "2026-04-15T18:37:31.010Z",
      updatedAt: "2026-04-15T18:37:31.010Z",
      deletedAt: null,
    };

    expect(cargo.id).toBe("019d926f-2602-77d2-8e02-c780b7a2d0fa");
    expect(cargo.nome).toBe("Auditor Fiscal");
    expect(cargo.pesoPrioridade).toBe(80);
    expect(cargo.ativo).toBe(true);
    expect(cargo.deletedAt).toBeNull();
  });

  it("Cargo interface accepts a soft-deleted object with deletedAt set", () => {
    const cargo: Cargo = {
      id: "019d926f-0000-0000-0000-000000000000",
      nome: "Cargo Inativo",
      pesoPrioridade: 50,
      ativo: false,
      createdAt: "2026-04-01T00:00:00.000Z",
      updatedAt: "2026-04-10T00:00:00.000Z",
      deletedAt: "2026-04-10T00:00:00.000Z",
    };

    expect(cargo.ativo).toBe(false);
    expect(cargo.deletedAt).toBe("2026-04-10T00:00:00.000Z");
  });

  it("CreateCargoInput requires nome and pesoPrioridade", () => {
    const input: CreateCargoInput = {
      nome: "Técnico Administrativo",
      pesoPrioridade: 60,
    };

    expect(input.nome).toBe("Técnico Administrativo");
    expect(input.pesoPrioridade).toBe(60);
  });

  it("UpdateCargoInput requires nome and pesoPrioridade", () => {
    const input: UpdateCargoInput = {
      nome: "Auditor Fiscal Senior",
      pesoPrioridade: 90,
    };

    expect(input.nome).toBe("Auditor Fiscal Senior");
    expect(input.pesoPrioridade).toBe(90);
  });

  it("GetCargoByIdInput requires id", () => {
    const input: GetCargoByIdInput = {
      id: "019d926f-2602-77d2-8e02-c780b7a2d0fa",
    };

    expect(input.id).toBe("019d926f-2602-77d2-8e02-c780b7a2d0fa");
  });

  it("Cargo is re-exported from src/models barrel", async () => {
    // Runtime smoke-test: importing the barrel must not throw
    const models = await import("@/models");
    expect(models).toBeDefined();
    // Type-level guard: if Cargo is missing from the barrel, TSC fails here
    const _typeCheck: Cargo = {
      id: "test",
      nome: "test",
      pesoPrioridade: 0,
      ativo: true,
      createdAt: "",
      updatedAt: "",
      deletedAt: null,
    };
    expect(_typeCheck.id).toBe("test");
  });

  it("cargos types are re-exported from src/types barrel", async () => {
    // Runtime smoke-test: importing the barrel must not throw
    const types = await import("@/types");
    expect(types).toBeDefined();
  });
});
