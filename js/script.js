function salvarServico() {
  

  let servico =
    document.getElementById("servico").value;

  let kmAtual =
    Number(document.getElementById("kmAtual").value);

  let mediaTroca =
    Number(document.getElementById("mediaTroca").value);

  let foto =
    document.getElementById("fotoServico").files[0];

  let proximaTroca = kmAtual + mediaTroca;

  let lista =
    document.getElementById("listaServicos");

  let leitor = new FileReader();

  leitor.onload = function (e) {

    let cardId = Date.now(); // id único

    lista.innerHTML += `
      <div class="card" id="card-${cardId}">

        <h3>${servico}</h3>

        <p>KM Atual: ${kmAtual}</p>

        <p>Próxima troca: ${proximaTroca} KM</p>

        <img src="${e.target.result}" width="100%" style="margin-top:10px;border-radius:10px;">

        <button onclick="excluirServico(${cardId})"
          style="
            margin-top:10px;
            background:red;
            color:white;
            border:none;
            padding:10px;
            width:100%;
            border-radius:8px;
          ">
          Excluir
        </button>

      </div>
    `;
  };

  if (foto) {
    leitor.readAsDataURL(foto);
  }
}

