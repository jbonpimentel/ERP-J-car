// ==========================================
// 1. VERIFICAR QUEM ESTÁ LOGADO (SEM CONFLITO)
// ==========================================
const sessaoVendas = localStorage.getItem('usuarioLogado');
let isAdmin = false;

if (!sessaoVendas) {
    window.location.href = "login.html";
} else {
    const usuarioVendas = JSON.parse(sessaoVendas);
    if (usuarioVendas.email === 'joao@evoplan.com') {
        isAdmin = true;
    }
}

// ==========================================
// 2. MAPEANDO ELEMENTOS DA TELA
// ==========================================
const cabecalhoHistorico = document.getElementById('cabecalhoTabelaHistorico');
const corpoTabelaHistorico = document.getElementById('tabelaHistoricoBody');
const inputBuscaHistorico = document.getElementById('buscaHistorico');

// Botões Toolbar
const btnEstornarToolbar = document.getElementById('btnEstornarVendaToolbar');
const btnRecarregarHistorico = document.getElementById('btnRecarregarHistorico');

let todasAsVendas = [];

// ==========================================
// 3. BUSCA EM TEMPO REAL
// ==========================================
inputBuscaHistorico.addEventListener('input', (evento) => {
    const termo = evento.target.value.toLowerCase();

    const filtrados = todasAsVendas.filter(venda => {
        const clienteBate = venda.cliente_nome.toLowerCase().includes(termo);
        const veiculoBate = `${venda.marca} ${venda.modelo}`.toLowerCase().includes(termo);
        return clienteBate || veiculoBate;
    });

    renderizarTabelaHistorico(filtrados);
});

// ==========================================
// 4. LÓGICA DA TOOLBAR (ESTORNAR)
// ==========================================
btnEstornarToolbar.addEventListener('click', async () => {
    if (!isAdmin) {
        alert("🔒 Acesso Negado: Apenas administradores podem estornar vendas.");
        return;
    }

    const checkboxSelecionado = document.querySelector('.check-venda:checked');
    if (!checkboxSelecionado) {
        alert("⚠️ Selecione uma venda na tabela para estornar.");
        return;
    }

    const idVenda = checkboxSelecionado.value;

    if (confirm("⚠️ ATENÇÃO: Deseja cancelar esta venda? O carro voltará para o estoque disponível.")) {
        try {
            const res = await fetch(`http://localhost:3000/vendas/${idVenda}`, { method: 'DELETE' });
            if (res.ok) {
                alert("✅ Venda cancelada com sucesso! O veículo retornou ao estoque.");
                carregarVendidos(); // Atualiza a tela
            } else {
                alert("❌ Erro ao estornar a venda.");
            }
        } catch (erro) {
            console.error("Erro:", erro);
            alert("Erro de comunicação com o servidor.");
        }
    }
});

btnRecarregarHistorico.addEventListener('click', () => {
    inputBuscaHistorico.value = '';
    carregarVendidos();
});

// ==========================================
// 5. CARREGAR E RENDERIZAR
// ==========================================
async function carregarVendidos() {
    try {
        const resposta = await fetch('http://localhost:3000/vendas');
        todasAsVendas = await resposta.json();

        // 5.1 Monta o Cabeçalho Baseado no Perfil
        if (isAdmin) {
            cabecalhoHistorico.innerHTML = `
                <tr>
                    <th class="col-checkbox" style="width: 30px;"><input type="checkbox" disabled></th>
                    <th>Data ↕</th>
                    <th>Veículo ↕</th>
                    <th>Cliente ↕</th>
                    <th>Condição ↕</th>
                    <th>Valor Total ↕</th>
                </tr>
            `;
        } else {
            cabecalhoHistorico.innerHTML = `
                <tr>
                    <th class="col-checkbox" style="width: 30px;"><input type="checkbox" disabled></th>
                    <th>Data ↕</th>
                    <th>Veículo ↕</th>
                    <th>Cliente ↕</th>
                </tr>
            `;
            // Esconde o botão de estornar visualmente para vendedores comuns
            btnEstornarToolbar.style.display = 'none';
        }

        renderizarTabelaHistorico(todasAsVendas);

    } catch (erro) {
        console.error('Erro ao carregar vendas:', erro);
    }
}

function renderizarTabelaHistorico(lista) {
    corpoTabelaHistorico.innerHTML = '';

    if (lista.length === 0) {
        const colunasSpan = isAdmin ? 6 : 4;
        corpoTabelaHistorico.innerHTML = `<tr><td colspan="${colunasSpan}" style="text-align: center; padding: 20px;">Nenhuma venda encontrada.</td></tr>`;
        return;
    }

    lista.forEach(venda => {
        const linha = document.createElement('tr');
        const dataVenda = new Date(venda.data_venda).toLocaleDateString('pt-BR');

        if (isAdmin) {
            const valorTotalFormatado = Number(venda.valor_total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            linha.innerHTML = `
                <td class="col-checkbox"><input type="checkbox" class="check-venda" value="${venda.venda_id}"></td>
                <td style="font-weight: 500;">${dataVenda}</td>
                <td>${venda.marca} ${venda.modelo} (${venda.ano})</td>
                <td>${venda.cliente_nome}</td>
                <td style="text-transform: capitalize;">${venda.condicao_pagamento}</td>
                <td style="color: #047857; font-weight: 600;">${valorTotalFormatado}</td>
            `;
        } else {
            linha.innerHTML = `
                <td class="col-checkbox"><input type="checkbox" class="check-venda" value="${venda.venda_id}"></td>
                <td style="font-weight: 500;">${dataVenda}</td>
                <td>${venda.marca} ${venda.modelo} (${venda.ano})</td>
                <td>${venda.cliente_nome}</td>
            `;
        }

        corpoTabelaHistorico.appendChild(linha);
    });
}

// Inicia
carregarVendidos();

// 1. Abrir/Fechar painel de filtros do Histórico
document.getElementById('btnAbrirFiltrosHistorico').addEventListener('click', () => {
    const painel = document.getElementById('painelFiltrosHistorico');
    painel.style.display = painel.style.display === 'none' ? 'flex' : 'none';
});

// 2. Ação de Impressão do Histórico
document.getElementById('btnImprimirHistorico').addEventListener('click', () => {
    const mes = document.getElementById('filtroHistoricoMes').value || "Geral";
    const tituloOriginal = document.title;
    document.title = `Relatorio_Vendas_JCAR_${mes}`;

    window.print();

    document.title = tituloOriginal;
});

// 3. Lógica para Aplicar o Filtro (Enviando para o Backend)
document.getElementById('btnAplicarFiltroHistorico').addEventListener('click', async () => {
    const mes = document.getElementById('filtroHistoricoMes').value;
    const valorMin = document.getElementById('filtroHistoricoValor').value;

    try {
        // Faz a requisição filtrada ao seu server.ts
        const res = await fetch(`http://localhost:3000/vendas?mes=${mes}&valorMin=${valorMin}`);
        const dados = await res.json();

        // Chame a sua função que já existe para popular a tabela de histórico
        // Exemplo: renderizarTabelaHistorico(dados);

        alert("Histórico filtrado com sucesso!");
    } catch (err) {
        console.error("Erro ao filtrar histórico:", err);
    }
});