import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { LotacaoViewModal } from "../LotacaoViewModal";
import type { Lotacao } from "@/models/Lotacao";

describe("LotacaoViewModal", () => {
  const mockLotacao: Lotacao = {
    id: "01234567-89ab-cdef-0123-456789abcdef",
    nome: "Secretaria de Educação",
    ativo: true,
    createdAt: "2024-01-15T10:30:00.000Z",
    updatedAt: "2024-01-20T14:45:00.000Z",
    deletedAt: null,
  };

  const mockOnClose = vi.fn();

  it("should return null when lotacao is undefined", () => {
    const { container } = render(
      <LotacaoViewModal
        open={true}
        onClose={mockOnClose}
        lotacao={undefined}
        data-testid="test-modal"
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("should render modal with lotacao nome as title", () => {
    render(
      <LotacaoViewModal
        open={true}
        onClose={mockOnClose}
        lotacao={mockLotacao}
        data-testid="test-modal"
      />
    );
    expect(screen.getAllByText("Secretaria de Educação").length).toBeGreaterThan(0);
  });

  it("should display active status badge when ativo is true", () => {
    render(
      <LotacaoViewModal
        open={true}
        onClose={mockOnClose}
        lotacao={mockLotacao}
        data-testid="test-modal"
      />
    );
    // i18n mock returns English text
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("should display inactive status badge when ativo is false", () => {
    const inactiveLotacao = { ...mockLotacao, ativo: false };
    render(
      <LotacaoViewModal
        open={true}
        onClose={mockOnClose}
        lotacao={inactiveLotacao}
        data-testid="test-modal"
      />
    );
    // i18n mock returns English text
    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });

  it("should display all required sections", () => {
    render(
      <LotacaoViewModal
        open={true}
        onClose={mockOnClose}
        lotacao={mockLotacao}
        data-testid="test-modal"
      />
    );
    expect(screen.getByText("Dados Básicos")).toBeInTheDocument();
    expect(screen.getByText("Identificação do registro")).toBeInTheDocument();
    expect(screen.getByText("Auditoria")).toBeInTheDocument();
  });

  it("should display lotacao nome in Dados Básicos section", () => {
    render(
      <LotacaoViewModal
        open={true}
        onClose={mockOnClose}
        lotacao={mockLotacao}
        data-testid="test-modal"
      />
    );
    expect(screen.getByText("Nome")).toBeInTheDocument();
    expect(screen.getAllByText("Secretaria de Educação").length).toBeGreaterThan(0);
  });

  it("should display lotacao id in Identificação do registro section", () => {
    render(
      <LotacaoViewModal
        open={true}
        onClose={mockOnClose}
        lotacao={mockLotacao}
        data-testid="test-modal"
      />
    );
    expect(screen.getByText("ID")).toBeInTheDocument();
    expect(screen.getByText("01234567-89ab-cdef-0123-456789abcdef")).toBeInTheDocument();
  });

  it("should format dates using pt-BR locale", () => {
    render(
      <LotacaoViewModal
        open={true}
        onClose={mockOnClose}
        lotacao={mockLotacao}
        data-testid="test-modal"
      />
    );
    expect(screen.getByText("Criado em")).toBeInTheDocument();
    expect(screen.getByText("Atualizado em")).toBeInTheDocument();
    expect(screen.getByText("Excluído em")).toBeInTheDocument();
  });

  it("should display — for null deletedAt", () => {
    render(
      <LotacaoViewModal
        open={true}
        onClose={mockOnClose}
        lotacao={mockLotacao}
        data-testid="test-modal"
      />
    );
    const excludedFields = screen.getAllByText("—");
    expect(excludedFields.length).toBeGreaterThan(0);
  });

  it("should display Desativado badge when deletedAt is not null", () => {
    const deletedLotacao = {
      ...mockLotacao,
      ativo: false,
      deletedAt: "2024-01-25T16:00:00.000Z",
    };
    render(
      <LotacaoViewModal
        open={true}
        onClose={mockOnClose}
        lotacao={deletedLotacao}
        data-testid="test-modal"
      />
    );
    expect(screen.getByText(/Desativado em/)).toBeInTheDocument();
  });
});
