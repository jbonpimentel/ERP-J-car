// ==========================================
// 1. VARIÁVEIS E MEMÓRIA
// ==========================================
const modal = document.getElementById('modalCadastro');
const btnAbrir = document.getElementById('btnAbrirModal');
const btnFechar = document.getElementById('btnFecharModal');
const form = document.getElementById('formCadastrarCarro');

// Nossa "memória" para saber se estamos Criando (null) ou Editando (ID do carro)
let idCarroSendoEditado = null;

// ==========================================
// 2. EVENTOS DE ABRIR E FECHAR O MODAL
// ==========================================
// Abrir modal para NOVO CARRO (Limpa a memória e o formulário)
btnAbrir.onclick = () => {
    idCarroSendoEditado = null;
    form.reset();
    modal.style.display = "flex";
};

// Fechar modal no 'X'
btnFechar.onclick = () => {
    modal.style.display = "none";
};

// ==========================================
// 3. FUNÇÃO PARA PREPARAR A EDIÇÃO (Botão Amarelo)
// ==========================================
function prepararEdicao(id, marca, modelo, ano, preco, cor) {
    idCarroSendoEditado = id; // Anota na memória qual carro vamos editar

    // Preenche os campos do formulário
    document.getElementById('cadMarca').value = marca;
    document.getElementById('cadModelo').value = modelo;
    document.getElementById('cadAno').value = ano;
    document.getElementById('cadPreco').value = preco;
    document.getElementById('cadCor').value = cor;

    // Abre a janelinha
    modal.style.display = "flex";
}

// ==========================================
// 4. FUNÇÃO SALVAR (Cria ou Atualiza)
// ==========================================
form.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    // Empacota os dados digitados
    const pacoteCarro = {
        marca: document.getElementById('cadMarca').value,
        modelo: document.getElementById('cadModelo').value,
        ano: parseInt(document.getElementById('cadAno').value),
        preco: parseFloat(document.getElementById('cadPreco').value),
        cor: document.getElementById('cadCor').value
    };

    try {
        let resposta;

        // É EDIÇÃO? (PUT)
        if (idCarroSendoEditado !== null) {
            resposta = await fetch(`http://localhost:3000/carros/${idCarroSendoEditado}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pacoteCarro)
            });
        }
        // É CRIAÇÃO? (POST)
        else {
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
            idCarroSendoEditado = null; // Limpa a memória por segurança
            carregarCarros(); // Atualiza a tabela na tela
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
        corpoTabela.innerHTML = ''; // Limpa a tabela antes de preencher

        carrosDoBanco.forEach(carro => {
            const linha = document.createElement('tr');

            // Formatando o preço sem o "R$" extra (deixa o CSS cuidar do R$)
            const precoFormatado = Number(carro.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

            linha.innerHTML = `
                <td class="col-img">
                    <img class="Imagem" src="../fotos/logo.png" style="opacity: 0.3;">
                </td>
                <td class="carro" style="font-weight: bold;">${carro.marca}</td>
                <td>${carro.modelo}</td>
                <td>${carro.ano}</td>
                <td>Premium</td>
                <td class="valor">${precoFormatado}</td>
                <td>${carro.cor || '-'}</td>
                
                <td><button onclick="prepararEdicao(${carro.id}, '${carro.marca}', '${carro.modelo}', ${carro.ano}, ${carro.preco}, '${carro.cor}')" style="background:#f59e0b; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;">Editar</button></td>
                
                <td><button onclick="deletarCarro(${carro.id})" style="background:#ef4444; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;">Excluir</button></td>
            `;

            corpoTabela.appendChild(linha);
        });

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

// Quando a página abre, carrega os carros automaticamente
window.onload = carregarCarros;