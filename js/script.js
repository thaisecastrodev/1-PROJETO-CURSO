// Carregar resumos salvos ao abrir sistema
window.onload = function () {

  const dadosSalvos = localStorage.getItem("resumos");

  if (dadosSalvos) {

    const resumos = JSON.parse(dadosSalvos);

    resumos.forEach(item => {
      criarCard(item.texto, item.categoria);
    });

  }

};

// Função botão
function gerarResumo() {

  const texto = document.getElementById("texto").value;

  const categoria = document.getElementById("categoria").value;

  if (texto.trim() === "") {
    alert("Digite algum conteúdo.");
    return;
  }

  // Criar card visual
  criarCard(texto, categoria);

  // Pegar dados já salvos
  let resumos = JSON.parse(localStorage.getItem("resumos")) || [];

  // Adicionar novo resumo
  resumos.push({
    texto: texto,
    categoria: categoria
  });

  // Salvar novamente
  localStorage.setItem("resumos", JSON.stringify(resumos));

  // Limpar campo
  document.getElementById("texto").value = "";

}

// Função criar card
function criarCard(texto, categoria) {

  const historico = document.getElementById("historico");

  const card = document.createElement("div");

  card.classList.add("card");

  card.innerHTML = `
    <h3>${categoria}</h3>
    <p>${texto}</p>
  `;

  historico.appendChild(card);

}