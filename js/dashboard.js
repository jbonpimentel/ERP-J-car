// ==========================================
// 1. CARREGAR DADOS GERAIS DO DASHBOARD
// ==========================================
async function carregarDashboard() {
    try {
        // Dispara as 3 requisições ao mesmo tempo para ser muito mais rápido!
        const [resVendas, resCarros, resClientes] = await Promise.all([
            fetch('http://localhost:3000/vendas'),
            fetch('http://localhost:3000/carros'), // Só traz carros disponíveis (regra que ajustámos)
            fetch('http://localhost:3000/clientes')
        ]);

        const vendas = await resVendas.json();
        const carros = await resCarros.json();
        const clientes = await resClientes.json();

        // ==========================================
        // 2. PREENCHER OS CARDS (KPIs)
        // ==========================================
        const faturamentoTotal = vendas.reduce((acumulador, venda) => acumulador + Number(venda.valor_total), 0);

        document.getElementById('dashFaturamento').textContent = faturamentoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        document.getElementById('dashEstoque').textContent = carros.length;
        document.getElementById('dashClientes').textContent = clientes.length;
        document.getElementById('dashQtdVendas').textContent = vendas.length;

        // ==========================================
        // 3. RENDERIZAR GRÁFICO 1: FATURAMENTO (LINHA)
        // ==========================================
        // Vamos pegar as últimas 7 vendas para mostrar no gráfico (e inverter para a ordem cronológica correta)
        const ultimasVendas = vendas.slice(0, 7).reverse();

        const labelsVendas = ultimasVendas.map(v => new Date(v.data_venda).toLocaleDateString('pt-BR'));
        const dadosVendas = ultimasVendas.map(v => Number(v.valor_total));

        const ctxFaturamento = document.getElementById('graficoFaturamento').getContext('2d');
        new Chart(ctxFaturamento, {
            type: 'line',
            data: {
                labels: labelsVendas, // Datas em baixo
                datasets: [{
                    label: 'Valor da Venda (R$)',
                    data: dadosVendas, // Valores
                    borderColor: '#2563eb', // Azul
                    backgroundColor: 'rgba(37, 99, 235, 0.1)', // Azul transparente
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3 // Deixa a linha curvada e elegante
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } }, // Esconde a legenda para ficar mais limpo
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });

        // ==========================================
        // 4. RENDERIZAR GRÁFICO 2: ESTOQUE POR MARCA (ROSCA)
        // ==========================================
        // Contar quantos carros existem de cada marca
        const contagemMarcas = {};
        carros.forEach(carro => {
            const marca = carro.marca.toUpperCase();
            contagemMarcas[marca] = (contagemMarcas[marca] || 0) + 1;
        });

        const ctxEstoque = document.getElementById('graficoEstoque').getContext('2d');
        new Chart(ctxEstoque, {
            type: 'doughnut',
            data: {
                labels: Object.keys(contagemMarcas), // Ex: TOYOTA, HONDA, BMW
                datasets: [{
                    data: Object.values(contagemMarcas), // Ex: 5, 3, 1
                    backgroundColor: ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                cutout: '70%', // Espessura da rosca
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });

    } catch (erro) {
        console.error("Erro ao desenhar o Dashboard:", erro);
    }
}

// Inicia automaticamente quando a página (SPA) termina de carregar
carregarDashboard();

// Lógica para o botão de impressão do Dashboard
document.getElementById('btnImprimirDash').addEventListener('click', () => {
    const tituloOriginal = document.title;
    document.title = "Relatorio_Dashboard_Financeiro_JCAR";

    window.print(); // Dispara a impressão (PDF)

    document.title = tituloOriginal;
});