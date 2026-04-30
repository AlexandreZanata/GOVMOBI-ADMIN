# Requirements Document

## Introduction

Esta feature adiciona suporte a **foto de perfil de servidor** no admin panel GovMobile. Qualquer servidor autenticado pode atualizar sua própria foto de perfil via `PATCH /servidores/me/foto-perfil`. Administradores podem, adicionalmente, definir a foto de qualquer servidor via `PATCH /servidores/{id}/foto-perfil`.

O backend processa a imagem (redimensiona para 400×400 px e converte para WebP), armazena no CDN e retorna a URL pública. A foto anterior é removida automaticamente do storage pelo backend. O frontend é responsável por: selecionar o arquivo, validar tipo e tamanho antes do envio, exibir preview, enviar via `multipart/form-data`, atualizar o estado local com a nova URL e exibir o avatar atualizado em todos os pontos da UI (sidebar, página de perfil, listagem de servidores).

---

## Glossary

- **ProfilePhotoUploader**: Componente molecule responsável por selecionar, pré-validar e enviar a foto de perfil.
- **Avatar**: Átomo existente que exibe imagem circular com fallback de iniciais.
- **ServidorFacade**: Facade (`servidoresFacade`) responsável pelas chamadas HTTP relacionadas a servidores.
- **ProfilePhotoFacade**: Extensão do `ServidoresFacade` com os métodos de upload de foto de perfil.
- **AuthStore**: Store Zustand que mantém o estado da sessão do usuário autenticado.
- **MSW**: Mock Service Worker — intercepta requisições HTTP nos testes e no ambiente de desenvolvimento.
- **CDN_URL**: URL pública retornada pelo backend após o upload (`fotoPerfilUrl`).
- **Servidor**: Funcionário público cadastrado no sistema.
- **Admin**: Usuário com papel `ADMIN` no sistema.
- **fotoPerfilUrl**: Campo opcional no modelo `Servidor` e em `AuthUser` que armazena a URL pública da foto de perfil.

---

## Requirements

### Requirement 1: Upload de foto pelo próprio servidor

**User Story:** Como servidor autenticado, quero atualizar minha própria foto de perfil, para que minha identidade visual esteja correta no sistema.

#### Acceptance Criteria

1. WHEN o servidor seleciona um arquivo de imagem no `ProfilePhotoUploader`, THE `ProfilePhotoUploader` SHALL aceitar apenas arquivos com tipo MIME `image/jpeg`, `image/png` ou `image/webp`.
2. WHEN o servidor seleciona um arquivo com tipo MIME não permitido, THE `ProfilePhotoUploader` SHALL exibir uma mensagem de erro de validação sem enviar a requisição ao servidor.
3. WHEN o servidor seleciona um arquivo com tamanho superior a 5 MB, THE `ProfilePhotoUploader` SHALL exibir uma mensagem de erro de validação sem enviar a requisição ao servidor.
4. WHEN o servidor seleciona um arquivo válido, THE `ProfilePhotoUploader` SHALL exibir um preview da imagem selecionada antes do envio.
5. WHEN o servidor confirma o envio de um arquivo válido, THE `ProfilePhotoFacade` SHALL enviar uma requisição `PATCH /servidores/me/foto-perfil` com `Content-Type: multipart/form-data` contendo o campo `foto`.
6. WHEN a requisição `PATCH /servidores/me/foto-perfil` retorna status 200, THE `AuthStore` SHALL atualizar o campo `fotoPerfilUrl` do usuário autenticado com a URL retornada em `fotoPerfilUrl`.
7. WHEN a requisição `PATCH /servidores/me/foto-perfil` retorna status 200, THE `Avatar` SHALL exibir a nova imagem em todos os pontos da UI que renderizam o avatar do usuário autenticado.
8. WHEN a requisição `PATCH /servidores/me/foto-perfil` retorna status 400, THE `ProfilePhotoUploader` SHALL exibir uma mensagem de erro indicando que o arquivo é inválido ou corrompido.
9. WHEN a requisição `PATCH /servidores/me/foto-perfil` retorna status 413, THE `ProfilePhotoUploader` SHALL exibir uma mensagem de erro indicando que o arquivo excede o tamanho máximo permitido.
10. WHILE o upload está em progresso, THE `ProfilePhotoUploader` SHALL exibir um indicador de carregamento e desabilitar o botão de envio.

---

### Requirement 2: Upload de foto por administrador

**User Story:** Como administrador, quero definir a foto de perfil de qualquer servidor, para que eu possa gerenciar a identidade visual dos servidores no sistema.

#### Acceptance Criteria

1. WHERE o usuário autenticado possui papel `ADMIN`, THE `ProfilePhotoUploader` SHALL estar disponível na tela de detalhes/edição de qualquer servidor.
2. WHEN o administrador seleciona um arquivo válido para um servidor específico e confirma o envio, THE `ProfilePhotoFacade` SHALL enviar uma requisição `PATCH /servidores/{id}/foto-perfil` com `Content-Type: multipart/form-data` contendo o campo `foto`, onde `{id}` é o identificador do servidor alvo.
3. WHEN a requisição `PATCH /servidores/{id}/foto-perfil` retorna status 200, THE `ServidorFacade` SHALL invalidar o cache TanStack Query do servidor atualizado para que a nova `fotoPerfilUrl` seja refletida na listagem e nos detalhes.
4. WHEN a requisição `PATCH /servidores/{id}/foto-perfil` retorna status 400, THE `ProfilePhotoUploader` SHALL exibir uma mensagem de erro indicando que o arquivo é inválido ou corrompido.
5. WHEN a requisição `PATCH /servidores/{id}/foto-perfil` retorna status 404, THE `ProfilePhotoUploader` SHALL exibir uma mensagem de erro indicando que o servidor não foi encontrado.
6. WHERE o usuário autenticado não possui papel `ADMIN`, THE `ProfilePhotoUploader` SHALL estar disponível apenas para o próprio perfil do usuário autenticado, sem expor o endpoint de administração.

---

### Requirement 3: Exibição do avatar atualizado

**User Story:** Como usuário do sistema, quero ver a foto de perfil atualizada em todos os pontos da interface, para que a identidade visual seja consistente.

#### Acceptance Criteria

1. THE `Avatar` SHALL exibir a imagem referenciada por `fotoPerfilUrl` quando esse campo estiver presente e a URL for acessível.
2. WHEN a imagem referenciada por `fotoPerfilUrl` falha ao carregar, THE `Avatar` SHALL exibir o fallback de iniciais derivado do nome do servidor.
3. THE `SidebarNav` SHALL exibir o `Avatar` do usuário autenticado com a `fotoPerfilUrl` atualizada após um upload bem-sucedido.
4. THE `ProfilePageClient` SHALL exibir o `Avatar` do usuário autenticado com a `fotoPerfilUrl` atualizada após um upload bem-sucedido.
5. THE `ServidoresPageClient` SHALL exibir o `Avatar` de cada servidor com a respectiva `fotoPerfilUrl` quando disponível.

---

### Requirement 4: Modelo de dados e contrato de API

**User Story:** Como desenvolvedor, quero que o modelo `Servidor` e `AuthUser` incluam o campo `fotoPerfilUrl`, para que a URL da foto de perfil seja tipada e propagada corretamente pelo sistema.

#### Acceptance Criteria

1. THE `Servidor` model SHALL incluir o campo opcional `fotoPerfilUrl: string | null` representando a URL pública da foto de perfil.
2. THE `AuthUser` model SHALL incluir o campo opcional `fotoPerfilUrl: string | null` representando a URL pública da foto de perfil do usuário autenticado.
3. WHEN o backend retorna `fotoPerfilUrl` na resposta de `PATCH /servidores/me/foto-perfil`, THE `ProfilePhotoFacade` SHALL retornar um objeto `{ fotoPerfilUrl: string }` tipado.
4. WHEN o backend retorna `fotoPerfilUrl` na resposta de `PATCH /servidores/{id}/foto-perfil`, THE `ProfilePhotoFacade` SHALL retornar um objeto `{ fotoPerfilUrl: string }` tipado.
5. THE `MSW` SHALL incluir handlers para `PATCH /servidores/me/foto-perfil` e `PATCH /servidores/:id/foto-perfil` que simulem os cenários de sucesso (200), arquivo inválido (400), arquivo muito grande (413) e servidor não encontrado (404).

---

### Requirement 5: Acessibilidade e internacionalização

**User Story:** Como usuário do sistema, quero que a interface de upload de foto seja acessível e esteja traduzida, para que todos os usuários possam utilizá-la independentemente do idioma configurado.

#### Acceptance Criteria

1. THE `ProfilePhotoUploader` SHALL incluir um elemento `<input type="file">` com atributo `accept` restrito a `image/jpeg,image/png,image/webp` e um `<label>` associado via `htmlFor`.
2. THE `ProfilePhotoUploader` SHALL incluir atributo `aria-label` ou `aria-labelledby` descritivo no botão de envio.
3. WHEN o `ProfilePhotoUploader` exibe uma mensagem de erro, THE `ProfilePhotoUploader` SHALL associar a mensagem ao campo via `aria-describedby` e marcar o campo com `aria-invalid="true"`.
4. THE `ProfilePhotoUploader` SHALL utilizar chaves de tradução via `react-i18next` para todos os textos visíveis, incluindo labels, placeholders, mensagens de erro e estados de carregamento.
5. THE `Avatar` SHALL manter o atributo `aria-label` com o nome do servidor mesmo quando exibindo a imagem de perfil.
