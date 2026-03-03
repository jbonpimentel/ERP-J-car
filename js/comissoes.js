// ==========================================
// 1. VERIFICAR ACESSO (Váriaveis Únicas)
// ==========================================
const sessaoComissoes = localStorage.getItem('usuarioLogado');
let isComissoesAdmin = false;
let usuarioLogadoComissoes = null;

if (!sessaoComissoes) {
    window.location.href = "login.html";
} else {
    usuarioLogadoComissoes = JSON.parse(sessaoComissoes);
    if (usuarioLogadoComissoes.email === 'joao@evoplan.com') {
        isComissoesAdmin = true;
    }
}

// ==========================================
// 2. MAPEANDO ELEMENTOS DA TELA
// ==========================================
const cabecalhoComissoes = document.querySelector('#sec-comissoes thead');
const corpoTabelaComissoes = document.getElementById('tabelaComissoesBody');

// Cards Superiores
const cardMetaGeral = document.getElementById('cardMetaTotal');
const cardFaturamento = document.getElementById('cardMetaAlcancada');
const cardComissoesPendentes = document.getElementById('cardComissoesPendentes');

// Toolbar
const inputBuscaComissao = document.getElementById('buscaComissao');
const btnPagarToolbar = document.getElementById('btnPagarComissaoToolbar');
const btnRecarregarComissoes = document.getElementById('btnRecarregarComissoes');

let todosDadosComissoes = [];

// ==========================================
// 3. BUSCA EM TEMPO REAL
// ==========================================
inputBuscaComissao.addEventListener('input', (evento) => {
    const termo = evento.target.value.toLowerCase();

    const filtrados = todosDadosComissoes.filter(item => {
        return item.vendedor.toLowerCase().includes(termo);
    });

    renderizarTabelaComissoes(filtrados);
});

// ==========================================
// 4. LÓGICA DA TOOLBAR (DAR BAIXA)
// ==========================================
btnPagarToolbar.addEventListener('click', async () => {
    if (!isComissoesAdmin) {
        alert("🔒 Acesso Negado: Apenas administradores podem dar baixa em comissões.");
        return;
    }

    const checkboxSelecionado = document.querySelector('.check-comissao:checked');
    if (!checkboxSelecionado) {
        alert("⚠️ Selecione um vendedor na tabela para dar baixa nas comissões.");
        return;
    }

    const idVendedor = checkboxSelecionado.value;
    const nomeVendedor = checkboxSelecionado.getAttribute('data-nome');

    if (confirm(`Confirmar o pagamento das comissões pendentes para ${nomeVendedor}?`)) {
        try {
            const res = await fetch(`http://localhost:3000/vendedores/${idVendedor}/pagar-comissoes`, { method: 'PUT' });
            if (res.ok) {
                alert("✅ Pagamento registrado com sucesso!");
                carregarComissoes(); // Atualiza a tela (vai recarregar com status PAGO)
            } else {
                alert("❌ Erro ao processar pagamento.");
            }
        } catch (erro) {
            console.error(erro);
            alert("Erro de conexão com o servidor.");
        }
    }
});

btnRecarregarComissoes.addEventListener('click', () => {
    inputBuscaComissao.value = '';
    carregarComissoes();
});

// ==========================================
// 5. CARREGAR E RENDERIZAR
// ==========================================
async function carregarComissoes() {
    try {
        const resposta = await fetch('http://localhost:3000/comissoes');
        let dados = await resposta.json();

        // 5.1 Monta o Cabeçalho Baseado no Perfil
        if (isComissoesAdmin) {
            cabecalhoComissoes.innerHTML = `
                <tr>
                    <th class="col-checkbox" style="width: 30px;"><input type="checkbox" disabled></th>
                    <th>Vendedor ↕</th>
                    <th style="text-align: center;">Qtd. Vendas ↕</th>
                    <th>Volume Total (R$) ↕</th>
                    <th>Comissão ↕</th>
                    <th style="text-align: center;">Status ↕</th>
                </tr>
            `;
        } else {
            cabecalhoComissoes.innerHTML = `
                <tr>
                    <th class="col-checkbox" style="width: 30px;"><input type="checkbox" disabled></th>
                    <th>Vendedor ↕</th>
                    <th style="text-align: center;">Qtd. Vendas ↕</th>
                    <th>Volume Total (R$) ↕</th>
                    <th>Comissão ↕</th>
                    <th style="text-align: center;">Status ↕</th>
                </tr>
            `;
            btnPagarToolbar.style.display = 'none'; // Esconde botão para vendedor
        }

        // 5.2 Filtra se não for admin
        if (!isComissoesAdmin) {
            dados = dados.filter(d => d.vendedor_id === usuarioLogadoComissoes.id);
        }

        todosDadosComissoes = dados;
        renderizarTabelaComissoes(todosDadosComissoes);

    } catch (erro) {
        console.error("Erro ao carregar comissões:", erro);
    }
}

function renderizarTabelaComissoes(lista) {
    corpoTabelaComissoes.innerHTML = '';

    let somaVendido = 0;
    let somaComissoesPendentes = 0;

    if (lista.length === 0) {
        const colunasSpan = 6;
        corpoTabelaComissoes.innerHTML = `<tr><td colspan="${colunasSpan}" style="text-align: center; padding: 20px;">Nenhuma comissão encontrada.</td></tr>`;
    } else {
        lista.forEach(item => {
            const linha = document.createElement('tr');

            const valorComissao = Number(item.comissao_total);
            const totalF = Number(item.total_vendido).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            const comissaoF = valorComissao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

            somaVendido += Number(item.total_vendido);

            // === A MÁGICA DO STATUS ACONTECE AQUI ===
            let statusVisual = '';
            let checkboxHtml = '';
            let corComissao = '';

            // Se o backend enviar um status_pagamento = 'Pago' OU se a comissão estiver zerada
            if (item.status_pagamento === 'Pago' || valorComissao === 0) {
                statusVisual = '<span class="badge" style="background-color: #10b981;">PAGO ✅</span>';
                checkboxHtml = '<input type="checkbox" disabled title="Já pago">';
                corComissao = '#64748b'; // Cinza para mostrar que não deve mais nada
            } else {
                statusVisual = '<span class="badge" style="background-color: #f59e0b;">PENDENTE</span>';
                // Só deixa o admin selecionar as pendentes
                checkboxHtml = isComissoesAdmin
                    ? `<input type="checkbox" class="check-comissao" value="${item.vendedor_id}" data-nome="${item.vendedor}">`
                    : `<input type="checkbox" disabled>`;
                corComissao = '#10b981'; // Verde forte
                somaComissoesPendentes += valorComissao; // Só soma no Card o que ainda falta pagar
            }

            linha.innerHTML = `
                <td class="col-checkbox">${checkboxHtml}</td>
                <td style="font-weight: 600; color: #1e293b;">${item.vendedor}</td>
                <td style="text-align: center;">${item.qtd_vendas}</td>
                <td>${totalF}</td>
                <td style="color: ${corComissao}; font-weight: bold;">${comissaoF}</td>
                <td style="text-align: center;">${statusVisual}</td>
            `;

            corpoTabelaComissoes.appendChild(linha);
        });
    }

    // 5.3 Atualiza os Cards de Resumo
    cardFaturamento.textContent = somaVendido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    cardComissoesPendentes.textContent = somaComissoesPendentes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const metaDoMes = 500000;
    cardMetaGeral.textContent = metaDoMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Inicia
carregarComissoes();

// 1. Abrir/Fechar painel de filtros
document.getElementById('btnAbrirFiltrosRelatorio').addEventListener('click', () => {
    const painel = document.getElementById('painelFiltrosRelatorio');
    painel.style.display = painel.style.display === 'none' ? 'flex' : 'none';
});

// 2. Ação de Impressão (Gera o PDF do navegador)
document.getElementById('btnImprimirPDF').addEventListener('click', () => {
    const mes = document.getElementById('filtroRelatorioMes').value || "Geral";
    const preco = document.getElementById('filtroRelatorioPreco').value || "0";

    // Altera o título da página temporariamente para o nome do arquivo PDF sair correto
    const tituloOriginal = document.title;
    document.title = `Relatorio_Comissoes_JCAR_${mes}_Acima_R$${preco}`;

    window.print();

    document.title = tituloOriginal;
});

// 3. Lógica de Filtro (Conexão com o Backend)
document.getElementById('btnAplicarFiltroRelatorio').addEventListener('click', async () => {
    const mes = document.getElementById('filtroRelatorioMes').value;
    const precoMin = document.getElementById('filtroRelatorioPreco').value;

    try {
        // Envia os filtros para o seu servidor TypeScript
        const url = `http://localhost:3000/comissoes?mes=${mes}&minPreco=${precoMin}`;
        const res = await fetch(url);
        const dados = await res.json();

        // Chame aqui a sua função que já preenche a tabela
        // Exemplo: atualizarTabelaComissoes(dados);

        console.log("Dados filtrados carregados com sucesso!");
    } catch (err) {
        console.error("Erro ao aplicar filtros:", err);
    }
});