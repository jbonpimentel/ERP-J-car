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
// ---------------------------------------------------------
// Rota para BUSCAR todos os carros do Estoque (Ignorando os Vendidos)
// ---------------------------------------------------------
app.get('/carros', (req, res) => {
    // 🚨 A Mágica: O WHERE status != 'Vendido' esconde os carros faturados!
    const comandoSql = "SELECT * FROM carros WHERE status != 'Vendido'";

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

// =========================================================
// ROTAS PARA CLIENTES (A nova "cozinha" para os clientes)
// =========================================================

// ---------------------------------------------------------
// Rota para BUSCAR todos os clientes (GET)
// ---------------------------------------------------------
app.get('/clientes', (req, res) => {
    const comandoSql = 'SELECT * FROM clientes';

    conexao.query(comandoSql, (erro, resultados) => {
        if (erro) {
            console.error('Erro ao buscar os clientes da JCar:', erro);
            return res.status(500).json({ mensagem: 'Erro ao buscar os clientes no banco.' });
        }
        res.status(200).json(resultados);
    });
});

// ---------------------------------------------------------
// Rota para CADASTRAR um novo cliente (POST)
// ---------------------------------------------------------
app.post('/clientes', (req, res) => {
    // 1. Pegamos os dados do front-end
    const { nome, documento, data_nascimento, telefone, email, endereco, data_ultima_compra, veiculo_comprado } = req.body;

    // Tratamento rápido: Se a data vier vazia do HTML (""), transformamos em 'null' para o MySQL não reclamar
    const nasc = data_nascimento ? data_nascimento : null;
    const ultimaCompra = data_ultima_compra ? data_ultima_compra : null;

    // 2. Montamos o comando SQL
    const comandoSql = `INSERT INTO clientes (nome, documento, data_nascimento, telefone, email, endereco, data_ultima_compra, veiculo_comprado) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    // 3. Executamos no banco
    conexao.query(comandoSql, [nome, documento, nasc, telefone, email, endereco, ultimaCompra, veiculo_comprado], (erro, resultado) => {
        if (erro) {
            console.error('Erro ao cadastrar cliente:', erro);
            return res.status(500).json({ mensagem: 'Erro ao cadastrar o cliente no banco de dados.' });
        }
        res.status(201).json({ mensagem: 'Cliente JCar cadastrado com sucesso! 👤' });
    });
});

// ---------------------------------------------------------
// Rota para ATUALIZAR (Editar) um cliente existente (PUT)
// ---------------------------------------------------------
app.put('/clientes/:id', (req, res) => {
    // 1. Pegamos o ID na URL e os dados no corpo (body)
    const idDoCliente = req.params.id;
    const { nome, documento, data_nascimento, telefone, email, endereco, data_ultima_compra, veiculo_comprado } = req.body;

    // Tratamento de datas vazias
    const nasc = data_nascimento ? data_nascimento : null;
    const ultimaCompra = data_ultima_compra ? data_ultima_compra : null;

    // 2. Montamos o comando SQL
    const comandoSql = `UPDATE clientes SET nome = ?, documento = ?, data_nascimento = ?, telefone = ?, email = ?, endereco = ?, data_ultima_compra = ?, veiculo_comprado = ? WHERE id = ?`;

    // 3. Executamos no banco
    conexao.query(comandoSql, [nome, documento, nasc, telefone, email, endereco, ultimaCompra, veiculo_comprado, idDoCliente], (erro, resultados) => {
        if (erro) {
            console.error('❌ Erro ao atualizar o cliente:', erro);
            return res.status(500).json({ mensagem: 'Erro ao atualizar o cliente no banco.' });
        }
        res.status(200).json({ mensagem: 'Cliente atualizado com sucesso!' });
    });
});

// ---------------------------------------------------------
// Rota para DELETAR um cliente do banco de dados (DELETE)
// ---------------------------------------------------------
app.delete('/clientes/:id', (req, res) => {
    // 1. Pegamos o ID na URL
    const idDoCliente = req.params.id;

    // 2. Comando SQL
    const comandoSql = 'DELETE FROM clientes WHERE id = ?';

    // 3. Executando no banco
    conexao.query(comandoSql, [idDoCliente], (erro, resultados) => {
        if (erro) {
            console.error('❌ Erro ao deletar o cliente:', erro);
            return res.status(500).json({ mensagem: 'Erro ao deletar o cliente no banco.' });
        }
        res.status(200).json({ mensagem: 'Cliente excluído com sucesso!' });
    });
});


// =========================================================
// ROTAS PARA USUÁRIOS E AUTENTICAÇÃO (Login / Signup)
// =========================================================

// ---------------------------------------------------------
// 1. CRIAR CONTA COM VALIDAÇÃO (POST /signup)
// ---------------------------------------------------------
app.post('/signup', (req, res) => {
    // 🚨 AGORA RECEBEMOS O NOME TAMBÉM
    const { nome, email, password } = req.body;

    if (!nome) return res.status(400).json({ mensagem: 'O nome é obrigatório.' });
    if (!email || !email.includes('@') || !email.includes('.')) return res.status(400).json({ mensagem: 'Formato de e-mail inválido.' });
    if (!password || password.length < 6) return res.status(400).json({ mensagem: 'A senha deve ter no mínimo 6 caracteres.' });

    conexao.query('SELECT * FROM usuarios WHERE email = ?', [email], (erro, resultados: any[]) => {
        if (erro) return res.status(500).json({ mensagem: 'Erro ao consultar o banco.' });
        if (resultados.length > 0) return res.status(400).json({ mensagem: 'Este e-mail já está cadastrado!' });

        // 🚨 INSERE O NOME NO BANCO DE DADOS JUNTO COM O RESTO
        const comandoSql = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';
        conexao.query(comandoSql, [nome, email, password], (erro2) => {
            if (erro2) return res.status(500).json({ mensagem: 'Erro ao criar conta.' });
            res.status(201).json({ mensagem: 'Conta criada com sucesso!' });
        });
    });
});

// ---------------------------------------------------------
// 2. FAZER LOGIN (POST /login)
// ---------------------------------------------------------
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Busca o usuário que tenha esse email e essa senha exata
    const comandoSql = 'SELECT * FROM usuarios WHERE email = ? AND senha = ?';

    conexao.query(comandoSql, [email, password], (erro, resultados: any[]) => {
        if (erro) return res.status(500).json({ mensagem: 'Erro interno no servidor.' });

        if (resultados.length > 0) {
            // Achou o usuário! Login liberado.
            // (Em um sistema real, aqui geraríamos um Token JWT, mas vamos passo a passo)
            res.status(200).json({ mensagem: 'Login aprovado!', usuario: resultados[0] });
        } else {
            // Não achou ou a senha está errada
            res.status(401).json({ mensagem: 'E-mail ou senha incorretos.' });
        }
    });
});

// ---------------------------------------------------------
// 3. LISTAR TODOS OS USUÁRIOS (Para o seu painel de gestão)
// ---------------------------------------------------------
app.get('/usuarios', (req, res) => {
    // 🚨 Adicionámos o "nome" aqui no SELECT
    conexao.query('SELECT id, nome, email, criado_em FROM usuarios', (erro, resultados) => {
        if (erro) return res.status(500).json({ mensagem: 'Erro ao buscar usuários.' });
        res.status(200).json(resultados);
    });
});
// ---------------------------------------------------------
// 4. DELETAR UM USUÁRIO (Para o seu painel de gestão)
// ---------------------------------------------------------
app.delete('/usuarios/:id', (req, res) => {
    const idDoUsuario = req.params.id;
    conexao.query('DELETE FROM usuarios WHERE id = ?', [idDoUsuario], (erro) => {
        if (erro) return res.status(500).json({ mensagem: 'Erro ao deletar usuário.' });
        res.status(200).json({ mensagem: 'Acesso revogado com sucesso!' });
    });
});

// =========================================================
// ROTAS DO MÓDULO DE VENDAS
// =========================================================

// ---------------------------------------------------------
// 1. BUSCAR CLIENTE PELO CPF
// ---------------------------------------------------------
app.get('/clientes/cpf/:cpf', (req, res) => {
    const cpfDoCliente = req.params.cpf;

    // Procura exatamente o cliente que tem esse documento
    conexao.query('SELECT * FROM clientes WHERE documento = ?', [cpfDoCliente], (erro, resultados: any[]) => {
        if (erro) {
            return res.status(500).json({ mensagem: 'Erro ao buscar no banco.' });
        }
        if (resultados.length === 0) {
            return res.status(404).json({ mensagem: 'Cliente não encontrado. Cadastre-o primeiro!' });
        }
        // Se achou, devolve os dados do cliente
        res.status(200).json(resultados[0]);
    });
});

// ---------------------------------------------------------
// 2. BUSCAR APENAS CARROS "DISPONÍVEIS" (Para o select)
// ---------------------------------------------------------
app.get('/carros/disponiveis', (req, res) => {
    // Repare no "WHERE status = 'Disponível'". Não queremos vender carro já vendido!
    conexao.query("SELECT * FROM carros WHERE status = 'Disponível'", (erro, resultados) => {
        if (erro) {
            return res.status(500).json({ mensagem: 'Erro ao buscar o estoque.' });
        }
        res.status(200).json(resultados);
    });
});

// ---------------------------------------------------------
// 3. REGISTRAR A VENDA (ATUALIZADA COM VENDEDOR)
// ---------------------------------------------------------
app.post('/vendas', (req, res) => {
    // Agora recebemos também o vendedor_id vindo do Front-end
    const { cliente_id, carro_id, valor_total, condicao_pagamento, valor_entrada, qtd_parcelas, nome_carro, vendedor_id } = req.body;

    const sqlVenda = `INSERT INTO vendas (cliente_id, carro_id, valor_total, condicao_pagamento, valor_entrada, qtd_parcelas, vendedor_id) 
                      VALUES (?, ?, ?, ?, ?, ?, ?)`;

    conexao.query(sqlVenda, [cliente_id, carro_id, valor_total, condicao_pagamento, valor_entrada, qtd_parcelas, vendedor_id], (erro, resultado) => {
        if (erro) {
            console.error('Erro na venda:', erro);
            return res.status(500).json({ mensagem: 'Erro ao processar a venda.' });
        }

        // Baixa no estoque e atualização do cliente (Mantemos o que já funcionava)
        conexao.query("UPDATE carros SET status = 'Vendido' WHERE id = ?", [carro_id], () => {
            conexao.query("UPDATE clientes SET data_ultima_compra = NOW(), veiculo_comprado = ? WHERE id = ?", [nome_carro, cliente_id], () => {
                res.status(201).json({ mensagem: '🎉 Venda concluída e vendedor comissionado!' });
            });
        });
    });
});

// ---------------------------------------------------------
// 4. HISTÓRICO DE VENDAS (Cruza Dados de 3 Tabelas)
// ---------------------------------------------------------
app.get('/vendas', (req, res) => {
    // O comando JOIN une a tabela VENDAS com CLIENTES e CARROS
    const sql = `
        SELECT 
            v.id AS venda_id,
            v.valor_total,
            v.condicao_pagamento,
            v.valor_entrada,
            v.qtd_parcelas,
            v.data_venda,
            c.nome AS cliente_nome,
            car.marca,
            car.modelo,
            car.ano
        FROM vendas v
        JOIN clientes c ON v.cliente_id = c.id
        JOIN carros car ON v.carro_id = car.id
        ORDER BY v.data_venda DESC
    `;

    conexao.query(sql, (erro, resultados) => {
        if (erro) {
            console.error('Erro ao buscar histórico de vendas:', erro);
            return res.status(500).json({ mensagem: 'Erro ao buscar histórico.' });
        }
        res.status(200).json(resultados);
    });
});

// ---------------------------------------------------------
// 5. MÓDULO FINANCEIRO (COMISSÕES E RELATÓRIO)
// ---------------------------------------------------------
app.get('/comissoes', (req, res) => {
    // 🚨 Nova Consulta (Trás tudo: Pendente e Pago, separando os valores)
    const sql = `
        SELECT 
            u.email AS vendedor,
            u.id AS vendedor_id,
            COUNT(v.id) AS qtd_vendas,
            SUM(v.valor_total) AS total_vendido,
            
            -- Pega o status da última venda ou define se tem pendência
            MAX(v.status_comissao) AS status_pagamento, 
            
            -- Soma SÓ as comissões que ainda estão Pendentes
            SUM(CASE WHEN v.status_comissao = 'Pendente' THEN v.valor_total * 0.01 ELSE 0 END) AS comissao_total,
            
            -- Soma SÓ as comissões que já foram Pagas (Para histórico)
            SUM(CASE WHEN v.status_comissao = 'Pago' THEN v.valor_total * 0.01 ELSE 0 END) AS comissao_paga
            
        FROM usuarios u
        JOIN vendas v ON u.id = v.vendedor_id
        GROUP BY u.id
        ORDER BY total_vendido DESC
    `;

    conexao.query(sql, (erro, resultados) => {
        if (erro) {
            console.error('Erro ao calcular comissões:', erro);
            return res.status(500).json({ mensagem: 'Erro ao calcular comissões.' });
        }
        res.status(200).json(resultados);
    });
});

// ---------------------------------------------------------
// 6. PAGAR COMISSÕES (Dar Baixa em Lote por Vendedor)
// ---------------------------------------------------------
app.put('/vendedores/:id/pagar-comissoes', (req, res) => {
    const vendedorId = req.params.id;
    const sql = "UPDATE vendas SET status_comissao = 'Pago' WHERE vendedor_id = ? AND status_comissao = 'Pendente'";

    conexao.query(sql, [vendedorId], (erro) => {
        if (erro) return res.status(500).json({ mensagem: 'Erro ao processar pagamento.' });
        res.status(200).json({ mensagem: 'Comissões pagas com sucesso! 💸' });
    });
});

// ---------------------------------------------------------
// 7. EXCLUIR/ESTORNAR VENDA (Devolve o carro ao estoque)
// ---------------------------------------------------------
app.delete('/vendas/:id', (req, res) => {
    const idDaVenda = req.params.id;

    // 1. Primeiro, precisamos saber QUAL era o carro dessa venda
    conexao.query('SELECT carro_id FROM vendas WHERE id = ?', [idDaVenda], (erro, resultados: any[]) => {
        if (erro || resultados.length === 0) return res.status(500).json({ mensagem: 'Venda não encontrada.' });

        const idDoCarro = resultados[0].carro_id;

        // 2. Voltamos o status do carro para 'Disponível'
        conexao.query("UPDATE carros SET status = 'Disponível' WHERE id = ?", [idDoCarro], (erroCarro) => {

            // 3. Agora sim, excluímos o registro da venda
            conexao.query('DELETE FROM vendas WHERE id = ?', [idDaVenda], (erroVenda) => {
                if (erroVenda) return res.status(500).json({ mensagem: 'Erro ao deletar venda.' });
                res.status(200).json({ mensagem: 'Venda estornada! O carro voltou ao estoque. 🚗↩️' });
            });
        });
    });
});