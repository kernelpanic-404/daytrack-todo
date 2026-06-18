# ⏳ TreeDo

<p align="center">
  <img src="https://shields.io" alt="PRs Welcome">
  <img src="https://shields.io" alt="License MIT">
  <img src="https://shields.io" alt="Made with JavaScript">
</p>

Uma aplicação de lista de tarefas (To-Do List) de tela única, moderna, focada no registro cronológico das atividades. O projeto exibe a data atual dinamicamente, gerencia subtarefas encadeadas, controla prazos retroativos e exporta relatórios profissionais em PDF com assinatura técnica.

## 🚀 Demonstração

▶️ **[Acesse a aplicação em execução aqui](https://thaistardys.github.io/treedo/)**

---


## 🎨 Funcionalidades do Sistema

- **Data Dinâmica**: O cabeçalho exibe automaticamente a data do dia atual no fuso local.
- **Tratamento de Prazos (Ontem vs Hoje)**: Tarefas não concluídas de dias anteriores ganham destaque automático em uma seção retroativa especial.
- **Subcategorias & Checklist**: Permite desmembrar uma tarefa principal em subetapas com gerenciamento de conclusão bidirecional em cascata.
- **Barra de Progresso**: Exibe em tempo real a porcentagem (%) de evolução das subtarefas de cada categoria.
- **Ciclo de Vida com Carimbo de Hora**: Cada item registra o momento exato em que foi criado e o momento em que foi arquivado.
- **Fluxo Organizacional**: Divisão inteligente de painéis entre tarefas *Pendentes*, *Concluídas* e *Excluídas*.
- **Exportação Avançada para PDF**: Filtra tarefas concluídas por período de data e gera um relatório profissional com folha de estilo para impressão e linha para Assinatura do Técnico.
- **Persistência de Dados**: Integração com o `LocalStorage` do navegador em formato JSON, impedindo a perda de dados ao recarregar a página.
- **Acessibilidade de Teclado**: Foco inteligente automatizado e envio de novas tarefas/subtarefas habilitado nativamente pela tecla `Enter`.

---

## 🛠️ Tecnologias Utilizadas

O projeto foi desenvolvido puramente com a tríade fundamental do desenvolvimento web, sem frameworks ou dependências externas:

- **HTML5**: Estruturação semântica avançada utilizando tags de acessibilidade (`aria-labels`).
- **CSS3**: Layout modular estruturado com Flexbox, variáveis nativas (`:root`) e folhas de estilo exclusivas para impressão física (`@media print`).
- **JavaScript (ES6+)**: Manipulação nativa do DOM, uso de Template Literals, gerenciamento de estado unificado (SSOT), tratamento rígido de fusos horários e criptografia de IDs com `crypto.randomUUID()`.

---

## 📂 Estrutura de Arquivos

```text
├── index.html       # Marcação semântica e esqueleto estrutural limpo
├── style.css        # Identidade visual, variáveis de ambiente e responsividade
└── script.js        # Motor lógico, eventos, manipulação de estado e persistência JSON
```

---

## 🧑‍💻 Boas Práticas de Clean Code Aplicadas

- **Separação de Conceitos (SoC)**: Código modularizado rigidamente em arquivos isolados. Zero estilos (`style=""`) ou scripts (`onclick=""`) inline no HTML.
- **Manipulação Ativa de Eventos**: Utilização exclusiva de `EventListeners` no JavaScript, garantindo um código limpo e de fácil manutenção.
- **Single Source of Truth (SSOT)**: Gerenciamento de dados centralizado em um único array estruturado de objetos, evitando redundância e inconsistência de dados.
- **Persistência Limpa**: Serialização estável de dados utilizando as APIs nativas `JSON.stringify` e `JSON.parse`.

---

## 📦 Como Executar o Projeto Localmente

1. Clone este repositório em sua máquina:
   ```bash
   git clone https://github.com
   ```
2. Navegue até a pasta do projeto.
3. Abra o arquivo `index.html` em qualquer navegador web de sua preferência.
