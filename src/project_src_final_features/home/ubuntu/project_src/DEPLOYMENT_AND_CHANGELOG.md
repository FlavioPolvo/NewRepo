# Documentação de Entrega e Orientações

Este documento resume as alterações e novas funcionalidades implementadas no projeto, além de fornecer orientações para build e deploy.

## Funcionalidades Implementadas e Alterações Realizadas:

1.  **Paginação Avançada e Exportação (XLS/PDF):**
    *   **Listas Afetadas:** "Todos os Produtores" (`AllProducersPage.tsx`) e "Todas as Entradas" (`AllEntriesPage.tsx`).
    *   **Paginação:**
        *   Adicionado seletor para escolher o número de itens por página (10, 25, 50, 100).
        *   Navegação completa: primeira página, página anterior, próxima página, última página.
        *   Contagem total de itens filtrados exibida.
    *   **Exportação:**
        *   Botões para exportar os dados filtrados para XLS (Excel) e PDF.
        *   A exportação considera **todos os registros** que correspondem aos filtros aplicados no momento da exportação (não apenas a página visível).
        *   Todos os campos visíveis nas tabelas são incluídos nos arquivos exportados.
        *   Bibliotecas utilizadas: `xlsx` para XLS e `jspdf` com `jspdf-autotable` para PDF.

2.  **Melhorias na Tela "Todas as Entradas" (`AllEntriesPage.tsx`):**
    *   **Campo "Anal.":**
        *   Adicionada a coluna "Anal." na tabela de exibição das entradas, buscando o dado da coluna `anal` da tabela `entries` do banco de dados.
        *   A funcionalidade de busca da tabela agora também considera o campo "Anal.".
        *   O campo "Anal." foi incluído nas exportações XLS e PDF desta tela.

3.  **Ajuste no "Resumo de Produção" da Home (`home.tsx` e `ProductionSummary.tsx`):**
    *   A lógica de filtragem no componente `ProductionSummary.tsx` foi revisada para garantir que os filtros visuais (Período, Município, Cor, Intervalo de Datas) aplicados pelo usuário reflitam corretamente nos dados exibidos nos cards de resumo ("Produção Total", "Média por Produtor", "Classificação por Cor") e nos gráficos.
    *   O hook `useReportData.ts` foi ajustado para processar e fornecer os dados de forma que os filtros possam ser aplicados dinamicamente na interface.

4.  **Configuração para Deploy em Subdiretório (`/scomapi`):**
    *   **`vite.config.ts`:**
        *   A propriedade `base` foi configurada para: `process.env.NODE_ENV === "development" ? "/" : (process.env.VITE_BASE_PATH || "/scomapi/")`.
        *   Isso significa que em ambiente de desenvolvimento, a base será `/`. Em produção, ele usará o valor da variável de ambiente `VITE_BASE_PATH` se definida; caso contrário, usará `/scomapi/` como padrão.
    *   **`main.tsx` (React Router):**
        *   O `BrowserRouter` foi configurado com `basename={import.meta.env.BASE_URL}`.
        *   Isso garante que o React Router use automaticamente o caminho base definido pelo Vite, tornando a aplicação funcional quando hospedada em um subdiretório.

## Instruções de Build e Deploy:

1.  **Variável de Ambiente (Opcional, mas recomendado para flexibilidade):**
    *   Se você deseja controlar o subdiretório via variável de ambiente, defina `VITE_BASE_PATH` no seu ambiente de build/produção. Por exemplo, para o subdiretório `/scomapi/`:
        ```bash
        VITE_BASE_PATH=/scomapi/
        ```
    *   Se `VITE_BASE_PATH` não for definida, o build de produção usará `/scomapi/` como padrão, conforme configurado no `vite.config.ts`.

2.  **Comando de Build:**
    *   Execute o comando de build do seu projeto (geralmente `npm run build` ou `yarn build`).
        ```bash
        npm run build
        ```
    *   Isso gerará os arquivos estáticos otimizados na pasta `dist` (ou a pasta de saída configurada no seu projeto).

3.  **Deploy:**
    *   Copie o conteúdo da pasta `dist` para o diretório no seu servidor web que corresponde ao caminho `/scomapi/`.
    *   **Exemplo de configuração do servidor (Nginx):**
        Se você estiver usando Nginx, uma configuração de `location` similar a esta pode ser necessária para servir a aplicação a partir do subdiretório e lidar corretamente com o roteamento do lado do cliente:
        ```nginx
        location /scomapi/ {
            alias /caminho/para/seu/projeto/dist/;
            try_files $uri $uri/ /scomapi/index.html;
        }
        ```
        Substitua `/caminho/para/seu/projeto/dist/` pelo caminho real para a pasta `dist` no seu servidor.
    *   Certifique-se de que seu servidor web esteja configurado para servir o `index.html` para todas as rotas dentro de `/scomapi/` para que o roteamento do React funcione corretamente em atualizações de página ou acesso direto a URLs.

## Observações Finais:

*   As bibliotecas `xlsx`, `jspdf` e `jspdf-autotable` foram adicionadas como dependências para as funcionalidades de exportação. Certifique-se de que elas estejam corretamente instaladas no seu projeto (`npm install xlsx jspdf jspdf-autotable` ou `yarn add xlsx jspdf jspdf-autotable` se necessário, embora as modificações nos arquivos já incluam os imports).
*   Revise os caminhos de importação e as configurações específicas do seu ambiente de build e deploy, caso haja alguma particularidade não coberta aqui.

Espero que estas alterações e funcionalidades atendam às suas expectativas! Por favor, realize os testes necessários e me informe caso precise de mais algum ajuste ou tenha alguma dúvida.
