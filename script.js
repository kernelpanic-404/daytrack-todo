const mainTitle = document.getElementById('mainTitle');
const todoForm = document.getElementById('todoForm');
const todoInput = document.getElementById('todoInput');

const editModal = document.getElementById('editModal');
const closeEditModal = document.getElementById('closeEditModal');
const editTaskTitle = document.getElementById('editTaskTitle');
const modalSubtaskInput = document.getElementById('modalSubtaskInput');
const btnModalSubtaskAdd = document.getElementById('btnModalSubtaskAdd');
const modalSubtasksList = document.getElementById('modalSubtasksList');
const btnSaveModalChanges = document.getElementById('btnSaveModalChanges');

const pdfModal = document.getElementById('pdfModal');
const closePdfModalBtn = document.getElementById('closePdfModal');
const pdfStartDate = document.getElementById('pdfStartDate');
const pdfEndDate = document.getElementById('pdfEndDate');
const pdfModalAlert = document.getElementById('pdfModalAlert');
const btnExportPDF = document.getElementById('btnExportPDF');
const btnProcessPdfExport = document.getElementById('btnProcessPdfExport');

const containers = {
    pending: document.getElementById('todoList'),
    completed: document.getElementById('completedList'),
    deleted: document.getElementById('deletedList')
};

let tasks = JSON.parse(localStorage.getItem('todo_tasks')) || [];
let currentEditingTaskId = null;
let currentModalSubtasks = [];

function updateMainTitleDate() {
    mainTitle.textContent = `Tarefas do dia ${new Date().toLocaleDateString('pt-BR')}`;
}

function openPdfModal() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedToday = `${year}-${month}-${day}`;

    pdfStartDate.value = formattedToday;
    pdfEndDate.value = formattedToday;
    pdfModalAlert.style.display = 'none';
    pdfModal.style.display = 'flex';
}

function closePdfModal() {
    pdfModal.style.display = 'none';
    todoInput.focus();
}

/**
 * Converte strings de data prevenindo distorções causadas por fusos horários locais, 
 * fixando a avaliação no marco do início do dia civil (00:00:00).
 */
function parseInputDate(dateStr) {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split('-');
    return new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10), 0, 0, 0, 0);
}

// CORREÇÃO: Acessa os índices corretos do array parts ([2]=ano, [1]=mês, [0]=dia)
function parseBrDate(dateStr) {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10), 0, 0, 0, 0);
}

function processPdfExport() {
    let completedTasks = tasks.filter(task => task.status === 'completed');
    if (completedTasks.length === 0) {
        showPdfAlert('Não há tarefas concluídas cadastradas no sistema.');
        return;
    }

    const startLimit = parseInputDate(pdfStartDate.value);
    const endLimit = parseInputDate(pdfEndDate.value);
    let periodTitle = "Período Total";

    if (startLimit || endLimit) {
        completedTasks = completedTasks.filter(task => {
            const taskDate = parseBrDate(task.createdAtDate);
            if (!taskDate) return false;
            
            // Avaliação precisa baseada em marcos de milissegundos limpos
            if (startLimit && taskDate.getTime() < startLimit.getTime()) return false;
            if (endLimit && taskDate.getTime() > endLimit.getTime()) return false;
            return true;
        });

        const format = d => d.split('-').reverse().join('/');
        if (pdfStartDate.value && pdfEndDate.value) periodTitle = `De ${format(pdfStartDate.value)} até ${format(pdfEndDate.value)}`;
        else if (pdfStartDate.value) periodTitle = `A partir de ${format(pdfStartDate.value)}`;
        else if (pdfEndDate.value) periodTitle = `Até ${format(pdfEndDate.value)}`;
    }

    if (completedTasks.length === 0) {
        showPdfAlert('Nenhuma tarefa encontrada para o intervalo selecionado.');
        return;
    }

    pdfModalAlert.style.display = 'none';
    closePdfModal();
    generatePdfWindow(completedTasks, periodTitle);
}

function showPdfAlert(msg) {
    pdfModalAlert.textContent = msg;
    pdfModalAlert.style.display = 'block';
}


function generatePdfWindow(completedTasks, periodTitle) {
    const printWindow = window.open('', '_blank');
    let htmlContent = `
        <html>
        <head>
            <title>Relatório de Tarefas</title>
            <style>
                @page {
                    size: A4;
                    margin: 20mm 15mm 25mm 15mm; /* Margem inferior de 25mm garante o respiro para o rodapé */
                }
                
                html, body {
                    margin: 0;
                    padding: 0;
                    font-family: Arial, sans-serif;
                    color: #333;
                    height: 100%;
                }

                /* A estrutura de tabela força o Chrome a calcular as quebras de folha perfeitamente */
                table {
                    width: 100%;
                    border-collapse: collapse;
                }

                h1 { border-bottom: 2px solid #006400; color: #006400; padding-bottom: 8px; font-size: 22px; margin: 0 0 2px 0; }
                .period { font-size: 13px; color: #666; font-style: italic; margin-bottom: 20px; }
                
                .task-item { 
                    margin-bottom: 15px; 
                    padding: 10px; 
                    border-bottom: 1px solid #eee; 
                    break-inside: avoid;
                    page-break-inside: avoid;
                }
                .task-title { font-weight: bold; font-size: 16px; }
                .task-meta { font-size: 12px; color: #666; margin-top: 4px; }
                .subtasks { margin-left: 20px; margin-top: 5px; list-style-type: square; font-size: 14px; }
                
                /* MOTOR DE IMPRESSÃO: Fixa o rodapé do documento na base da folha */
                .footer-container {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    text-align: center;
                }

                .pdf-footer { 
                    text-align: center; 
                    font-size: 14px; 
                    width: 100%;
                    background-color: white;
                }
                
                .signature-line { 
                    margin: 0 auto 8px auto; 
                    width: 300px; 
                    border-bottom: 1px solid #333; 
                }
                .signature-title { 
                    font-weight: bold; 
                    color: #444; 
                }
                .footer-date { 
                    font-size: 11px; 
                    color: #777; 
                    margin-top: 15px; 
                }

                /* Técnica CSS oculta: Exibe o contêiner de assinatura apenas na última página real */
                .print-footer-space {
                    height: 120px;
                }
            </style>
        </head>
        <body>
            <!-- Usando a arquitetura de tabelas para controle nativo de quebra de páginas em PDFs -->
            <table>
                <tbody>
                    <tr>
                        <td>
                            <h1>✔ Relatório de Tarefas Concluídas</h1>
                            <div class="period">Filtrado por: ${periodTitle}</div>
                            
                            <div class="tasks-container">
    `;

    completedTasks.forEach(task => {
        htmlContent += `
                                <div class="task-item">
                                    <div class="task-title">[X] ${task.text}</div>
                                    <div class="task-meta">Criada em: ${task.createdAtDate} | Concluída em: ${task.completedAt}</div>
        `;
        if (task.subtasks && task.subtasks.length > 0) {
            htmlContent += '<ul class="subtasks">';
            task.subtasks.forEach(sub => { htmlContent += `<li>${sub.text} (Concluída)</li>`; });
            htmlContent += '</ul>';
        }
        htmlContent += '</div>';
    });

    htmlContent += `
                            </div> <!-- Fim do tasks-container -->
                            
                            <!-- Cria um espaçador invisível no fluxo para a assinatura não cobrir o texto da última folha -->
                            <div class="print-footer-space"></div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- O elemento flutuante fixo é empurrado pela mola do spacer no final de todas as páginas -->
            <div class="footer-container">
                <div class="pdf-footer">
                    <div class="signature-line"></div>
                    <div class="signature-title">Assinatura do Técnico</div>
                    <div class="footer-date">Documento emitido em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
            </div>
        </body>
        </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
}








function generateTaskHTML(task, status) {
    const isCompletedOrDeleted = status !== 'pending';
    const showCheckbox = status !== 'deleted';
    const metaText = `Criada em: ${task.createdAtDate} às ${task.createdAtTime}${task.completedAt ? ` | Concluída em: ${task.completedAt}` : ''}`;

    let progressHTML = '';
    if (task.subtasks && task.subtasks.length > 0) {
        const completedCount = task.subtasks.filter(s => s.done).length;
        const percentage = Math.round((completedCount / task.subtasks.length) * 100);
        progressHTML = `
            <div class="progress-container">
                <div class="progress-bar-bg"><div class="progress-bar-fill" style="width: ${percentage}%"></div></div>
                <span class="progress-text">${percentage}%</span>
            </div>
        `;
    }

    const subtasksHTML = task.subtasks && task.subtasks.length > 0 
        ? `<div class="subtasks-container">
            ${task.subtasks.map(sub => `
                <label class="subtask-item">
                    <input type="checkbox" ${sub.done ? 'checked' : ''} ${status === 'deleted' ? 'disabled' : ''} data-task-id="${task.id}" data-sub-id="${sub.id}" class="subtask-checkbox">
                    <span class="${sub.done ? 'completed-text' : ''}">${sub.text}</span>
                </label>
            `).join('')}
           </div>`
        : '';

    return `
        <li class="todo-item" data-id="${task.id}">
            <div class="task-main-row">
                <div class="todo-content" data-id="${task.id}" data-status="${status}">
                    ${showCheckbox ? `<input type="checkbox" ${isCompletedOrDeleted ? 'checked' : ''}>` : ''}
                    <div class="task-details">
                        <span class="todo-text ${isCompletedOrDeleted ? 'completed-text' : ''}">${task.text}</span>
                        ${progressHTML}
                        <span class="task-meta">${metaText}</span>
                    </div>
                </div>
                <div class="task-actions">
                    ${status === 'pending' ? `<button class="btn btn-small btn-edit" data-id="${task.id}">✏️</button>` : ''}
                    ${isCompletedOrDeleted ? `
                        <button class="btn btn-small btn-reload" data-id="${task.id}">🔄</button>
                        <button class="btn btn-small btn-delete" data-id="${task.id}" data-status="${status}">Deletar</button>
                    ` : ''}
                </div>
            </div>
            ${subtasksHTML}
        </li>
    `;
}

function render() {
    localStorage.setItem('todo_tasks', JSON.stringify(tasks));
    const todayStr = new Date().toLocaleDateString('pt-BR');

    const pendingTasks = tasks.filter(task => task.status === 'pending');
    const olderTasks = pendingTasks.filter(task => task.createdAtDate !== todayStr);
    const todayTasks = pendingTasks.filter(task => task.createdAtDate === todayStr);

    let pendingHTML = '';
    if (olderTasks.length > 0) {
        pendingHTML += `<div class="date-group-title">De dias anteriores:</div>`;
        pendingHTML += olderTasks.map(t => generateTaskHTML(t, 'pending')).join('');
    }
    if (todayTasks.length > 0) {
        pendingHTML += `<div class="date-group-title today">Hoje:</div>`;
        pendingHTML += todayTasks.map(t => generateTaskHTML(t, 'pending')).join('');
    }
    containers.pending.innerHTML = pendingHTML;

    ['completed', 'deleted'].forEach(status => {
        containers[status].innerHTML = tasks
            .filter(task => task.status === status)
            .map(t => generateTaskHTML(t, status))
            .join('');
    });

    bindDynamicEvents();
}

function addTask(text) {
    const now = new Date();
    tasks.push({
        id: crypto.randomUUID(),
        text,
        status: 'pending',
        createdAtDate: now.toLocaleDateString('pt-BR'),
        createdAtTime: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        completedAt: null,
        subtasks: []
    });
    render();
}

function handleMainTaskClick(id, currentStatus) {
    if (currentStatus === 'deleted') return;
    const targetStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    changeStatus(id, targetStatus);
}

function toggleSubtask(taskId, subtaskId) {
    tasks = tasks.map(task => {
        if (task.id === taskId) {
            task.subtasks = task.subtasks.map(sub => sub.id === subtaskId ? { ...sub, done: !sub.done } : sub);
            const allDone = task.subtasks.every(sub => sub.done);
            task.status = allDone ? 'completed' : 'pending';
            task.completedAt = allDone ? new Date().toLocaleString('pt-BR') : null;
        }
        return task;
    });
    render();
}

function changeStatus(id, newStatus) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            task.status = newStatus;
            task.completedAt = newStatus === 'completed' ? new Date().toLocaleString('pt-BR') : null;
            task.subtasks = task.subtasks.map(s => ({ ...s, done: newStatus === 'completed' }));
        }
        return task;
    });
    render();
}

function deletePermanently(id) {
    tasks = tasks.filter(task => task.id !== id);
    render();
}

function openEditModal(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    currentEditingTaskId = id;
    editTaskTitle.value = task.text;
    currentModalSubtasks = task.subtasks ? [...task.subtasks] : [];
    renderModalSubtasks();
    editModal.style.display = 'flex';
    setTimeout(() => modalSubtaskInput.focus(), 50);
}

function closeModal() { 
    editModal.style.display = 'none'; 
    currentEditingTaskId = null; 
    todoInput.focus(); 
}

function addSubtaskFromModal() {
    const text = modalSubtaskInput.value.trim();
    if (text) {
        currentModalSubtasks.push({ id: crypto.randomUUID(), text, done: false });
        modalSubtaskInput.value = '';
        modalSubtaskInput.focus();
        renderModalSubtasks();
    }
}

function removeSubtask(subId) {
    currentModalSubtasks = currentModalSubtasks.filter(sub => sub.id !== subId);
    renderModalSubtasks();
}

function renderModalSubtasks() {
    modalSubtasksList.innerHTML = currentModalSubtasks.map(sub => `
        <li class="modal-subtask-item">
            <span>${sub.text}</span>
            <button type="button" class="btn-remove-sub" data-sub-id="${sub.id}">Excluir</button>
        </li>
    `).join('');
    
    modalSubtasksList.querySelectorAll('.btn-remove-sub').forEach(btn => {
        btn.addEventListener('click', () => removeSubtask(btn.getAttribute('data-sub-id')));
    });
}

function saveModalChanges() {
    const newTitle = editTaskTitle.value.trim();
    if (!newTitle) return;
    tasks = tasks.map(task => {
        if (task.id === currentEditingTaskId) {
            task.text = newTitle;
            task.subtasks = [...currentModalSubtasks];
            if (task.subtasks.length > 0) {
                const allDone = task.subtasks.every(s => s.done);
                task.status = allDone ? 'completed' : 'pending';
                if (!allDone) task.completedAt = null;
            }
        }
        return task;
    });
    closeModal();
    render();
}

function bindDynamicEvents() {
    document.querySelectorAll('.todo-content').forEach(el => {
        el.addEventListener('click', () => handleMainTaskClick(el.getAttribute('data-id'), el.getAttribute('data-status')));
    });
    document.querySelectorAll('.btn-edit').forEach(el => {
        el.addEventListener('click', (e) => { e.stopPropagation(); openEditModal(el.getAttribute('data-id')); });
    });
    document.querySelectorAll('.btn-reload').forEach(el => {
        el.addEventListener('click', (e) => { e.stopPropagation(); changeStatus(el.getAttribute('data-id'), 'pending'); });
    });
    document.querySelectorAll('.btn-delete').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = el.getAttribute('data-id');
            el.getAttribute('data-status') === 'deleted' ? deletePermanently(id) : changeStatus(id, 'deleted');
        });
    });
    document.querySelectorAll('.subtask-checkbox').forEach(el => {
        el.addEventListener('change', (e) => {
            e.stopPropagation();
            toggleSubtask(el.getAttribute('data-task-id'), el.getAttribute('data-sub-id'));
        });
    });
}

todoForm.addEventListener('submit', (e) => { e.preventDefault(); const txt = todoInput.value.trim(); if (txt) { addTask(txt); todoInput.value = ''; todoInput.focus(); } });
modalSubtaskInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addSubtaskFromModal(); } });
btnModalSubtaskAdd.addEventListener('click', addSubtaskFromModal);
btnSaveModalChanges.addEventListener('click', saveModalChanges);
btnExportPDF.addEventListener('click', openPdfModal);
btnProcessPdfExport.addEventListener('click', processPdfExport);
closeEditModal.addEventListener('click', closeModal);
closePdfModalBtn.addEventListener('click', closePdfModal);

window.addEventListener('click', (e) => {
    if (e.target === editModal) closeModal();
    if (e.target === pdfModal) closePdfModal();
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (editModal.style.display === 'flex') closeModal();
        if (pdfModal.style.display === 'flex') closePdfModal();
    }
});

updateMainTitleDate();
render();
todoInput.focus();

