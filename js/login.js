const email = document.getElementById("email");
const password = document.getElementById("password");
const form = document.querySelector("form");
const erro = document.querySelector(".erro");

form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    erro.style.display = "none";

    try {
        // Pede permissão para o Backend
        const resposta = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email.value,
                password: password.value
            })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            // Salva o "crachá" do usuário logado no navegador
            localStorage.setItem('usuarioLogado', JSON.stringify(dados.usuario));

            // Redireciona para o menu
            window.location.href = "menu.html";
        } else {
            // Backend bloqueou (senha errada ou não existe)
            erro.textContent = dados.mensagem;
            erro.style.display = "block";
        }
    } catch (error) {
        erro.textContent = "Erro de conexão com o servidor.";
        erro.style.display = "block";
    }
});