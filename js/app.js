// 1. Verifica Acesso e Boas-Vindas
const usuarioString = localStorage.getItem('usuarioLogado');

if (!usuarioString) {
    window.location.href = "login.html";
} else {
    const usuario = JSON.parse(usuarioString);
    document.getElementById('nomeUsuarioLogado').textContent = usuario.nome || usuario.email;

    if (usuario.email === 'joao@evoplan.com') {
        document.getElementById('btnAdmin').style.display = "flex";
    }
}

// 2. A Mágica de Navegar (SPA)
function mudarTela(idSecaoAlvo, elementoClicado) {
    // Esconde todas as seções
    const todasSecoes = document.querySelectorAll('.secao-tela');
    todasSecoes.forEach(secao => {
        secao.classList.remove('ativa');
    });

    // Remove a cor azul de todos os botões do menu
    const todosItensMenu = document.querySelectorAll('.menu-item');
    todosItensMenu.forEach(item => {
        item.classList.remove('ativo');
    });

    // Mostra apenas a seção clicada
    document.getElementById(idSecaoAlvo).classList.add('ativa');

    // Pinta de azul o botão clicado
    elementoClicado.classList.add('ativo');

    // Atualiza a barra superior (Breadcrumb)
    const nomeDaTela = elementoClicado.textContent.trim().split(' ')[1] || "Dashboard";
    document.getElementById('caminhoTela').textContent = `Home > ${nomeDaTela}`;
}

// 3. Sair do Sistema
document.getElementById('btnSair').addEventListener('click', () => {
    localStorage.removeItem('usuarioLogado');
    window.location.href = "login.html";
});