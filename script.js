// --- Seleção de Elementos do DOM ---
const mainTitle = document.getElementById('mainTitle');
const todoForm = document.getElementById('todoForm');
const todoInput = document.getElementById('todoInput');
const todoList = document.getElementById('todoList');
const completedList = document.getElementById('completedList');
const deletedList = document.getElementById('deletedList');

// --- Estado da Aplicação (3 Arrays lidos do LocalStorage em JSON) ---
let pendingTasks = JSON.parse(localStorage.getItem('pendingTasks')) || [];
let completedTasks = JSON.parse(localStorage.getItem('completedTasks')) || [];
let deletedTasks = JSON.parse(localStorage.getItem('deletedTasks')) || [];

// --- Funções de Armazenamento e Inicialização ---

function updateMainTitleDate() {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR');
    mainTitle.textContent = `Tarefas do dia ${formattedDate}`;
}

function saveToLocalStorage() {
    localStorage.setItem('pendingTasks', JSON.stringify(pendingTasks));
    localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
    localStorage.setItem('deletedTasks', JSON.stringify(deletedTasks));
}

function renderAll() {
    renderPendingActive();
    renderCompletedActive();
    renderDeletedActive();
    saveToLocalStorage();
}

// --- Funções de Renderização Dinâmica ---

// 1. Card de Tarefas Pendentes
function renderPendingActive() {
    todoList.innerHTML = '';
    pendingTasks.forEach((task, index) => {
        // Criamos o elemento base (passando false pois NÃO está concluída)
        const li = createBaseTaskElement(task, false);

        // Criamos o container de ações (apenas Deletar nas pendentes)
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-delete';
        deleteBtn.textContent = 'Deletar';

        actionsDiv.appendChild(deleteBtn);
        li.appendChild(actionsDiv);
        todoList.appendChild(li);

        // EVENTO 1: Clicar no checkbox move AUTOMATICAMENTE para Concluídas
        const checkbox = li.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', () => {
            moveToCompleted(index);
        });

        // EVENTO 2: Clicar em deletar move para Excluídas
        deleteBtn.addEventListener('click', () => {
            moveToDeleted(index, 'pending');
        });
    });
}

// 2. Card de Tarefas Concluídas
function renderCompletedActive() {
    completedList.innerHTML = '';
    completedTasks.forEach((task, index) => {
        // Criamos o elemento base (passando true pois ESTÁ concluída)
        const li = createBaseTaskElement(task, true);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions';

        // Botão de Reload (Resgatar)
        const reloadBtn = document.createElement('button');
        reloadBtn.className = 'btn-reload';
        reloadBtn.textContent = '🔄';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-delete';
        deleteBtn.textContent = 'Deletar';

        actionsDiv.appendChild(reloadBtn);
        actionsDiv.appendChild(deleteBtn);
        li.appendChild(actionsDiv);
        completedList.appendChild(li);

        // EVENTO 1: Desmarcar o checkbox joga de volta para Pendentes
        const checkbox = li.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', () => {
            returnToPending(index, 'completed');
        });

        // EVENTO 2: Botão Reload joga de volta para Pendentes
        reloadBtn.addEventListener('click', () => {
            returnToPending(index, 'completed');
        });

        // EVENTO 3: Botão Deletar envia para o card de Excluídas
        deleteBtn.addEventListener('click', () => {
            moveToDeleted(index, 'completed');
        });
    });
}

// 3. Card de Tarefas Excluídas
function renderDeletedActive() {
    deletedList.innerHTML = '';
    deletedTasks.forEach((task, index) => {
        // Forçamos true para renderizar riscado no histórico
        const li = createBaseTaskElement(task, true);

        // Remove o checkbox do card de excluídos (não faz sentido marcar/desmarcar lá)
        const checkbox = li.querySelector('input[type="checkbox"]');
        if (checkbox) checkbox.remove();

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions';

        // Botão de Reload (Resgatar das excluídas)
        const reloadBtn = document.createElement('button');
        reloadBtn.className = 'btn-reload';
        reloadBtn.textContent = '🔄';

        const finalDeleteBtn = document.createElement('button');
        finalDeleteBtn.className = 'btn-delete';
        finalDeleteBtn.textContent = 'Deletar';

        actionsDiv.appendChild(reloadBtn);
        actionsDiv.appendChild(finalDeleteBtn);
        li.appendChild(actionsDiv);
        deletedList.appendChild(li);

        // EVENTO 1: Botão Reload resgata a tarefa excluída de volta para Pendentes
        reloadBtn.addEventListener('click', () => {
            returnToPending(index, 'deleted');
        });

        // EVENTO 2: Deleta para sempre do sistema
        finalDeleteBtn.addEventListener('click', () => {
            deletePermanently(index);
        });
    });
}

// Auxiliar para gerar a estrutura de texto e checkboxes
function createBaseTaskElement(task, isFinished) {
    const li = document.createElement('li');
    li.className = 'todo-item';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'todo-content';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = isFinished;

    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'task-details';

    const spanText = document.createElement('span');
    spanText.className = 'todo-text';
    spanText.textContent = task.text;

    if (isFinished) {
        spanText.classList.add('completed-text');
    }

    const spanMeta = document.createElement('span');
    spanMeta.className = 'task-meta';
    
    let metaText = `Criada em: ${task.createdAt}`;
    if (task.dateString) {
        metaText += ` | Concluída em: ${task.dateString}`;
    }
    spanMeta.textContent = metaText;

    detailsDiv.appendChild(spanText);
    detailsDiv.appendChild(spanMeta);
    contentDiv.appendChild(checkbox);
    contentDiv.appendChild(detailsDiv);
    li.appendChild(contentDiv);

    return li;
}

// --- Funções de Manipulação dos Arrays ---

function addTask(text) {
    const now = new Date();
    const formattedCreatedDate = now.toLocaleString('pt-BR');

    const newTask = {
        text: text,
        createdAt: formattedCreatedDate,
        dateString: null
    };
    pendingTasks.push(newTask);
    renderAll();
}

function moveToCompleted(index) {
    const now = new Date();
    const [task] = pendingTasks.splice(index, 1);
    task.dateString = now.toLocaleString('pt-BR'); // Adiciona data de conclusão
    completedTasks.push(task);
    renderAll();
}

function returnToPending(index, origin) {
    let task;
    if (origin === 'completed') {
        [task] = completedTasks.splice(index, 1);
    } else if (origin === 'deleted') {
        [task] = deletedTasks.splice(index, 1);
    }
    task.dateString = null; // Remove a data de conclusão ao voltar para pendente
    pendingTasks.push(task);
    renderAll();
}

function moveToDeleted(index, origin) {
    let task;
    if (origin === 'pending') {
        [task] = pendingTasks.splice(index, 1);
    } else if (origin === 'completed') {
        [task] = completedTasks.splice(index, 1);
    }
    
    // Se foi deletada direto de pendentes, carimbamos o horário atual como finalizador
    if (!task.dateString) {
        const now = new Date();
        task.dateString = now.toLocaleString('pt-BR');
    }
    
    deletedTasks.push(task);
    renderAll();
}

function deletePermanently(index) {
    deletedTasks.splice(index, 1);
    renderAll();
}

// --- EventListeners Globais ---
todoForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const taskText = todoInput.value.trim();
    if (taskText !== '') {
        addTask(taskText);
        todoInput.value = '';
        todoInput.focus();
    }
});

// --- Inicialização ---
updateMainTitleDate();
renderAll();
