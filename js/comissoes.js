// js/comissoes.js
(() => {
    // ==========================================
    // 1. VERIFICAR ACESSO (SEGURANÇA DA SPA)
    // ==========================================
    const sessaoComissoes = localStorage.getItem('usuarioLogado');
    let isComissoesAdmin = false;
    let usuarioLogadoComissoes = null;

    if (!sessaoComissoes) {
        window.location.href = "login.html";
        return; // Interrompe se não estiver logado
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
    const btnImprimirPDF = document.getElementById('btnImprimirPDF');
    const btnAbrirFiltrosRelatorio = document.getElementById('btnAbrirFiltrosRelatorio');

    // Elementos do Filtro Avançado
    const painelFiltrosRelatorio = document.getElementById('painelFiltrosRelatorio');
    const btnAplicarFiltroRelatorio = document.getElementById('btnAplicarFiltroRelatorio');
    const inputFiltroRelatorioMes = document.getElementById('filtroRelatorioMes');
    const inputFiltroRelatorioPreco = document.getElementById('filtroRelatorioPreco');

    let todosDadosComissoes = [];

    // ==========================================
    // 3. FUNÇÃO DE SELEÇÃO BLINDADA
    // ==========================================
    function obterVendedorSelecionadoParaBaixa() {
        const checkbox = corpoTabelaComissoes.querySelector('input.check-comissao:checked');
        if (!checkbox) {
            alert("⚠️ Selecione um vendedor na tabela de comissões para realizar a baixa financeira.");
            return null;
        }
        return {
            id: checkbox.value,
            nome: checkbox.getAttribute('data-nome')
        };
    }

    // ==========================================
    // 4. LÓGICA DA TOOLBAR
    // ==========================================

    // --- BUSCA RÁPIDA (TEXTO) ---
    if (inputBuscaComissao) {
        inputBuscaComissao.addEventListener('input', (evento) => {
            const termo = evento.target.value.toLowerCase();
            const filtrados = todosDadosComissoes.filter(item => {
                return item.vendedor.toLowerCase().includes(termo);
            });
            renderizarTabelaComissoes(filtrados);
        });
    }

    // --- DAR BAIXA NA COMISSÃO (ADMIN ONLY) ---
    if (btnPagarToolbar) {
        btnPagarToolbar.addEventListener('click', async () => {
            if (!isComissoesAdmin) {
                alert("🔒 Acesso Negado: Apenas o departamento financeiro/admin pode dar baixa em comissões.");
                return;
            }

            const vendedorSelecionado = obterVendedorSelecionadoParaBaixa();
            if (!vendedorSelecionado) return;

            if (confirm(`Confirmar o pagamento (Baixa Financeira) das comissões pendentes para o vendedor ${vendedorSelecionado.nome}?`)) {
                try {
                    const res = await fetch(`http://localhost:3000/vendedores/${vendedorSelecionado.id}/pagar-comissoes`, { method: 'PUT' });
                    if (res.ok) {
                        alert("✅ Pagamento registrado com sucesso! O sistema atualizará os status.");
                        carregarComissoes(); // Atualiza sem F5
                    } else {
                        alert("❌ Erro ao processar pagamento no servidor.");
                    }
                } catch (erro) {
                    console.error("Erro ao pagar:", erro);
                }
            }
        });
    }

    // --- RECARREGAR ---
    if (btnRecarregarComissoes) {
        btnRecarregarComissoes.addEventListener('click', () => {
            const icone = btnRecarregarComissoes.querySelector('.material-symbols-outlined');
            if (icone) {
                icone.style.transition = "transform 0.5s ease";
                icone.style.transform = "rotate(360deg)";
                setTimeout(() => { icone.style.transform = "rotate(0deg)"; }, 500);
            }
            inputBuscaComissao.value = '';
            carregarComissoes();
        });
    }

    // --- IMPRIMIR PDF ---
    if (btnImprimirPDF) {
        btnImprimirPDF.addEventListener('click', () => {
            const mes = inputFiltroRelatorioMes ? inputFiltroRelatorioMes.value || "Geral" : "Geral";
            const tituloOriginal = document.title;
            // Título dinâmico para o arquivo PDF gerado pelo navegador
            document.title = `Fechamento_Comissoes_JCAR_${mes}`;
            window.print();
            document.title = tituloOriginal;
        });
    }

    // --- FILTROS AVANÇADOS (ABRIR PAINEL) ---
    if (btnAbrirFiltrosRelatorio && painelFiltrosRelatorio) {
        btnAbrirFiltrosRelatorio.addEventListener('click', () => {
            painelFiltrosRelatorio.style.display = painelFiltrosRelatorio.style.display === 'none' || painelFiltrosRelatorio.style.display === '' ? 'flex' : 'none';
        });
    }

    // --- APLICAR FILTRO (BACKEND) ---
    if (btnAplicarFiltroRelatorio) {
        btnAplicarFiltroRelatorio.addEventListener('click', async () => {
            const mes = inputFiltroRelatorioMes.value;
            const precoMin = inputFiltroRelatorioPreco.value;

            // Monta a URL dinamicamente para bater na rota correta do server.ts
            let url = 'http://localhost:3000/comissoes?';
            if (mes) url += `mes=${mes}&`;
            if (precoMin) url += `minPreco=${precoMin}`;

            try {
                const res = await fetch(url);
                const dadosFiltrados = await res.json();

                // Sobrescreve a lista na memória e manda renderizar
                todosDadosComissoes = dadosFiltrados;

                // Se não for admin, garante que veja apenas o dele mesmo após filtrar
                if (!isComissoesAdmin) {
                    todosDadosComissoes = todosDadosComissoes.filter(d => d.vendedor_id === usuarioLogadoComissoes.id);
                }

                renderizarTabelaComissoes(todosDadosComissoes);

                // Opcional: fechar painel após aplicar
                // painelFiltrosRelatorio.style.display = 'none';
            } catch (err) {
                console.error("Erro ao aplicar filtros nas comissões:", err);
            }
        });
    }

    // ==========================================
    // 5. CARREGAR E RENDERIZAR
    // ==========================================
    async function carregarComissoes() {
        try {
            const resposta = await fetch('http://localhost:3000/comissoes');
            let dados = await resposta.json();

            // Monta o Cabeçalho (Igual para todos, pois removemos a coluna de ação manual)
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

            // Esconde botão Pagar para vendedor
            if (!isComissoesAdmin && btnPagarToolbar) {
                btnPagarToolbar.style.display = 'none';
            }

            // Filtra os dados se for vendedor
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
            corpoTabelaComissoes.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px;">Nenhum registro financeiro encontrado para o filtro.</td></tr>`;
        } else {
            lista.forEach(item => {
                const linha = document.createElement('tr');

                const valorComissao = Number(item.comissao_total);
                const totalF = Number(item.total_vendido).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                const comissaoF = valorComissao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

                somaVendido += Number(item.total_vendido);

                let statusVisual = '';
                let checkboxHtml = '';
                let corComissao = '';

                // Regra de Status: Se a comissão for 0, não há o que pagar.
                if (valorComissao === 0 || item.status_pagamento === 'Pago') {
                    statusVisual = '<span class="badge" style="background-color: #10b981;">PAGO ✅</span>';
                    checkboxHtml = '<input type="checkbox" disabled title="Já pago">';
                    corComissao = '#64748b'; // Cinza para mostrar que não há débito
                } else {
                    statusVisual = '<span class="badge" style="background-color: #f59e0b;">PENDENTE</span>';
                    checkboxHtml = isComissoesAdmin
                        ? `<input type="checkbox" class="check-comissao" value="${item.vendedor_id}" data-nome="${item.vendedor}">`
                        : `<input type="checkbox" disabled>`;
                    corComissao = '#10b981'; // Verde (Valor a receber)
                    somaComissoesPendentes += valorComissao; // Atualiza o "Contas a Pagar" do admin
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

        // Atualiza os Cards (O coração do BI)
        if (cardFaturamento) cardFaturamento.textContent = somaVendido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        if (cardComissoesPendentes) cardComissoesPendentes.textContent = somaComissoesPendentes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        // Meta fixa para demonstração (Pode vir do banco futuramente)
        if (cardMetaGeral) cardMetaGeral.textContent = (500000).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    // Inicia
    carregarComissoes();
})();