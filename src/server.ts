// Importando o Express (nosso "garçom") e o Cors (segurança)
import express from 'express';
import cors from 'cors';

// Importando a conexão com o banco que VOCÊ criou no arquivo conexao.ts!
import conexao from './conexao';

const app = express();

// Configurando o servidor para entender JSON e permitir acesso do seu HTML
app.use(cors());
app.use(express.json());

// Definindo a porta onde o servidor vai funcionar
const PORTA = 3000;

// Ligando o servidor
app.listen(PORTA, () => {
    console.log(`🚀 Servidor da JCar rodando em http://localhost:${PORTA}`);
});

// ---------------------------------------------------------
// ROTAS DA APLICAÇÃO (A "cozinha" do nosso restaurante)
// ---------------------------------------------------------

// Rota para CADASTRAR um novo carro
app.post('/carros', (req, res) => {
    // 1. Pegamos os dados que o seu Front-end vai enviar
    const { marca, modelo, ano, preco, cor } = req.body;

    // 2. Montamos o comando SQL para inserir no banco de dados
    const comandoSql = 'INSERT INTO carros (marca, modelo, ano, preco, cor) VALUES (?, ?, ?, ?, ?)';

    // 3. Executamos o comando no MySQL
    conexao.query(comandoSql, [marca, modelo, ano, preco, cor], (erro, resultado) => {
        if (erro) {
            console.error('Erro ao cadastrar carro:', erro);
            // Se der erro, devolvemos o erro para a tela
            return res.status(500).json({ mensagem: 'Erro ao cadastrar o carro no banco de dados.' });
        }

        // Se der certo, avisamos que foi um sucesso!
        res.status(201).json({ mensagem: 'Carro da JCar cadastrado com sucesso! 🚗' });
    });
});
app.get('/carros', (req, res) => {
    const comandoSql = 'SELECT * FROM carros';

    conexao.query(comandoSql, (erro, resultados) => {
        if (erro) {
            console.error('Erro ao buscar os carros da JCar:', erro);
            return res.status(500).json({ mensagem: 'Erro ao buscar os carros no banco.' });
        }
        res.status(200).json(resultados);
    });
});
// ---------------------------------------------------------
// Rota para DELETAR um carro do banco de dados
// ---------------------------------------------------------
// O ":id" na URL é uma variável. Se o front-end mandar /carros/5, o ID será 5.
app.delete('/carros/:id', (req, res) => {
    // 1. Pegamos o número de identificação do carro que veio na URL
    const idDoCarro = req.params.id;

    // 2. Montamos o comando SQL para deletar
    const comandoSql = 'DELETE FROM carros WHERE id = ?';

    // 3. Executamos no banco de dados
    conexao.query(comandoSql, [idDoCarro], (erro, resultados) => {
        if (erro) {
            console.error('❌ Erro ao deletar o carro:', erro);
            return res.status(500).json({ mensagem: 'Erro ao deletar o carro no banco.' });
        }

        // Se deu certo, avisamos a tela!
        res.status(200).json({ mensagem: 'Carro excluído com sucesso!' });
    });
});

// ---------------------------------------------------------
// Rota para ATUALIZAR (Editar) um carro existente
// ---------------------------------------------------------
app.put('/carros/:id', (req, res) => {
    // 1. Pegamos o ID do carro na URL e os dados novos no corpo (body)
    const idDoCarro = req.params.id;
    const { marca, modelo, ano, preco, cor } = req.body;

    // 2. Montamos o comando SQL de atualização (UPDATE)
    const comandoSql = 'UPDATE carros SET marca = ?, modelo = ?, ano = ?, preco = ?, cor = ? WHERE id = ?';

    // 3. Executamos no banco de dados (Atenção à ordem das variáveis!)
    conexao.query(comandoSql, [marca, modelo, ano, preco, cor, idDoCarro], (erro, resultados) => {
        if (erro) {
            console.error('❌ Erro ao atualizar o carro:', erro);
            return res.status(500).json({ mensagem: 'Erro ao atualizar o carro no banco.' });
        }

        res.status(200).json({ mensagem: 'Carro atualizado com sucesso!' });
    });
});