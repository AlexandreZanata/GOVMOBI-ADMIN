# Bugfix Requirements Document

## Introduction

O componente LocationPicker, utilizado no modal de "Solicitar Corrida" (RunCreateAdminDialog), atualmente retorna apenas locais públicos do Mapbox ao realizar pesquisas de endereços. Locais privados como secretarias, prédios internos, e outros pontos de interesse específicos da organização não aparecem nos resultados de pesquisa, impedindo que usuários selecionem esses locais como origem ou destino de corridas.

Este bug afeta a usabilidade do sistema, pois usuários precisam conseguir selecionar locais privados/internos da organização ao solicitar corridas.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN o usuário digita o nome de um local privado (secretaria, prédio interno, etc.) no campo de pesquisa do LocationPicker THEN o sistema retorna apenas resultados de locais públicos do Mapbox, sem incluir locais privados nos resultados

1.2 WHEN o usuário tenta selecionar um local privado como origem ou destino de uma corrida THEN o sistema não apresenta esse local como opção disponível na lista de resultados

1.3 WHEN a API GET /pesquisa/geocoding é chamada com uma query de pesquisa THEN o sistema retorna apenas features do Mapbox sem consultar ou incluir locais privados cadastrados

### Expected Behavior (Correct)

2.1 WHEN o usuário digita o nome de um local privado (secretaria, prédio interno, etc.) no campo de pesquisa do LocationPicker THEN o sistema SHALL retornar resultados que incluem tanto locais públicos do Mapbox quanto locais privados cadastrados que correspondam à pesquisa

2.2 WHEN o usuário tenta selecionar um local privado como origem ou destino de uma corrida THEN o sistema SHALL apresentar esse local como opção disponível na lista de resultados, permitindo sua seleção

2.3 WHEN a API GET /pesquisa/geocoding é chamada com uma query de pesquisa THEN o sistema SHALL consultar e mesclar resultados de locais privados cadastrados com os resultados do Mapbox antes de retornar a resposta

### Unchanged Behavior (Regression Prevention)

3.1 WHEN o usuário digita o nome de um local público (rua, avenida, bairro, cidade) no campo de pesquisa THEN o sistema SHALL CONTINUE TO retornar resultados do Mapbox para esses locais públicos

3.2 WHEN o usuário seleciona um local público dos resultados de pesquisa THEN o sistema SHALL CONTINUE TO preencher corretamente as coordenadas (lat, lng) e o label do local selecionado

3.3 WHEN o parâmetro proximity é fornecido ao LocationPicker THEN o sistema SHALL CONTINUE TO usar essas coordenadas para priorizar resultados próximos à localização especificada

3.4 WHEN o usuário limpa o campo de pesquisa ou seleciona um local THEN o sistema SHALL CONTINUE TO gerenciar corretamente o estado do componente (fechar dropdown, limpar resultados, etc.)

3.5 WHEN a pesquisa tem menos de 2 caracteres THEN o sistema SHALL CONTINUE TO não realizar a busca e não exibir resultados

3.6 WHEN ocorre um erro na chamada à API de geocoding THEN o sistema SHALL CONTINUE TO tratar o erro graciosamente, limpando os resultados e fechando o dropdown
