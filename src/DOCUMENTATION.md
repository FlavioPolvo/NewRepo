# Documentação das Novas Funcionalidades

## 1. Filtros Dinâmicos no Resumo de Produção

Os filtros na seção "Resumo de Produção" da página inicial foram aprimorados para refletir dinamicamente nos cards de resumo. Agora, ao selecionar diferentes opções nos filtros, os dados exibidos nos cards "Produção Total", "Média por Produtor" e "Classificação por Cor" são atualizados automaticamente.

### Filtros Implementados:
- **Período**: Mensal, Trimestral, Anual, etc.
- **Produtores**: Todos ou seleção específica
- **Cores**: Todas as cores ou seleção específica
- **Intervalo de Datas**: Seleção personalizada de período

### Comportamento:
- Os dados são recalculados em tempo real quando qualquer filtro é alterado
- Os gráficos e estatísticas são atualizados para refletir apenas os dados que correspondem aos filtros selecionados
- O contador de produtores ativos é atualizado com base nos filtros aplicados

## 2. Funcionalidade de Edição em "Todos os Produtores"

Foi implementada a capacidade de editar os dados dos produtores diretamente na interface.

### Características:
- **Botão "Editar"**: Adicionado em cada linha da tabela de produtores
- **Modal de Edição**: Ao clicar no botão "Editar", um modal é aberto com um formulário preenchido com os dados atuais do produtor
- **Campos Editáveis**:
  - Nome
  - Código COMAPI
  - Município
  - Comunidade
  - CPF
  - Status
- **Validação**: Os dados são validados antes de serem enviados ao servidor
- **Feedback**: Mensagens de sucesso ou erro são exibidas após a tentativa de atualização
- **Atualização Automática**: A tabela é atualizada automaticamente após uma edição bem-sucedida

## 3. Funcionalidade de Edição em "Todas as Entradas"

Similar à edição de produtores, foi implementada a capacidade de editar os dados das entradas.

### Características:
- **Botão "Editar"**: Adicionado em cada linha da tabela de entradas
- **Modal de Edição**: Ao clicar no botão "Editar", um modal é aberto com um formulário preenchido com os dados atuais da entrada
- **Campos Editáveis**:
  - Data
  - Produtor (Código COMAPI)
  - Município
  - Comunidade
  - Lote
  - Anal.
  - Código da Cor
  - Peso Líquido (kg)
  - Valor Unitário (R$)
  - Valor Total (R$)
  - Quantidade
  - Peso Bruto (kg)
  - Tara (kg)
  - Tara Total (kg)
  - Umidade (%)
  - Apiário
  - Contrato
  - Número da Nota Fiscal
- **Validação**: Os dados são validados antes de serem enviados ao servidor
- **Feedback**: Mensagens de sucesso ou erro são exibidas após a tentativa de atualização
- **Atualização Automática**: A tabela é atualizada automaticamente após uma edição bem-sucedida

## 4. Paginação e Exportação

Ambas as telas "Todos os Produtores" e "Todas as Entradas" agora contam com:

### Paginação Avançada:
- Seletor de itens por página (10, 25, 50, 100)
- Navegação completa (primeira, anterior, próxima, última página)
- Indicador de página atual e total de páginas
- Contador de registros totais

### Exportação de Dados:
- **Exportação para XLS**: Botão para exportar todos os dados filtrados para formato Excel
- **Exportação para PDF**: Botão para exportar todos os dados filtrados para formato PDF
- A exportação inclui todos os registros que correspondem aos filtros aplicados, não apenas a página visível

## 5. Campo "Anal." em "Todas as Entradas"

O campo "Anal." foi adicionado à tabela de entradas e está disponível para:
- Visualização na tabela
- Busca através do campo de pesquisa
- Edição através do modal de edição
- Exportação para XLS e PDF

## 6. Configuração para Subdiretório `/scomapi`

O projeto foi configurado para ser implantado no subdiretório `/scomapi`:
- O arquivo `vite.config.ts` foi atualizado com `base: '/scomapi/'`
- O React Router foi configurado para usar o caminho base correto
- Todos os recursos estáticos (imagens, CSS, JS) são carregados relativos ao caminho base

## Notas sobre Row-Level Security (RLS) no Supabase

Para garantir que as operações de atualização funcionem corretamente, as políticas de Row-Level Security (RLS) no Supabase devem incluir tanto a expressão USING quanto a expressão WITH CHECK para operações UPDATE:

```sql
-- Para a tabela producers
CREATE POLICY "Permitir UPDATE em producers" ON producers
FOR UPDATE TO public
USING (true)
WITH CHECK (true);

-- Para a tabela entries
CREATE POLICY "Permitir UPDATE em entries" ON entries
FOR UPDATE TO public
USING (true)
WITH CHECK (true);
```

Estas políticas permitem que qualquer usuário atualize qualquer registro. Se for necessário restringir o acesso, as expressões USING e WITH CHECK devem ser ajustadas de acordo com os requisitos de segurança específicos.
