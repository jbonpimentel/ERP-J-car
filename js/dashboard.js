// js/dashboard.js
(() => {
    let graficosInstanciados = {};

    async function carregarDashboard() {
        try {
            const [resVendas, resCarros, resClientes] = await Promise.all([
                fetch('http://localhost:3000/vendas'),
                fetch('http://localhost:3000/carros'),
                fetch('http://localhost:3000/clientes')
            ]);

            const vendas = await resVendas.json();
            const carros = await resCarros.json();
            const clientes = await resClientes.json();

            // 1. Cálculos de KPIs
            const faturamentoTotal = vendas.reduce((acc, v) => acc + Number(v.valor_total), 0);
            const ticketMedio = vendas.length > 0 ? faturamentoTotal / vendas.length : 0;

            document.getElementById('dashFaturamento').textContent = faturamentoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            document.getElementById('dashTicketMedio').textContent = ticketMedio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            document.getElementById('dashEstoque').textContent = carros.length;
            document.getElementById('dashQtdVendas').textContent = vendas.length;

            // 2. Preparação de Dados para Gráficos
            renderizarGraficoVendas(vendas);
            renderizarGraficoCategorias(vendas);
            renderizarGraficoVendedores(vendas);
            renderizarGraficoEstoque(carros);

        } catch (erro) {
            console.error("Erro ao carregar Dashboard:", erro);
        }
    }

    function criarOuAtualizarGrafico(id, config) {
        if (graficosInstanciados[id]) {
            graficosInstanciados[id].destroy();
        }
        const ctx = document.getElementById(id).getContext('2d');
        graficosInstanciados[id] = new Chart(ctx, config);
    }

    // Gráfico 1: Linha - Evolução Mensal
    function renderizarGraficoVendas(vendas) {
        const ultimas = vendas.slice(-10);
        const labels = ultimas.map(v => new Date(v.data_venda).toLocaleDateString('pt-BR'));
        const dados = ultimas.map(v => v.valor_total);

        criarOuAtualizarGrafico('graficoFaturamento', {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Vendas',
                    data: dados,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.05)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
        });
    }

    // Gráfico 2: Doughnut - Vendas por Categoria
    function renderizarGraficoCategorias(vendas) {
        const categorias = {};
        vendas.forEach(v => {
            const cat = v.categoria || 'SUV'; // SUV como fallback
            categorias[cat] = (categorias[cat] || 0) + 1;
        });

        criarOuAtualizarGrafico('graficoCategorias', {
            type: 'doughnut',
            data: {
                labels: Object.keys(categorias),
                datasets: [{
                    data: Object.values(categorias),
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
                }]
            },
            options: { cutout: '65%', plugins: { legend: { position: 'bottom' } } }
        });
    }

    // Gráfico 3: Bar - Ranking de Vendedores
    function renderizarGraficoVendedores(vendas) {
        const vendedores = {};
        vendas.forEach(v => {
            const nome = v.vendedor_nome || 'Vendedor';
            vendedores[nome] = (vendedores[nome] || 0) + Number(v.valor_total);
        });

        criarOuAtualizarGrafico('graficoVendedores', {
            type: 'bar',
            data: {
                labels: Object.keys(vendedores),
                datasets: [{
                    label: 'Total Faturado',
                    data: Object.values(vendedores),
                    backgroundColor: '#6366f1'
                }]
            },
            options: { indexAxis: 'y', plugins: { legend: { display: false } } }
        });
    }

    // Gráfico 4: Polar Area - Saúde do Estoque por Marca
    function renderizarGraficoEstoque(carros) {
        const marcas = {};
        carros.forEach(c => {
            marcas[c.marca] = (marcas[c.marca] || 0) + 1;
        });

        criarOuAtualizarGrafico('graficoEstoque', {
            type: 'polarArea',
            data: {
                labels: Object.keys(marcas),
                datasets: [{
                    data: Object.values(marcas),
                    backgroundColor: ['#94a3b8', '#334155', '#475569', '#1e293b']
                }]
            },
            options: { plugins: { legend: { position: 'bottom' } } }
        });
    }

    // Eventos da Toolbar
    document.getElementById('btnRecarregarDash').addEventListener('click', () => {
        const icone = document.querySelector('#btnRecarregarDash span');
        icone.style.transform = 'rotate(360deg)';
        setTimeout(() => icone.style.transform = 'rotate(0deg)', 500);
        carregarDashboard();
    });

    document.getElementById('btnImprimirDash').addEventListener('click', () => window.print());

    // Inicialização
    carregarDashboard();
})();