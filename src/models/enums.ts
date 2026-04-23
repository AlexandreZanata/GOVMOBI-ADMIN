/**
 * Centralized enum definitions synchronized with backend API.
 * Source: GET /meta/enumerados
 * 
 * This file provides TypeScript enums and type-safe constants for all
 * system enumerations returned by the backend metadata endpoint.
 */

// ─── Frota (Fleet) ────────────────────────────────────────────────────────────

/**
 * Operational status of a motorista (driver).
 * Context: Motorista
 * 
 * - DISPONIVEL: Motorista online e pronto para receber chamadas de despacho.
 * - EM_CORRIDA: Motorista em serviço (ocupado), não disponível para novas chamadas automáticas.
 * - OFFLINE: Motorista fora de serviço ou desconectado.
 */
export enum StatusOperacional {
  DISPONIVEL = "DISPONIVEL",
  EM_CORRIDA = "EM_CORRIDA",
  OFFLINE = "OFFLINE",
}

/**
 * Status of a vehicle in the fleet.
 * Context: Veículo
 * 
 * - disponivel: Veículo em pátio, pronto para uso.
 * - em_uso: Veículo atualmente em operação por um motorista.
 * - manutencao: Veículo em oficina ou manutenção preventiva.
 * - inativo: Veículo baixado ou fora da frota operacional.
 */
export enum StatusVeiculo {
  DISPONIVEL = "disponivel",
  EM_USO = "em_uso",
  MANUTENCAO = "manutencao",
  INATIVO = "inativo",
}

// ─── Despacho (Dispatch) ──────────────────────────────────────────────────────

/**
 * Corrida (ride) lifecycle status values.
 * Context: Fluxo de Corrida
 * 
 * - solicitada: Corrida criada pelo sistema, aguardando processamento.
 * - aguardando_aceite: Sistema encontrou candidatos e está aguardando aceite de um motorista.
 * - aceita: Motorista aceitou a corrida e está se deslocando para o ponto de origem.
 * - em_rota: Motorista a caminho do local de embarque.
 * - passageiro_a_bordo: Passageiro embarcado, corrida em curso para o destino.
 * - concluida: Corrida finalizada com sucesso.
 * - avaliada: Corrida finalizada e avaliada pelo passageiro.
 * - cancelada: Corrida cancelada por um dos participantes ou pelo sistema.
 * - expirada: Nenhum motorista aceitou a corrida no tempo limite.
 */
export enum CorridaStatus {
  SOLICITADA = "solicitada",
  AGUARDANDO_ACEITE = "aguardando_aceite",
  ACEITA = "aceita",
  EM_ROTA = "em_rota",
  PASSAGEIRO_A_BORDO = "passageiro_a_bordo",
  CONCLUIDA = "concluida",
  AVALIADA = "avaliada",
  CANCELADA = "cancelada",
  EXPIRADA = "expirada",
}

// ─── Identidade (Identity) ────────────────────────────────────────────────────

/**
 * User roles and permissions.
 * Context: Permissões de Usuário
 * 
 * - USUARIO: Usuário padrão (Passageiro).
 * - ADMIN: Administrador com acesso total ao sistema de gestão.
 * - MOTORISTA: Motorista (driver role).
 */
export enum Papel {
  USUARIO = "USUARIO",
  ADMIN = "ADMIN",
  MOTORISTA = "MOTORISTA",
}
