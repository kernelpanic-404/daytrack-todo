# ⏳ Chronos List

Uma aplicação de lista de tarefas (To-Do List) de tela única, moderna, focada no registro cronológico das atividades. O projeto exibe a data atual dinamicamente, carimba os horários de criação e conclusão de cada tarefa e possui persistência de dados local.

## 🚀 Demonstração

Você pode visualizar o projeto em execução aqui: [Link do seu GitHub Pages ou Vercel]

---

## 🎨 Funcionalidades

- **Data Dinâmica**: O cabeçalho exibe automaticamente a data do dia atual.
- **Ciclo de Vida com Carimbo de Hora**: Cada tarefa registra o momento exato em que foi criada e o momento em que foi arquivada.
- **Histórico de Concluídas**: Ao deletar uma tarefa pendente, ela é movida para um card de histórico inferior com estilo riscado.
- **Exclusão Definitiva**: Opção de apagar permanentemente os itens do histórico com um botão de opacidade suavizada.
- **Persistência de Dados**: Integração com o LocalStorage do navegador em formato JSON, garantindo que os dados não sumam ao atualizar a página.
- **Acessibilidade de Teclado**: Envio de novas tarefas habilitado tanto pelo botão quanto pela tecla `Enter`.

---

## 🛠️ Tecnologias Utilizadas

O projeto foi desenvolvido utilizando a tríade fundamental do desenvolvimento web, sem frameworks externos:

- **HTML5**: Estruturação semântica dos cards e formulários.
- **CSS3**: Estilização baseada em componentes visuais limpos e design responsivo.
- **JavaScript (ES6+)**: Manipulação nativa do DOM, gerenciamento de estados (`arrays`), tratamento de objetos de data (`Date`) e armazenamento local (`localStorage`).

---

## 📦 Como Executar o Projeto

1. Clone este repositório em sua máquina:
   ```bash
   git clone https://github.com[seu-usuario]/[nome-do-repositorio].git
   ```
2. Navegue até a pasta do projeto.
3. Abra o arquivo `index.html` em qualquer navegador web de sua preferência.

---

## 📂 Estrutura de Arquivos

```text
├── index.html       # Estrutura esquelética e marcação semântica
├── style.css        # Identidade visual, cards e estados dos botões
└── script.js        # Lógica de renderização, eventos e persistência JSON
```

---

## 🧑‍💻 Boas Práticas Aplicadas

- **Separação de Conceitos (SoC)**: Código modularizado rigidamente em arquivos isolados de HTML, CSS e JS.
- **Manipulação Ativa de Eventos**: Utilização exclusiva de `EventListeners` no JavaScript, mantendo o HTML limpo de atributos de disparo (como `onclick`).
- **Persistência Limpa**: Serialização de dados utilizando as APIs nativas `JSON.stringify` e `JSON.parse`.
