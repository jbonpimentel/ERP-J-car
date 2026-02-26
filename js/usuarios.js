// ==========================================
// CARREGAR E EXIBIR USUÁRIOS
// ==========================================
async function carregarUsuarios() {
    try {
        const resposta = await fetch('http://localhost:3000/usuarios');
        const usuarios = await resposta.json();

        const corpoTabela = document.getElementById('corpoTabelaUsuarios');
        corpoTabela.innerHTML = ''; // Limpa antes de desenhar

        usuarios.forEach(usuario => {
            const linha = document.createElement('tr');

            // Formatando a data que vem do banco (ex: 2026-02-26T14:30:00.000Z)
            const dataCriacao = new Date(usuario.criado_em).toLocaleDateString('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });

            linha.innerHTML = `
                <td style="font-weight: bold; color: #2563eb;">#${usuario.id}</td>
                <td style="font-weight: 500;">${usuario.email}</td>
                <td>${dataCriacao}</td>
                <td style="text-align: center;">
                    <button onclick="deletarUsuario(${usuario.id})" 
                        style="background:#ef4444; color:white; border:none; padding:8px 15px; border-radius:5px; cursor:pointer; font-weight: bold; transition: 0.2s;">
                        Revogar Acesso
                    </button>
                </td>
            `;

            corpoTabela.appendChild(linha);
        });

    } catch (erro) {
        console.error('Erro ao carregar usuários:', erro);
        alert('Erro de comunicação com o servidor.');
    }
}

// ==========================================
// EXCLUIR USUÁRIO
// ==========================================
async function deletarUsuario(id) {
    if (confirm("🚨 Tem certeza que deseja excluir este usuário? Ele perderá o acesso ao sistema imediatamente.")) {
        try {
            const resposta = await fetch(`http://localhost:3000/usuarios/${id}`, {
                method: 'DELETE'
            });

            if (resposta.ok) {
                alert('🗑️ Acesso revogado com sucesso!');
                carregarUsuarios(); // Recarrega a tabela na hora
            } else {
                alert('❌ Erro ao excluir usuário.');
            }
        } catch (erro) {
            console.error('Erro:', erro);
            alert('Erro de comunicação com o servidor.');
        }
    }
}

// Inicializa carregando a lista assim que a página abre
window.onload = carregarUsuarios;