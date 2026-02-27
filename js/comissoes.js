// ==========================================
// 1. VERIFICAR ACESSO
// ==========================================
const usuarioString = localStorage.getItem('usuarioLogado');
if (!usuarioString) {
    window.location.href = "login.html";
}
const logado = JSON.parse(usuarioString);
const isAdmin = logado.email === 'joao@evoplan.com';

// ==========================================
// 2. CARREGAR DADOS DE COMISSÃO
// ==========================================
async function carregarComissoes() {
    try {
        const resposta = await fetch('http://localhost:3000/comissoes');
        let dados = await resposta.json();

        const cabecalho = document.querySelector('thead tr');
        const corpo = document.getElementById('corpoTabelaComissoes');
        const resumoVendido = document.getElementById('resumoTotalVendido');
        const resumoComissao = document.getElementById('resumoComissao');
        const titulo = document.getElementById('tituloPagina');

        corpo.innerHTML = '';

        // SE FOR ADMIN, ADICIONA A COLUNA DE AÇÃO NO CABEÇALHO
        if (isAdmin) {
            cabecalho.innerHTML = `
                <th style="border-top-left-radius: 8px;">Vendedor</th>
                <th>Qtd. Vendas</th>
                <th>Volume Total (R$)</th>
                <th>Comissão a Receber</th>
                <th style="border-top-right-radius: 8px; text-align: center;">Ação</th>
            `;
        }

        // SE NÃO FOR ADMIN, FILTRA E MOSTRA SÓ O DELE
        if (!isAdmin) {
            dados = dados.filter(d => d.vendedor_id === logado.id);
            titulo.textContent = "Minhas Comissões";
        } else {
            titulo.textContent = "Ranking Geral de Comissões (Admin)";
        }

        let somaVendido = 0;
        let somaComissao = 0;

        dados.forEach(item => {
            const linha = document.createElement('tr');

            const totalF = Number(item.total_vendido).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            const comissaoF = Number(item.comissao_total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

            somaVendido += Number(item.total_vendido);
            somaComissao += Number(item.comissao_total);

            // CRIA O BOTÃO VERDE SE FOR ADMIN
            let colunaAcao = isAdmin
                ? `<td style="text-align: center;">
                    <button onclick="pagarVendedor(${item.vendedor_id}, '${item.vendedor}')" 
                            style="background:#10b981; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; font-weight:bold;">
                        Dar Baixa
                    </button>
                   </td>`
                : '';

            linha.innerHTML = `
                <td style="font-weight: bold; color: #1f2937;">${item.vendedor}</td>
                <td style="text-align: center;">${item.qtd_vendas}</td>
                <td>${totalF}</td>
                <td style="color: #10b981; font-weight: bold;">${comissaoF}</td>
                ${colunaAcao}
            `;
            corpo.appendChild(linha);
        });

        // Atualiza os cards de resumo
        resumoVendido.textContent = somaVendido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        resumoComissao.textContent = somaComissao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    } catch (erro) {
        console.error("Erro ao carregar comissões:", erro);
    }
}

// ==========================================
// 3. FUNÇÃO PARA DAR BAIXA (CHAMA A NOVA ROTA)
// ==========================================
async function pagarVendedor(id, nome) {
    if (confirm(`Confirmar o pagamento das comissões para ${nome}? Isso zerará o relatório de pendências dele.`)) {
        try {
            const res = await fetch(`http://localhost:3000/vendedores/${id}/pagar-comissoes`, { method: 'PUT' });
            if (res.ok) {
                alert("✅ Pagamento registrado com sucesso!");
                carregarComissoes(); // 🔄 Recarrega a tabela e limpa quem já foi pago
            } else {
                alert("❌ Erro ao processar pagamento.");
            }
        } catch (erro) {
            console.error(erro);
        }
    }
}

window.onload = carregarComissoes;