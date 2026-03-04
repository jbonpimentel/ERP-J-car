# 🚗 J-Car ERP 2.0 | Sistema de Gestão Automotiva (Full-Stack)

<p align="center">
  <img src="../fotos/logo.png" alt="Logo J-Car" width="200">
</p>

## 📖 Visão Geral 
O **J-Car ERP 2.0** nasceu como um projeto de estudos em front-end e evoluiu para uma aplicação **Full-Stack** robusta. Ele é um sistema interno projetado para concessionárias, gerenciando desde a entrada do veículo no estoque até o comissionamento do vendedor e o relacionamento pós-venda com o cliente.

O sistema foi construído utilizando arquitetura **SPA (Single Page Application)** no front-end e uma API RESTful no back-end, garantindo alta performance, segurança e uma experiência de usuário (UX) fluida e responsiva (Mobile Ready).

---

## 🚀 Funcionalidades Principais

* **📊 Dashboard de BI (Business Intelligence):** Painel executivo com gráficos dinâmicos (Chart.js) mostrando faturamento, ticket médio, performance de vendedores e saúde do estoque em tempo real.
* **🛒 PDV (Ponto de Venda):** Frente de caixa inteligente que processa a venda, calcula o custo efetivo, dá baixa automática no estoque e atualiza o histórico de compras do cliente.
* **👥 CRM (Carteira de Clientes):** Gestão completa de clientes com histórico de veículos comprados, controle de prospectos vs. compradores e dados de contato.
* **🚘 Controle de Estoque:** Módulo de CRUD completo para adicionar, editar e excluir veículos, com filtros por status (Disponível/Vendido) e categorias.
* **💰 Financeiro e Comissões:** Cálculo automático de comissões (1%) atrelado a metas, com recurso de "Baixa Financeira" exclusivo para administradores.
* **🔐 Gestão de Acessos:** Controle de permissões baseado em perfil (Admin vs. Vendedor), protegendo rotas sensíveis como estorno de vendas e pagamento de comissões.

---

## 🛠️ Stack Tecnológica

**Front-end:**
* HTML5 & CSS3 (Design corporativo, Flexbox/Grid, Responsivo)
* JavaScript (Vanilla JS, Fetch API, Manipulação avançada do DOM)
* Chart.js (Visualização de dados)
* Google Material Symbols (Iconografia)

**Back-end:**
* Node.js (v24)
* TypeScript (Padrão ESM com `tsx`)
* Express.js (Roteamento e API REST)
* CORS (Segurança de requisições cross-origin)

**Banco de Dados:**
* MySQL (Relacional, consultas complexas com `JOIN` e agregações)

---

## ⚙️ Como rodar o projeto localmente

### 1. Banco de Dados
Certifique-se de ter o MySQL rodando na sua máquina e crie o banco `jcarDB`. As credenciais padrão no código são `root` e senha configurada no arquivo de conexão.

### 2. Back-end (Servidor)
Abra o terminal na pasta raiz do projeto e execute:
```bash
# Instale as dependências
npm install

# Inicie o servidor Node com TypeScript
npx tsx src/server.ts