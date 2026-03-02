// ==========================================
// 1. VERIFICAR ACESSO ADMIN
// ==========================================
const sessaoAcessos = localStorage.getItem('usuarioLogado');
let isGestorAdmin = false;

if (!sessaoAcessos) {
    window.location.href = "login.html";
} else {
    const usuarioAcessos = JSON.parse(sessaoAcessos);
    if (usuarioAcessos.email === 'joao@evoplan.com') {
        isGestorAdmin = true;
    }
}

// ==========================================
// 2. MAPEANDO ELEMENTOS DA TELA
// ==========================================
const corpoTabelaUsuarios = document.getElementById('tabelaUsuariosBody');
const inputBuscaUsuario = document.getElementById('buscaUsuario');

// Elementos do Modal
const modalUsuario = document.getElementById('modalUsuario');
const btnAbrirModalUsuario = document.getElementById('btnAbrirModalUsuario');
const btnFecharModalUsuario = document.getElementById('btnFecharModalUsuario');
const btnCancelarModalUsuario = document.getElementById('btnCancelarModalUsuario');
const btnSalvarUsuario = document.getElementById('btnSalvarUsuario');

// Botões da Toolbar
const btnExcluirUsuario = document.getElementById('btnExcluirUsuarioToolbar');
const btnRecarregarUsuarios = document.getElementById('btnRecarregarUsuarios');

let todosOsUsuarios = [];

// ==========================================
// 3. BUSCA EM TEMPO REAL
// ==========================================
inputBuscaUsuario.addEventListener('input', (evento) => {
    const termo = evento.target.value.toLowerCase();
    const filtrados = todosOsUsuarios.filter(u => u.email.toLowerCase().includes(termo));
    renderizarTabelaUsuarios(filtrados);
});

// ==========================================
// 4. ABRIR E FECHAR O MODAL
// ==========================================
function limparFormularioUsuario() {
    document.getElementById('cadUsuarioNome').value = '';
    document.getElementById('cadUsuarioEmail').value = '';
    document.getElementById('cadUsuarioSenha').value = '';
}

btnAbrirModalUsuario.addEventListener('click', () => {
    limparFormularioUsuario();
    modalUsuario.style.display = "flex";
});

btnFecharModalUsuario.addEventListener('click', () => modalUsuario.style.display = "none");
btnCancelarModalUsuario.addEventListener('click', () => modalUsuario.style.display = "none");

// ==========================================
// 5. SALVAR NOVO USUÁRIO (POST /signup)
// ==========================================
btnSalvarUsuario.addEventListener('click', async () => {
    const nome = document.getElementById('cadUsuarioNome').value;
    const email = document.getElementById('cadUsuarioEmail').value;
    const senha = document.getElementById('cadUsuarioSenha').value;

    if (!nome || !email || !senha) {
        alert("⚠️ Preencha todos os campos para criar o acesso.");
        return;
    }

    try {
        const pacote = { nome: nome, email: email, password: senha };

        const resposta = await fetch('http://localhost:3000/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pacote)
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            alert('✅ ' + dados.mensagem);
            modalUsuario.style.display = "none";
            limparFormularioUsuario();
            carregarUsuarios(); // Atualiza a tabela
        } else {
            alert('❌ Erro: ' + dados.mensagem);
        }
    } catch (erro) {
        console.error('Erro ao salvar usuário:', erro);
        alert('Erro de comunicação com o servidor.');
    }
});

// ==========================================
// 6. REVOGAR ACESSO (EXCLUIR USUÁRIO)
// ==========================================
btnExcluirUsuario.addEventListener('click', async () => {
    const checkboxSelecionado = document.querySelector('.check-usuario:checked');

    if (!checkboxSelecionado) {
        alert("⚠️ Selecione um usuário na tabela para revogar o acesso.");
        return;
    }

    const idUsuario = checkboxSelecionado.value;
    const emailUsuario = checkboxSelecionado.getAttribute('data-email');

    if (emailUsuario === 'joao@evoplan.com') {
        alert("🛡️ Operação Bloqueada: O usuário administrador principal não pode ser excluído.");
        return;
    }

    if (confirm(`Tem certeza que deseja REVOGAR O ACESSO de ${emailUsuario}? Ele não poderá mais entrar no sistema.`)) {
        try {
            const res = await fetch(`http://localhost:3000/usuarios/${idUsuario}`, { method: 'DELETE' });
            if (res.ok) {
                alert("🗑️ Acesso revogado com sucesso!");
                carregarUsuarios();
            } else {
                alert("❌ Erro ao excluir usuário.");
            }
        } catch (erro) {
            console.error(erro);
        }
    }
});

btnRecarregarUsuarios.addEventListener('click', () => {
    inputBuscaUsuario.value = '';
    carregarUsuarios();
});

// ==========================================
// 7. CARREGAR E RENDERIZAR TABELA
// ==========================================
async function carregarUsuarios() {
    // Se não for admin, nem carrega
    if (!isGestorAdmin) return;

    try {
        const resposta = await fetch('http://localhost:3000/usuarios');
        todosOsUsuarios = await resposta.json();
        renderizarTabelaUsuarios(todosOsUsuarios);
    } catch (erro) {
        console.error("Erro ao carregar usuários:", erro);
    }
}

function renderizarTabelaUsuarios(lista) {
    corpoTabelaUsuarios.innerHTML = '';

    if (lista.length === 0) {
        corpoTabelaUsuarios.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px;">Nenhum usuário encontrado.</td></tr>`;
        return;
    }

    lista.forEach(user => {
        const linha = document.createElement('tr');

        const dataCriacao = user.criado_em ? new Date(user.criado_em).toLocaleDateString('pt-BR') : '---';
        const nivelAcesso = user.email === 'joao@evoplan.com'
            ? '<span class="badge" style="background-color: #6366f1;">ADMINISTRADOR</span>'
            : '<span class="badge" style="background-color: #64748b;">VENDEDOR</span>';

        // O Admin não pode ter a caixinha selecionável para não se excluir sem querer
        const checkboxHtml = user.email === 'joao@evoplan.com'
            ? `<input type="checkbox" disabled title="Protegido">`
            : `<input type="checkbox" class="check-usuario" value="${user.id}" data-email="${user.email}">`;

        linha.innerHTML = `
            <td class="col-checkbox">${checkboxHtml}</td>
            <td>${user.id}</td>
            <td style="font-weight: 500; color: #1e293b;">${user.nome || '---'} <br><span style="font-weight: normal; color: #64748b; font-size: 11px;">${user.email}</span></td>
            <td>${dataCriacao}</td>
            <td style="text-align: center;">${nivelAcesso}</td>
        `;

        corpoTabelaUsuarios.appendChild(linha);
    });
}

// Inicia
carregarUsuarios();