// ==========================================
// 1. MAPEANDO OS ELEMENTOS DA TELA
// ==========================================
const modalCarro = document.getElementById('modalCarro');
const btnAbrirModalCarro = document.getElementById('btnAbrirModalCarro');
const btnFecharModalCarro = document.getElementById('btnFecharModalCarro');
const btnCancelarModalCarro = document.getElementById('btnCancelarModalCarro');
const btnSalvarCarro = document.getElementById('btnSalvarCarro');
const inputBuscaCarro = document.getElementById('buscaCarro');
const corpoTabelaCarros = document.getElementById('tabelaCarrosBody');

// Botões da Toolbar
const btnEditarCarroToolbar = document.getElementById('btnEditarCarro');
const btnExcluirCarroToolbar = document.getElementById('btnExcluirCarro');
const btnRecarregarCarroToolbar = document.getElementById('btnRecarregarCarro');

let idCarroSendoEditado = null;
let todosOsCarros = [];

// ==========================================
// 2. BUSCA EM TEMPO REAL (Barra Superior)
// ==========================================
inputBuscaCarro.addEventListener('input', (evento) => {
    const termo = evento.target.value.toLowerCase();

    const filtrados = todosOsCarros.filter(carro => {
        const marcaBate = carro.marca.toLowerCase().includes(termo);
        const modeloBate = carro.modelo.toLowerCase().includes(termo);
        const anoBate = carro.ano.toString().includes(termo);
        return marcaBate || modeloBate || anoBate;
    });

    renderizarTabelaCarros(filtrados);
});

// ==========================================
// 3. ABRIR E FECHAR O MODAL
// ==========================================
function limparFormularioCarro() {
    idCarroSendoEditado = null;
    document.getElementById('cadMarca').value = '';
    document.getElementById('cadModelo').value = '';
    document.getElementById('cadAno').value = '';
    document.getElementById('cadPreco').value = '';
    document.getElementById('cadCor').value = '';
    document.getElementById('cadCategoria').value = 'SUV';
}

btnAbrirModalCarro.addEventListener('click', () => {
    limparFormularioCarro();
    modalCarro.style.display = "flex";
});

btnFecharModalCarro.addEventListener('click', () => modalCarro.style.display = "none");
btnCancelarModalCarro.addEventListener('click', () => modalCarro.style.display = "none");

// ==========================================
// 4. LÓGICA DA TOOLBAR (ADICIONAR, EDITAR, VISUALIZAR, EXCLUIR)
// ==========================================

// Função auxiliar para identificar qual veículo está marcado na tabela
function obterIdCarroSelecionado() {
    const checkbox = document.querySelector('.check-carro:checked');
    if (!checkbox) {
        alert("⚠️ Por favor, selecione um veículo na tabela primeiro!");
        return null;
    }
    return checkbox.value;
}

// --- AÇÃO: EDITAR ---
btnEditarCarroToolbar.addEventListener('click', () => {
    const id = obterIdCarroSelecionado();
    if (!id) return;

    const carro = todosOsCarros.find(c => c.id == id);
    if (carro) {
        // Bloqueia edição de carros já vendidos para manter integridade
        if (carro.status === 'Vendido') {
            alert("🔒 Edição bloqueada. Este veículo já foi faturado e não pode ser alterado.");
            return;
        }

        idCarroSendoEditado = carro.id;
        document.getElementById('cadMarca').value = carro.marca;
        document.getElementById('cadModelo').value = carro.modelo;
        document.getElementById('cadAno').value = carro.ano;
        document.getElementById('cadPreco').value = carro.preco;
        document.getElementById('cadCor').value = carro.cor;
        document.getElementById('cadCategoria').value = carro.categoria || 'SUV';

        modalCarro.style.display = "flex";
    }
});

// --- AÇÃO: VISUALIZAR (MODAL DE DETALHES) ---
const btnVisualizarCarroToolbar = document.querySelector('#sec-estoque button[title="Visualizar"]');
if (btnVisualizarCarroToolbar) {
    btnVisualizarCarroToolbar.addEventListener('click', () => {
        const id = obterIdCarroSelecionado();
        if (!id) return;

        const carro = todosOsCarros.find(c => c.id == id);
        if (carro) {
            // Prepara os dados para a função global de visualização
            const dadosParaVisualizar = {
                modelo: `${carro.marca} ${carro.modelo}`,
                placa: carro.placa || "Sem Placa (0km)", // Já preparando para futuros campos
                ano: carro.ano,
                cor: carro.cor || "Não informada",
                km: carro.km || "0 km",
                preco: Number(carro.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
            };

            abrirVisualizacao('estoque', dadosParaVisualizar);
        }
    });
}

// --- AÇÃO: EXCLUIR ---
btnExcluirCarroToolbar.addEventListener('click', async () => {
    const id = obterIdCarroSelecionado();
    if (!id) return;

    if (confirm("⚠️ Tem certeza que deseja excluir este veículo? Essa ação é irreversível.")) {
        try {
            const resposta = await fetch(`http://localhost:3000/carros/${id}`, { method: 'DELETE' });
            if (resposta.ok) {
                alert('🗑️ Veículo removido do sistema com sucesso!');
                carregarCarros(); // Atualiza a tabela sem F5
            } else {
                alert('❌ Erro ao excluir veículo no servidor.');
            }
        } catch (erro) {
            console.error('Erro ao deletar:', erro);
        }
    }
});

// --- AÇÃO: RECARREGAR (REFRESH) ---
btnRecarregarCarroToolbar.addEventListener('click', () => {
    // Feedback visual de carregamento
    const icone = btnRecarregarCarroToolbar.querySelector('.material-symbols-outlined');
    icone.style.transition = "transform 0.5s ease";
    icone.style.transform = "rotate(360deg)";

    inputBuscaCarro.value = ''; // Limpa a barra de busca
    carregarCarros();

    setTimeout(() => { icone.style.transform = "rotate(0deg)"; }, 500);
});

// ==========================================
// 5. SALVAR NO BANCO (POST ou PUT)
// ==========================================
btnSalvarCarro.addEventListener('click', async () => {
    const pacoteCarro = {
        marca: document.getElementById('cadMarca').value,
        modelo: document.getElementById('cadModelo').value,
        ano: parseInt(document.getElementById('cadAno').value),
        categoria: document.getElementById('cadCategoria').value,
        preco: parseFloat(document.getElementById('cadPreco').value),
        cor: document.getElementById('cadCor').value
    };

    if (!pacoteCarro.marca || !pacoteCarro.modelo || !pacoteCarro.preco) {
        alert("⚠️ Marca, Modelo e Preço são obrigatórios.");
        return;
    }

    try {
        let resposta;
        if (idCarroSendoEditado !== null) {
            resposta = await fetch(`http://localhost:3000/carros/${idCarroSendoEditado}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pacoteCarro)
            });
        } else {
            resposta = await fetch('http://localhost:3000/carros', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pacoteCarro)
            });
        }

        if (resposta.ok) {
            modalCarro.style.display = "none";
            limparFormularioCarro();
            carregarCarros();
        } else {
            alert('❌ Erro ao salvar.');
        }
    } catch (erro) {
        console.error('Erro:', erro);
    }
});

// ==========================================
// 6. CARREGAR E RENDERIZAR TABELA
// ==========================================
async function carregarCarros() {
    try {
        const resposta = await fetch('http://localhost:3000/carros');
        todosOsCarros = await resposta.json();
        renderizarTabelaCarros(todosOsCarros);
    } catch (erro) {
        console.error('Erro ao carregar carros:', erro);
    }
}

function renderizarTabelaCarros(lista) {
    corpoTabelaCarros.innerHTML = '';

    if (lista.length === 0) {
        corpoTabelaCarros.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 20px;">Nenhum veículo encontrado.</td></tr>`;
        return;
    }

    lista.forEach(carro => {
        const linha = document.createElement('tr');
        const precoFormatado = Number(carro.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

        // Etiqueta visual do status (idêntica ao seu código antigo, mas menor para caber na tabela densa)
        const statusVisual = carro.status === 'Vendido'
            ? '<span class="badge erro" style="background-color: #ef4444;">VENDIDO</span>'
            : '<span class="badge sucesso" style="background-color: #10b981;">DISPONÍVEL</span>';

        linha.innerHTML = `
            <td class="col-checkbox"><input type="checkbox" class="check-carro" value="${carro.id}"></td>
            <td>${carro.id}</td>
            <td style="font-weight: 500;">${carro.marca} ${carro.modelo}</td>
            <td>${carro.ano}</td>
            <td>${carro.cor || '-'}</td>
            <td>R$ ${precoFormatado}</td>
            <td style="text-align: center;">${statusVisual}</td>
        `;

        corpoTabelaCarros.appendChild(linha);
    });
}

carregarCarros();