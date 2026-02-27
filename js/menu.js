// ==========================================
// 1. VERIFICAR ACESSO E EXIBIR BOAS-VINDAS
// ==========================================
const usuarioString = localStorage.getItem('usuarioLogado');

if (!usuarioString) {
    // Se não tiver crachá, expulsa para o login
    window.location.href = "login.html";
} else {
    // Transforma a string de volta em um objeto JavaScript
    const usuario = JSON.parse(usuarioString);

    // Atualiza o subtítulo com o email do usuário
    document.getElementById('boasVindas').textContent = `Bem-vindo(a), ${usuario.email}`;

    // Libera o Módulo de "Gestão de Acessos" apenas para o Admin
    if (usuario.email === 'joao@evoplan.com') {
        // Usa flex para o card não quebrar o layout
        document.getElementById('btnAdmin').style.display = "flex";
    }
}

// ==========================================
// 2. FUNÇÃO DE SAIR (LOGOUT)
// ==========================================
document.getElementById('btnSair').addEventListener('click', () => {
    // Remove o crachá e redireciona
    localStorage.removeItem('usuarioLogado');
    window.location.href = "login.html";
});