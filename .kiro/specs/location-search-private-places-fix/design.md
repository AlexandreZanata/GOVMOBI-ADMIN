# Location Search Private Places Fix — Bugfix Design

## Overview

O componente LocationPicker atualmente retorna apenas locais públicos do Mapbox ao realizar pesquisas de endereços. Este bug impede que usuários selecionem locais privados/internos da organização (secretarias, prédios internos, etc.) como origem ou destino de corridas.

A estratégia de correção envolve modificar o endpoint GET /pesquisa/geocoding para consultar locais privados cadastrados no banco de dados e mesclar esses resultados com os resultados do Mapbox antes de retornar a resposta. O componente LocationPicker não precisa ser modificado, pois já está preparado para exibir qualquer resultado que siga a interface `GeocodingFeature`.

## Glossary

- **Bug_Condition (C)**: A condição que dispara o bug - quando o usuário pesquisa por um local privado cadastrado (secretaria, prédio interno, etc.) e esse local não aparece nos resultados
- **Property (P)**: O comportamento desejado - locais privados cadastrados devem aparecer nos resultados de pesquisa junto com locais públicos do Mapbox
- **Preservation**: Comportamento existente de pesquisa de locais públicos do Mapbox que deve permanecer inalterado pela correção
- **GeocodingFeature**: Interface TypeScript que define a estrutura de um resultado de pesquisa: `{ address: string, placeName: string, lng: number, lat: number }`
- **pesquisaFacade.geocoding()**: Função no facade que chama GET /pesquisa/geocoding e retorna array de GeocodingFeature
- **LocationPicker**: Componente React em `src/components/molecules/LocationPicker.tsx` que renderiza o campo de pesquisa de endereços
- **Private Location**: Local privado/interno da organização cadastrado no banco de dados (secretarias, prédios internos, pontos de interesse específicos)
- **Mapbox Public Location**: Local público retornado pela API do Mapbox (ruas, avenidas, bairros, cidades, pontos de interesse públicos)

## Bug Details

### Bug Condition

O bug se manifesta quando um usuário digita o nome de um local privado cadastrado no sistema (secretaria, prédio interno, ponto de interesse interno) no campo de pesquisa do LocationPicker. O endpoint GET /pesquisa/geocoding atualmente consulta apenas a API do Mapbox, que retorna apenas locais públicos, sem consultar ou incluir locais privados cadastrados no banco de dados da organização.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { query: string, proximity?: { lat: number, lng: number } }
  OUTPUT: boolean
  
  RETURN input.query.length >= 2
         AND existsPrivateLocationMatching(input.query)
         AND NOT privateLocationInResults(input.query)
END FUNCTION
```

Onde:
- `existsPrivateLocationMatching(query)`: Retorna true se existe pelo menos um local privado cadastrado cujo nome corresponde à query de pesquisa
- `privateLocationInResults(query)`: Retorna true se os resultados retornados pela API incluem locais privados que correspondem à query

### Examples

- **Exemplo 1**: Usuário digita "Secretaria de Educação" → Sistema retorna apenas resultados públicos do Mapbox (ruas com nome similar), mas não retorna o local privado cadastrado "Secretaria de Educação" com coordenadas específicas
- **Exemplo 2**: Usuário digita "Prédio Administrativo" → Sistema retorna apenas resultados públicos do Mapbox, mas não retorna o local privado cadastrado "Prédio Administrativo Central"
- **Exemplo 3**: Usuário digita "Almoxarifado Central" → Sistema retorna apenas resultados públicos do Mapbox, mas não retorna o local privado cadastrado "Almoxarifado Central"
- **Edge Case**: Usuário digita "Prefeitura" → Sistema deve retornar tanto o local público do Mapbox (endereço genérico) quanto o local privado cadastrado "Prefeitura Municipal - Entrada Principal" (se existir)

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Pesquisas por locais públicos (ruas, avenidas, bairros, cidades) devem continuar retornando resultados do Mapbox
- Seleção de um local público deve continuar preenchendo corretamente as coordenadas (lat, lng) e o label
- Parâmetro proximity deve continuar sendo usado para priorizar resultados próximos à localização especificada
- Gerenciamento de estado do componente (fechar dropdown, limpar resultados, etc.) deve continuar funcionando
- Validação de pesquisa mínima (2 caracteres) deve continuar funcionando
- Tratamento de erros na chamada à API deve continuar funcionando graciosamente

**Scope:**
Todas as entradas que NÃO envolvem locais privados cadastrados devem ser completamente não afetadas por esta correção. Isso inclui:
- Pesquisas por endereços públicos (ruas, avenidas, bairros)
- Pesquisas por cidades e estados
- Pesquisas por pontos de interesse públicos (praças, parques, etc.)
- Uso do parâmetro proximity para priorização de resultados
- Comportamento do componente LocationPicker (debounce, loading, dropdown, seleção)

## Hypothesized Root Cause

Baseado na descrição do bug e análise do código, as causas mais prováveis são:

1. **Falta de Consulta ao Banco de Dados**: O endpoint GET /pesquisa/geocoding atualmente consulta apenas a API do Mapbox e não consulta a tabela de locais privados no banco de dados
   - O backend não possui lógica para buscar locais privados cadastrados
   - Não há query SQL ou ORM para buscar locais privados por nome

2. **Falta de Mesclagem de Resultados**: Mesmo que locais privados sejam consultados, não há lógica para mesclar esses resultados com os resultados do Mapbox
   - Não há função para combinar arrays de resultados
   - Não há lógica para ordenar/priorizar resultados mesclados

3. **Falta de Tabela ou Modelo de Dados**: Pode não existir uma tabela no banco de dados para armazenar locais privados
   - Necessário verificar se existe tabela `private_locations` ou similar
   - Necessário verificar se existe modelo/entidade para locais privados

4. **Formato de Resposta Incompatível**: Locais privados podem estar armazenados em formato diferente do esperado pela interface GeocodingFeature
   - Necessário garantir que locais privados tenham campos: address, placeName, lng, lat
   - Necessário transformar dados do banco para o formato esperado

## Correctness Properties

Property 1: Bug Condition - Private Locations Appear in Search Results

_For any_ search query where a private location exists in the database matching the query (isBugCondition returns true), the fixed GET /pesquisa/geocoding endpoint SHALL return results that include both Mapbox public locations AND matching private locations, with each private location formatted as a GeocodingFeature object containing address, placeName, lng, and lat fields.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation - Public Location Search Behavior

_For any_ search query that does NOT match any private location (isBugCondition returns false), the fixed GET /pesquisa/geocoding endpoint SHALL produce exactly the same results as the original endpoint, preserving all existing Mapbox public location search behavior including proximity-based prioritization and result ordering.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**

## Fix Implementation

### Changes Required

Assumindo que nossa análise de causa raiz está correta:

**File**: Backend endpoint handler for `GET /pesquisa/geocoding` (path to be determined based on backend structure)

**Function**: Geocoding search handler

**Specific Changes**:

1. **Add Private Location Database Query**: Implement query to search private locations table
   - Query private_locations table (or equivalent) for records where name/placeName matches the search query
   - Use case-insensitive LIKE or full-text search for matching
   - Return fields: id, name (as placeName), address, latitude (as lat), longitude (as lng)

2. **Transform Private Location Data**: Convert database records to GeocodingFeature format
   - Map database fields to interface: `{ address, placeName, lng, lat }`
   - Ensure all required fields are present and correctly typed
   - Handle null/missing fields gracefully

3. **Merge Results**: Combine private location results with Mapbox results
   - Call Mapbox API as before to get public locations
   - Append or prepend private location results to Mapbox results
   - Consider prioritization: private locations first, then Mapbox results

4. **Apply Proximity Filtering (Optional)**: If proximity parameter is provided, consider filtering or re-ordering private locations
   - Calculate distance from proximity point to each private location
   - Sort private locations by distance if proximity is provided
   - Maintain existing Mapbox proximity behavior

5. **Maintain Response Format**: Ensure merged results maintain the expected array format
   - Return array of GeocodingFeature objects
   - Maintain envelope format if used: `{ success, data: [...], timestamp }`
   - Ensure response is compatible with existing pesquisaFacade.geocoding() parsing logic

**File**: `src/facades/pesquisaFacade.ts` (No changes required)

The facade already handles array responses correctly and will work with merged results without modification.

**File**: `src/components/molecules/LocationPicker.tsx` (No changes required)

The component already handles GeocodingFeature arrays correctly and will display private locations without modification.

### Database Schema (If Not Exists)

If the private_locations table does not exist, it needs to be created:

```sql
CREATE TABLE private_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  address VARCHAR(500),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_private_locations_name ON private_locations(name);
CREATE INDEX idx_private_locations_active ON private_locations(is_active);
```

## Testing Strategy

### Validation Approach

A estratégia de testes segue uma abordagem de duas fases: primeiro, expor contraexemplos que demonstram o bug no código não corrigido, depois verificar que a correção funciona corretamente e preserva o comportamento existente.

### Exploratory Bug Condition Checking

**Goal**: Expor contraexemplos que demonstram o bug ANTES de implementar a correção. Confirmar ou refutar a análise de causa raiz. Se refutarmos, precisaremos re-hipotetizar.

**Test Plan**: Escrever testes que simulam pesquisas por locais privados cadastrados e verificam que esses locais aparecem nos resultados. Executar esses testes no código NÃO CORRIGIDO para observar falhas e entender a causa raiz.

**Test Cases**:
1. **Private Location Search Test**: Cadastrar um local privado "Secretaria de Educação" no banco de dados, simular pesquisa por "Secretaria" no LocationPicker, verificar que o local privado aparece nos resultados (will fail on unfixed code)
2. **Multiple Private Locations Test**: Cadastrar múltiplos locais privados com nomes similares, simular pesquisa, verificar que todos os locais correspondentes aparecem (will fail on unfixed code)
3. **Mixed Results Test**: Pesquisar por termo que corresponde tanto a locais públicos quanto privados (ex: "Prefeitura"), verificar que ambos aparecem nos resultados (will fail on unfixed code - only public will appear)
4. **Private Location Selection Test**: Selecionar um local privado dos resultados, verificar que as coordenadas corretas são preenchidas (will fail on unfixed code - private location won't be in results)

**Expected Counterexamples**:
- Locais privados cadastrados não aparecem nos resultados de pesquisa
- Apenas locais públicos do Mapbox são retornados
- Possíveis causas: endpoint não consulta banco de dados, não mescla resultados, tabela não existe

### Fix Checking

**Goal**: Verificar que para todas as entradas onde a condição de bug é verdadeira, a função corrigida produz o comportamento esperado.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := geocodingEndpoint_fixed(input.query, input.proximity)
  ASSERT expectedBehavior(result)
END FOR
```

Onde `expectedBehavior(result)` verifica:
- `result` contém pelo menos um local privado que corresponde à query
- Cada local privado tem formato GeocodingFeature correto: `{ address, placeName, lng, lat }`
- Locais públicos do Mapbox também estão presentes (se houver)
- Resultados estão ordenados de forma lógica (privados primeiro ou por relevância)

### Preservation Checking

**Goal**: Verificar que para todas as entradas onde a condição de bug NÃO é verdadeira, a função corrigida produz o mesmo resultado que a função original.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT geocodingEndpoint_original(input) = geocodingEndpoint_fixed(input)
END FOR
```

**Testing Approach**: Property-based testing é recomendado para preservation checking porque:
- Gera muitos casos de teste automaticamente através do domínio de entrada
- Captura edge cases que testes unitários manuais podem perder
- Fornece garantias fortes de que o comportamento permanece inalterado para todas as entradas não-buggy

**Test Plan**: Observar comportamento no código NÃO CORRIGIDO primeiro para pesquisas de locais públicos, depois escrever testes baseados em propriedades capturando esse comportamento.

**Test Cases**:
1. **Public Location Search Preservation**: Observar que pesquisas por endereços públicos (ruas, avenidas) retornam resultados do Mapbox no código não corrigido, depois escrever teste para verificar que isso continua após a correção
2. **Proximity Parameter Preservation**: Observar que o parâmetro proximity afeta a ordenação de resultados no código não corrigido, depois escrever teste para verificar que isso continua funcionando
3. **Empty Query Preservation**: Observar que queries vazias ou muito curtas (<2 caracteres) não retornam resultados no código não corrigido, depois verificar que isso continua
4. **Error Handling Preservation**: Observar que erros na API do Mapbox são tratados graciosamente no código não corrigido, depois verificar que isso continua

### Unit Tests

- Testar query ao banco de dados de locais privados com diferentes termos de pesquisa
- Testar transformação de dados do banco para formato GeocodingFeature
- Testar mesclagem de arrays de resultados (privados + públicos)
- Testar edge cases (query vazia, sem resultados privados, sem resultados públicos, erro no Mapbox)
- Testar que LocationPicker renderiza corretamente locais privados nos resultados
- Testar que seleção de local privado preenche coordenadas corretamente

### Property-Based Tests

- Gerar queries aleatórias e verificar que locais privados correspondentes sempre aparecem nos resultados
- Gerar configurações aleatórias de locais privados e verificar que pesquisas sempre retornam correspondências corretas
- Testar que para qualquer query que não corresponde a locais privados, os resultados são idênticos ao comportamento original (apenas Mapbox)
- Testar que o formato de resposta é sempre válido (array de GeocodingFeature) independente da combinação de resultados

### Integration Tests

- Testar fluxo completo: usuário digita nome de local privado → resultados aparecem → usuário seleciona → coordenadas são preenchidas → corrida é criada com sucesso
- Testar fluxo de pesquisa mista: query retorna tanto locais públicos quanto privados, usuário pode selecionar qualquer um
- Testar que proximity parameter funciona corretamente com locais privados (ordenação por distância)
- Testar que mudança de contexto (limpar pesquisa, selecionar outro local) funciona corretamente com locais privados
