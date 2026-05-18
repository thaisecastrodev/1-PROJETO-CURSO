function gerarResumo() {

  // Pegando texto
  const texto = document.getElementById("texto").value;

  // Pegando categoria
  const categoria = document.getElementById("categoria").value;

  // Área do histórico
  const historico = document.getElementById("historico");

  // Verificação simples
  if (texto.trim() === "") {
    alert("Digite algum conteúdo.");
    return;
  }

  // Criando card
  const card = document.createElement("div");

  // Classe CSS
  card.classList.add("card");

  // Conteúdo do card
  card.innerHTML = `
    <h3>${categoria}</h3>
    <p>${texto}</p>
  `;

  // Adicionando card na tela
  historico.appendChild(card);

  // Limpando textarea
  document.getElementById("texto").value = "";

}