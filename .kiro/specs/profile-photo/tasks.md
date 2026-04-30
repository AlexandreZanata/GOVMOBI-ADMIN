# Implementation Plan: profile-photo

## Overview

Implementação incremental da feature de foto de perfil de servidor. O plano segue a arquitetura definida no design: extensão dos modelos e facade existentes, criação dos hooks de mutation, criação do componente `ProfilePhotoUploader`, integração nos pontos de UI (ProfilePageClient, AdminShell/SidebarNav, ServidoresPageClient) e adição dos handlers MSW.

## Tasks

- [x] 1. Estender modelos de dados e AuthStore
  - Adicionar campo `fotoPerfilUrl?: string | null` à interface `Servidor` em `src/models/Servidor.ts`
  - Adicionar campo `fotoPerfilUrl?: string | null` à interface `AuthUser` em `src/models/Auth.ts`
  - Adicionar ação `updateFotoPerfilUrl(url: string): void` à interface `AuthActions` e implementação no store em `src/stores/authStore.ts`
  - _Requirements: 4.1, 4.2_

- [x] 2. Adicionar chaves i18n para a feature
  - [x] 2.1 Adicionar chave `profilePhoto` ao namespace `servidores` nos arquivos `src/i18n/locales/pt-BR/servidores.json` e `src/i18n/locales/en/servidores.json`
    - Incluir todas as chaves definidas no design: `label`, `buttonSelect`, `buttonSend`, `buttonChange`, `preview`, `uploading`, `errors.*`, `success`
    - _Requirements: 5.4_

- [x] 3. Estender o `servidoresFacade` com métodos de upload
  - [x] 3.1 Implementar `uploadFotoPerfilMe(file: File): Promise<{ fotoPerfilUrl: string }>` em `src/facades/servidoresFacade.ts`
    - Montar `FormData` com campo `foto`
    - Enviar `PATCH /servidores/me/foto-perfil` via `fetchWithAuth` sem definir `Content-Type` manualmente
    - Usar `handleEnvelopedResponse` para desempacotar a resposta
    - _Requirements: 1.5, 4.3_

  - [x] 3.2 Implementar `uploadFotoPerfilAdmin(id: string, file: File): Promise<{ fotoPerfilUrl: string }>` em `src/facades/servidoresFacade.ts`
    - Montar `FormData` com campo `foto`
    - Enviar `PATCH /servidores/{id}/foto-perfil` via `fetchWithAuth`
    - _Requirements: 2.2, 4.4_

  - [ ]* 3.3 Escrever property test para o facade — Property 5
    - **Property 5: Facade retorna a URL exatamente como recebida da API**
    - **Validates: Requirements 4.3, 4.4**
    - Arquivo: `src/facades/__tests__/servidoresFacade.test.ts`
    - Gerador: `fc.webUrl()` para URLs arbitrárias

- [x] 4. Adicionar handlers MSW para os endpoints de foto de perfil
  - [x] 4.1 Adicionar handler `PATCH /servidores/me/foto-perfil` em `src/msw/servidoresHandlers.ts`
    - Cenários: 200 com `{ fotoPerfilUrl }`, 400 (arquivo inválido), 413 (arquivo muito grande)
    - _Requirements: 4.5_

  - [x] 4.2 Adicionar handler `PATCH /servidores/:id/foto-perfil` em `src/msw/servidoresHandlers.ts`
    - Cenários: 200 com `{ fotoPerfilUrl }`, 400, 404 (servidor não encontrado)
    - _Requirements: 4.5_

- [x] 5. Criar hook `useUploadFotoPerfilMe`
  - [x] 5.1 Criar `src/hooks/servidores/useUploadFotoPerfilMe.ts`
    - `mutationFn`: chama `servidoresFacade.uploadFotoPerfilMe(file)`
    - `onSuccess`: chama `authStore.updateFotoPerfilUrl(fotoPerfilUrl)`
    - `onError`: expõe `ApiError` para o componente tratar
    - _Requirements: 1.5, 1.6_

  - [ ]* 5.2 Escrever property test para `useUploadFotoPerfilMe` — Property 3
    - **Property 3: Upload próprio atualiza o AuthStore com a URL retornada**
    - **Validates: Requirements 1.6**
    - Arquivo: `src/hooks/servidores/__tests__/useUploadFotoPerfilMe.test.ts`
    - Gerador: `fc.webUrl()` para URLs arbitrárias

- [x] 6. Criar hook `useUploadFotoPerfilAdmin`
  - [x] 6.1 Criar `src/hooks/servidores/useUploadFotoPerfilAdmin.ts`
    - `mutationFn`: chama `servidoresFacade.uploadFotoPerfilAdmin(id, file)`
    - `onSuccess`: invalida `servidoresKeys.detail(id)` e `servidoresKeys.list()`
    - `onError`: expõe `ApiError` para o componente tratar
    - _Requirements: 2.2, 2.3_

  - [ ]* 6.2 Escrever property test para `useUploadFotoPerfilAdmin` — Property 4
    - **Property 4: Upload admin invalida o cache do servidor correto**
    - **Validates: Requirements 2.3**
    - Arquivo: `src/hooks/servidores/__tests__/useUploadFotoPerfilAdmin.test.ts`
    - Gerador: `fc.uuid()` para IDs arbitrários

- [x] 7. Checkpoint — Garantir que modelos, facade e hooks compilam sem erros
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Criar utilitário `validateFile` e o componente `ProfilePhotoUploader`
  - [x] 8.1 Criar `src/lib/validateFile.ts` com a função `validateFile(file: File): FileValidationResult`
    - Constantes `ALLOWED_MIME_TYPES` e `MAX_FILE_SIZE_BYTES`
    - Retorna `{ valid: true }` ou `{ valid: false, error: "INVALID_TYPE" | "FILE_TOO_LARGE" }`
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ]* 8.2 Escrever property test para `validateFile` — Property 1
    - **Property 1: Validação de tipo MIME é exaustiva e correta**
    - **Validates: Requirements 1.1**
    - Arquivo: `src/lib/__tests__/validateFile.test.ts`
    - Gerador: `fc.string()` para tipos MIME arbitrários

  - [ ]* 8.3 Escrever property test para `validateFile` — Property 2
    - **Property 2: Validação de tamanho respeita o limite de 5 MB**
    - **Validates: Requirements 1.3**
    - Arquivo: `src/lib/__tests__/validateFile.test.ts`
    - Gerador: `fc.integer({ min: 0, max: 20_000_000 })` para tamanhos arbitrários

  - [x] 8.4 Criar `src/components/molecules/ProfilePhotoUploader.tsx`
    - Props: `mode: "me" | "admin"`, `servidorId?: string`, `servidorNome: string`, `currentFotoUrl?: string | null`, `onSuccess?: (url: string) => void`
    - Renderizar `<input type="file" accept="image/jpeg,image/png,image/webp">` com `<label>` associado via `htmlFor`
    - Validar com `validateFile` antes do envio; exibir erro sem enviar requisição se inválido
    - Exibir preview via `URL.createObjectURL` após seleção válida; revogar URL no cleanup do `useEffect`
    - Chamar `useUploadFotoPerfilMe` ou `useUploadFotoPerfilAdmin` conforme `mode`
    - Exibir spinner e desabilitar botão de envio durante upload
    - Exibir mensagens de erro para respostas 400 e 413 com `aria-invalid="true"` e `aria-describedby`
    - Botão de envio com `aria-label` descritivo
    - Todos os textos via chaves i18n do namespace `servidores`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.8, 1.9, 1.10, 2.1, 2.4, 2.5, 5.1, 5.2, 5.3, 5.4_

  - [ ]* 8.5 Escrever testes de exemplo para `ProfilePhotoUploader`
    - Renderiza `<input type="file">` com `accept` correto e `<label>` associado
    - Exibe preview após seleção de arquivo válido
    - Exibe erro de tipo inválido sem chamar fetch
    - Exibe loading e botão desabilitado durante upload (via MSW)
    - Exibe erro correto para respostas 400 e 413 (via MSW)
    - Botão de envio tem `aria-label` descritivo
    - Arquivo: `src/components/molecules/__tests__/ProfilePhotoUploader.test.tsx`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.8, 1.9, 1.10, 5.1, 5.2_

  - [ ]* 8.6 Escrever property test para `ProfilePhotoUploader` — Property 7
    - **Property 7: Erros de validação sempre ativam aria-invalid e aria-describedby**
    - **Validates: Requirements 5.3**
    - Arquivo: `src/components/molecules/__tests__/ProfilePhotoUploader.test.tsx`
    - Gerador: `fc.constantFrom("INVALID_TYPE", "FILE_TOO_LARGE", "400", "413")` para condições de erro

- [ ] 9. Estender o `Avatar` com property test de acessibilidade
  - [ ]* 9.1 Escrever property test para `Avatar` — Property 6
    - **Property 6: Avatar sempre mantém aria-label igual ao nome, independente do src**
    - **Validates: Requirements 5.5**
    - Arquivo: `src/components/atoms/__tests__/Avatar.test.tsx` (complementar ao existente)
    - Geradores: `fc.string()` para nomes, `fc.webUrl()` para src

  - [ ]* 9.2 Escrever testes de exemplo complementares para `Avatar`
    - Exibe iniciais quando `src` está ausente
    - Exibe iniciais após `onError` na imagem
    - `aria-label` é sempre o nome
    - Arquivo: `src/components/atoms/__tests__/Avatar.test.tsx`
    - _Requirements: 3.1, 3.2, 5.5_

- [x] 10. Integrar `ProfilePhotoUploader` na `ProfilePageClient`
  - Adicionar `ProfilePhotoUploader` com `mode="me"` acima da tabela de identidade em `src/components/organisms/ProfilePageClient.tsx`
  - Passar `servidorNome={user?.nome ?? ""}` e `currentFotoUrl={user?.fotoPerfilUrl}`
  - Exibir `Avatar` do usuário autenticado com `src={user?.fotoPerfilUrl}` na seção de identidade
  - _Requirements: 1.4, 1.6, 1.7, 3.4_

- [x] 11. Propagar `fotoPerfilUrl` para a `SidebarNav` via `AdminShell`
  - Modificar `src/components/organisms/AdminShell.tsx` para passar `user?.fotoPerfilUrl ?? null` como `userAvatarUrl` para `SidebarNav`
  - _Requirements: 3.3_

- [x] 12. Adicionar `Avatar` com `fotoPerfilUrl` na listagem de servidores
  - Modificar `ServidorRow` em `src/components/organisms/ServidoresPageClient.tsx` para exibir `Avatar` com `src={servidor.fotoPerfilUrl ?? undefined}` e `name={servidor.nome}` na coluna de nome
  - _Requirements: 3.5_

- [x] 13. Disponibilizar `ProfilePhotoUploader` no modo admin para edição de servidores
  - Modificar `src/components/molecules/ServidorViewModal.tsx` ou `ServidorFormDialog.tsx` para incluir `ProfilePhotoUploader` com `mode="admin"` e `servidorId={servidor.id}` quando o usuário autenticado possui papel `ADMIN`
  - _Requirements: 2.1, 2.2, 2.3, 2.5, 2.6_

- [x] 14. Checkpoint final — Garantir que todos os testes passam
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tarefas marcadas com `*` são opcionais e podem ser puladas para um MVP mais rápido
- Cada tarefa referencia os requisitos específicos para rastreabilidade
- Os handlers MSW (tarefa 4) devem ser adicionados antes dos testes de integração dos hooks (tarefas 5 e 6)
- O `Content-Type` do `multipart/form-data` não deve ser definido manualmente — o browser injeta o boundary correto ao usar `FormData`
- A limpeza de `URL.createObjectURL` via `URL.revokeObjectURL` no cleanup do `useEffect` é obrigatória para evitar memory leaks
- Property tests usam `@fast-check/vitest` já presente no projeto
