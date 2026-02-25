// ==========================================
// 1. VARIÁVEIS E MEMÓRIA
// ==========================================
const modal = document.getElementById('modalCadastro');
const btnAbrir = document.getElementById('btnAbrirModal');
const btnFechar = document.getElementById('btnFecharModal');
const form = document.getElementById('formCadastrarCarro');

let idCarroSendoEditado = null;

// ==========================================
// 2. EVENTOS DE ABRIR E FECHAR O MODAL
// ==========================================
btnAbrir.onclick = () => {
    idCarroSendoEditado = null;
    form.reset();
    modal.style.display = "flex";
};

btnFechar.onclick = () => {
    modal.style.display = "none";
};

// ==========================================
// 3. FUNÇÃO PARA PREPARAR A EDIÇÃO (Botão Amarelo)
// ==========================================
function prepararEdicao(id, marca, modelo, ano, preco, cor, categoria) {
    idCarroSendoEditado = id;

    document.getElementById('cadMarca').value = marca;
    document.getElementById('cadModelo').value = modelo;
    document.getElementById('cadAno').value = ano;
    document.getElementById('cadPreco').value = preco;
    document.getElementById('cadCor').value = cor;
    document.getElementById('cadCategoria').value = categoria || 'SUV'; // Adicionado para carregar categoria

    modal.style.display = "flex";
}

// ==========================================
// 4. FUNÇÃO SALVAR (Cria ou Atualiza)
// ==========================================
form.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    // Adicionado "categoria" ao pacote que vai pro banco
    const pacoteCarro = {
        marca: document.getElementById('cadMarca').value,
        modelo: document.getElementById('cadModelo').value,
        ano: parseInt(document.getElementById('cadAno').value),
        categoria: document.getElementById('cadCategoria').value,
        preco: parseFloat(document.getElementById('cadPreco').value),
        cor: document.getElementById('cadCor').value
    };

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
            alert('🎉 Operação realizada com sucesso!');
            modal.style.display = "none";
            form.reset();
            idCarroSendoEditado = null;
            carregarCarros();
            // BUG CORRIGIDO: Removido o appendChild fantasma que quebrava o script aqui.
        } else {
            alert('❌ Ops! Ocorreu um erro.');
        }

    } catch (erro) {
        console.error('Erro de conexão:', erro);
        alert('❌ Erro de comunicação com o servidor.');
    }
});

// ==========================================
// 5. FUNÇÃO PARA BUSCAR E MOSTRAR CARROS
// ==========================================
async function carregarCarros() {
    try {
        const resposta = await fetch('http://localhost:3000/carros');
        const carrosDoBanco = await resposta.json();

        const corpoTabela = document.getElementById('corpoTabelaCarros');
        corpoTabela.innerHTML = '';

        carrosDoBanco.forEach(carro => {
            const linha = document.createElement('tr');

            const precoFormatado = Number(carro.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

            linha.innerHTML = `
                <td class="col-img">
                    <img class="Imagem" src="../fotos/logo.png" style="opacity: 0.3;">
                </td>
                <td class="carro" style="font-weight: bold;">${carro.marca}</td>
                <td>${carro.modelo}</td>
                <td>${carro.ano}</td>
                <td>${carro.categoria || 'Premium'}</td>
                <td class="valor">${precoFormatado}</td>
                <td>${carro.cor || '-'}</td>
                
                <td><button onclick="prepararEdicao(${carro.id}, '${carro.marca}', '${carro.modelo}', ${carro.ano}, ${carro.preco}, '${carro.cor}', '${carro.categoria}')" style="background:#f59e0b; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;">Editar</button></td>
                
                <td><button onclick="deletarCarro(${carro.id})" style="background:#ef4444; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;">Excluir</button></td>
            `;

            corpoTabela.appendChild(linha);
        });

        // Aplica os filtros assim que carrega
        aplicarFiltros();

    } catch (erro) {
        console.error('Erro ao carregar os carros:', erro);
    }
}

// ==========================================
// 6. FUNÇÃO PARA EXCLUIR UM CARRO
// ==========================================
async function deletarCarro(id) {
    const confirmacao = confirm("Tem certeza que deseja excluir este veículo do estoque?");

    if (confirmacao) {
        try {
            const resposta = await fetch(`http://localhost:3000/carros/${id}`, {
                method: 'DELETE'
            });

            if (resposta.ok) {
                alert('🗑️ Veículo excluído com sucesso!');
                carregarCarros();
            } else {
                alert('❌ Erro ao excluir o veículo.');
            }

        } catch (erro) {
            console.error('Erro de conexão:', erro);
            alert('❌ Erro de comunicação com o servidor.');
        }
    }
}

window.onload = carregarCarros;

// ==========================================
// LÓGICA DE FILTROS (Consolidada)
// ==========================================
// BUG CORRIGIDO: Removido o bloco "inputBusca.addEventListener" avulso que brigava com esta função.

function aplicarFiltros() {
    const termoBusca = document.getElementById('inputBusca')?.value.toLowerCase() || "";
    const termoModelo = document.getElementById('filtroModelo')?.value.toLowerCase() || "";
    const termoAno = document.getElementById('filtroAno')?.value || "";
    const faixaPreco = document.getElementById('filtroPreco')?.value || "todos";
    const carroceriaSel = document.getElementById('filtroCarroceria')?.value || "todos";

    const linhas = document.querySelectorAll('#corpoTabelaCarros tr');

    linhas.forEach(linha => {
        const marca = linha.cells[1]?.textContent.toLowerCase() || "";
        const modelo = linha.cells[2]?.textContent.toLowerCase() || "";
        const anoTab = linha.cells[3]?.textContent.trim() || "";
        const catTab = linha.cells[4]?.textContent.trim() || "";

        let precoTexto = linha.cells[5]?.textContent || "0";
        precoTexto = precoTexto.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
        const precoNum = parseFloat(precoTexto);

        const bateBusca = marca.includes(termoBusca) || modelo.includes(termoBusca);
        const bateModelo = modelo.includes(termoModelo);
        const bateAno = termoAno === "" || anoTab.includes(termoAno);
        const bateCat = carroceriaSel === "todos" || catTab === carroceriaSel;

        let batePreco = true;
        if (faixaPreco === "300000") batePreco = precoNum <= 300000;
        else if (faixaPreco === "600000") batePreco = precoNum > 300000 && precoNum <= 600000;
        else if (faixaPreco === "acima") batePreco = precoNum > 600000;

        if (bateBusca && bateModelo && bateAno && batePreco && bateCat) {
            linha.style.display = "";
        } else {
            linha.style.display = "none";
        }
    });
}

// Escutadores unificados e organizados
document.getElementById('inputBusca')?.addEventListener('input', aplicarFiltros);
document.getElementById('filtroModelo')?.addEventListener('input', aplicarFiltros);
document.getElementById('filtroAno')?.addEventListener('input', aplicarFiltros);
document.getElementById('filtroPreco')?.addEventListener('change', aplicarFiltros);
document.getElementById('filtroCarroceria')?.addEventListener('change', aplicarFiltros);