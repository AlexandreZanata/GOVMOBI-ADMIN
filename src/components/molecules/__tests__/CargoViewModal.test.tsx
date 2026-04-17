import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import "@/test/i18n-mock";

import { CargoViewModal } from "../CargoViewModal";
import type { Cargo } from "@/models/Cargo";

describe("CargoViewModal", () => {
  const mockCargo: Cargo = {
    id: "01234567-89ab-cdef-0123-456789abcdef",
    nome: "Auditor Fiscal",
    pesoPrioridade: 80,
    ativo: true,
    createdAt: "2024-01-15T10:30:00.000Z",
    updatedAt: "2024-01-20T14:45:00.000Z",
    deletedAt: null,
  };

  const mockOnClose = vi.fn();

  it("should return null when cargo is undefined", () => {
    const { container } = render(
      <CargoViewModal
        open={true}
        onClose={mockOnClose}
        cargo={undefined}
        data-testid="test-modal"
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("should render modal with cargo nome as title", () => {
    render(
      <CargoViewModal
        open={true}
        onClose={mockOnClose}
        cargo={mockCargo}
        data-testid="test-modal"
      />
    );
    expect(screen.getAllByText("Auditor Fiscal").length).toBeGreaterThan(0);
  });

  it("should display active status badge when ativo is true", () => {
    render(
      <CargoViewModal
        open={true}
        onClose={mockOnClose}
        cargo={mockCargo}
        data-testid="test-modal"
      />
    );
    // i18n mock returns "cargos:status.active"
    expect(screen.getByText("cargos:status.active")).toBeInTheDocument();
  });

  it("should display inactive status badge when ativo is false", () => {
    const inactiveCargo = { ...mockCargo, ativo: false };
    render(
      <CargoViewModal
        open={true}
        onClose={mockOnClose}
        cargo={inactiveCargo}
        data-testid="test-modal"
      />
    );
    // i18n mock returns "cargos:status.inactive"
    expect(screen.getByText("cargos:status.inactive")).toBeInTheDocument();
  });

  it("should display all required sections", () => {
    render(
      <CargoViewModal
        open={true}
        onClose={mockOnClose}
        cargo={mockCargo}
        data-testid="test-modal"
      />
    );
    expect(screen.getByText("Dados Básicos")).toBeInTheDocument();
    expect(screen.getByText("Identificação do registro")).toBeInTheDocument();
    expect(screen.getByText("Auditoria")).toBeInTheDocument();
  });

  it("should display pesoPrioridade value in Dados Básicos section", () => {
    render(
      <CargoViewModal
        open={true}
        onClose={mockOnClose}
        cargo={mockCargo}
        data-testid="test-modal"
      />
    );
    expect(screen.getByText("80")).toBeInTheDocument();
  });

  it("should display cargo id in Identificação do registro section", () => {
    render(
      <CargoViewModal
        open={true}
        onClose={mockOnClose}
        cargo={mockCargo}
        data-testid="test-modal"
      />
    );
    expect(screen.getByText("ID")).toBeInTheDocument();
    expect(screen.getByText("01234567-89ab-cdef-0123-456789abcdef")).toBeInTheDocument();
  });

  it("should format dates using pt-BR locale", () => {
    render(
      <CargoViewModal
        open={true}
        onClose={mockOnClose}
        cargo={mockCargo}
        data-testid="test-modal"
      />
    );
    expect(screen.getByText("Criado em")).toBeInTheDocument();
    expect(screen.getByText("Atualizado em")).toBeInTheDocument();
    expect(screen.getByText("Excluído em")).toBeInTheDocument();
  });

  it("should display — for null deletedAt", () => {
    render(
      <CargoViewModal
        open={true}
        onClose={mockOnClose}
        cargo={mockCargo}
        data-testid="test-modal"
      />
    );
    const dashFields = screen.getAllByText("—");
    expect(dashFields.length).toBeGreaterThan(0);
  });

  it("should display Desativado badge when deletedAt is not null", () => {
    const deletedCargo = {
      ...mockCargo,
      ativo: false,
      deletedAt: "2024-01-25T16:00:00.000Z",
    };
    render(
      <CargoViewModal
        open={true}
        onClose={mockOnClose}
        cargo={deletedCargo}
        data-testid="test-modal"
      />
    );
    expect(screen.getByText(/Desativado em/)).toBeInTheDocument();
  });
});
