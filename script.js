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

// 1. Card de Tarefas Pendentes (Sem botão de deletar)
function renderPendingActive() {
    todoList.innerHTML = '';
    pendingTasks.forEach((task, index) => {
        const li = createBaseTaskElement(task, false);
        todoList.appendChild(li);

        // Permite clicar em todo o bloco (texto ou checkbox) para concluir automaticamente
        const contentDiv = li.querySelector('.todo-content');
        contentDiv.addEventListener('click', () => {
            moveToCompleted(index);
        });
    });
}

// 2. Card de Tarefas Concluídas (Com Reload e Deletar)
function renderCompletedActive() {
    completedList.innerHTML = '';
    completedTasks.forEach((task, index) => {
        const li = createBaseTaskElement(task, true);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions';

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

        // Clicar no texto ou checkbox também aciona o reload de volta para pendentes
        const contentDiv = li.querySelector('.todo-content');
        contentDiv.addEventListener('click', () => {
            returnToPending(index, 'completed');
        });

        reloadBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita clique duplo com o container
            returnToPending(index, 'completed');
        });

        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            moveToDeleted(index, 'completed');
        });
    });
}

// 3. Card de Tarefas Excluídas (Com Reload e Deletar Definitivo)
function renderDeletedActive() {
    deletedList.innerHTML = '';
    deletedTasks.forEach((task, index) => {
        const li = createBaseTaskElement(task, true);

        // Remove o checkbox visual para o histórico de excluídas
        const checkbox = li.querySelector('input[type="checkbox"]');
        if (checkbox) checkbox.remove();

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions';

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

        // Eventos dos botões das excluídas
        reloadBtn.addEventListener('click', () => {
            returnToPending(index, 'deleted');
        });

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
    // Desabilita o clique nativo isolado do checkbox para deixar o container gerenciar o clique
    checkbox.style.pointerEvents = 'none'; 

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
    task.dateString = now.toLocaleString('pt-BR');
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
    task.dateString = null; // Zera o carimbo de conclusão ao retornar a pendente
    pendingTasks.push(task);
    renderAll();
}

function moveToDeleted(index, origin) {
    let task;
    if (origin === 'completed') {
        [task] = completedTasks.splice(index, 1);
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
