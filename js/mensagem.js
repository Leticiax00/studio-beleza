console.log("mensagem.js carregado");
function enviarMensagem() {
    
    const nome = document.querySelector(".contato-nome").value;
    const mensagem = document.querySelector(".contato-msg").value;
    
    if (nome === "" || mensagem === "") {
        alert("Por favor, preencha o seu nome e a mensagem.");
        return;
    }

    const numero = "5584994259168";
    
    const textoMensagem = 
        "NOVO CONTATO PELO SITE" + "\n\n" +
        " Nome: " + nome + "\n" +
        " Mensagem: " + mensagem;

    const url = "https://wa.me/" + numero + "?text=" + encodeURIComponent(textoMensagem);

    window.open(url, "_blank");
}