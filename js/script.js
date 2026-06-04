/* 
    ==========================================
    LOJA ONLINE - JAVASCRIPT (LÓGICA)
    ==========================================
    Este arquivo contém toda a lógica da aplicação:
    - Gerenciar produtos com ESTOQUE
    - Gerenciar carrinho com FRETE
    - Sistema de ALERTAS de reposição
    - Salvar dados no navegador (localStorage)
    ========================================== 
*/

/* ========== VARIÁVEIS GLOBAIS ========== */
// Array que armazena todos os produtos cadastrados
let produtos = [];
// Array que armazena os itens no carrinho
let carrinho = [];
// Variável para armazenar o frete selecionado
let freteTotal = 0;

/* 
    Evento que dispara quando a página termina de carregar
    Executa funções de inicialização
*/
document.addEventListener('DOMContentLoaded', function() {
    carregarProdutos(); // Carrega produtos salvos do localStorage
    carregarCarrinho(); // Carrega carrinho salvo
    renderizarProdutos(); // Exibe os produtos na tela
    atualizarCarrinho(); // Atualiza o carrinho
    verificarAlertas(); // Verifica alertas de estoque baixo
    configurarOpcaoEntrega(); // Configurar opção de entrega padrão
});

/* ==================== FUNÇÕES PARA GERENCIAR PRODUTOS ==================== */

/**
 * Função para adicionar um novo produto
 * Captura os dados do formulário, valida, cria o produto e salva
 * @param {Event} event - Evento do formulário
*/
function adicionarProduto(event) {
    // Evita o comportamento padrão de recarregar a página
    event.preventDefault();

    /* Obter valores do formulário HTML */
    const nome = document.getElementById('product-name').value.trim();
    const preco = parseFloat(document.getElementById('product-price').value);
    const descricao = document.getElementById('product-description').value.trim();
    const estoque = parseInt(document.getElementById('product-stock').value);
    const alerta = parseInt(document.getElementById('product-alert').value);
    const frete = parseFloat(document.getElementById('product-shipping').value);

    /* Validação: Verificar se todos os campos foram preenchidos */
    if (!nome || !preco || !descricao || estoque < 0 || alerta < 0 || frete < 0) {
        alert('Por favor, preencha todos os campos corretamente!');
        return;
    }

    /* Criar objeto do novo produto */
    const novoProduto = {
        id: Date.now(), // ID único baseado no tempo
        nome: nome,
        preco: preco,
        descricao: descricao,
        estoque: estoque, // Quantidade total em estoque
        alerta: alerta, // Quantidade mínima de alerta
        frete: frete, // Valor do frete deste produto
        data: new Date().toLocaleDateString('pt-BR')
    };

    /* Adicionar produto ao array */
    produtos.push(novoProduto);

    /* Salvar array no localStorage */
    salvarProdutos();

    /* Limpar os campos do formulário */
    document.querySelector('form').reset();

    /* Re-renderizar a lista de produtos */
    renderizarProdutos();

    /* Verificar alertas de estoque */
    verificarAlertas();

    /* Mostrar mensagem de sucesso */
    alert('✅ Produto adicionado com sucesso!');
}

/**
 * Função para exibir os produtos na tela
 * Cria cards HTML para cada produto e insere no DOM
*/
function renderizarProdutos() {
    const grid = document.getElementById('products-grid');

    if (produtos.length === 0) {
        grid.innerHTML = '<p class="empty-message">Nenhum produto cadastrado ainda. Adicione um acima!</p>';
        return;
    }

    grid.innerHTML = produtos.map(produto => {
        // Determinar se o estoque está baixo
        const estoqueAlto = produto.estoque > produto.alerta;
        const statusEstoque = estoqueAlto 
            ? `<div class="stock-available">✅ Em estoque (${produto.estoque} un.)</div>`
            : `<div class="stock-alert">⚠️ Estoque baixo! (${produto.estoque} un.)</div>`;

        // Determinar se pode adicionar ao carrinho
        const podeAdicionar = produto.estoque > 0;
        const botaoCarrinho = podeAdicionar
            ? `<button class="btn-add-cart" onclick="adicionarAoCarrinho(${produto.id})">🛒 Adicionar ao Carrinho</button>`
            : `<button class="btn-add-cart" style="background: #ccc; cursor: not-allowed;" disabled>❌ Fora de Estoque</button>`;

        return `
            <div class="product-card">
                <div class="product-header">
                    <div class="product-name">${produto.nome}</div>
                    <div class="product-price">R$ ${produto.preco.toFixed(2)}</div>
                </div>
                <div class="product-body">
                    <p class="product-description">${produto.descricao}</p>
                    ${statusEstoque}
                    <p style="font-size: 0.85em; color: #999; margin-bottom: 10px;">📅 ${produto.data}</p>
                    <p style="font-size: 0.85em; color: #667eea; margin-bottom: 15px;">🚚 Frete: R$ ${produto.freteKm.toFixed(2)}/km</p>
                    <div class="product-actions">
                        ${botaoCarrinho}
                        <button class="btn-delete" onclick="deletarProduto(${produto.id})">🗑️</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Função para deletar um produto
 * Pede confirmação do usuário antes de remover
 * @param {Number} id - ID do produto a deletar
*/
function deletarProduto(id) {
    if (confirm('Tem certeza que deseja deletar este produto?')) {
        produtos = produtos.filter(p => p.id !== id);
        salvarProdutos();
        renderizarProdutos();
        verificarAlertas(); // Atualizar alertas
        alert('✅ Produto deletado com sucesso!');
    }
}

/* ==================== FUNÇÕES PARA VERIFICAR ESTOQUE E ALERTAS ==================== */

/**
 * Função para verificar produtos com estoque baixo
 * Mostra um botão de alerta se houver produtos que precisam reposição
*/
function verificarAlertas() {
    // Filtrar produtos com estoque abaixo do alerta
    const produtosAlerta = produtos.filter(p => p.estoque <= p.alerta);
    
    // Mostrar ou esconder botão de alerta no header
    const botaoAlerta = document.getElementById('alert-header-btn');
    const contadorAlerta = document.getElementById('alert-count');
    
    if (produtosAlerta.length > 0) {
        botaoAlerta.style.display = 'inline-block';
        contadorAlerta.textContent = produtosAlerta.length;
    } else {
        botaoAlerta.style.display = 'none';
    }
}

/**
 * Função para abrir o modal de alertas de reposição
*/
function abrirAlertaReposicao() {
    const produtosAlerta = produtos.filter(p => p.estoque <= p.alerta);
    const alertDiv = document.getElementById('alert-items');
    
    if (produtosAlerta.length === 0) {
        alertDiv.innerHTML = '<p class="empty-message">Todos os produtos têm estoque adequado!</p>';
    } else {
        alertDiv.innerHTML = produtosAlerta.map(produto => `
            <div class="alert-item">
                <h4>⚠️ ${produto.nome}</h4>
                <p><strong>Estoque atual:</strong> ${produto.estoque} unidades</p>
                <p><strong>Estoque mínimo:</strong> ${produto.alerta} unidades</p>
                <p><strong>Preço unitário:</strong> R$ ${produto.preco.toFixed(2)}</p>
                <p style="color: #d9534f; margin-top: 10px;"><strong>⚡ Ação recomendada:</strong> Fazer pedido de reposição!</p>
            </div>
        `).join('');
    }
    
    document.getElementById('alert-modal').classList.add('active');
}

/**
 * Função para fechar o modal de alertas
*/
function fecharAlertaReposicao() {
    document.getElementById('alert-modal').classList.remove('active');
}

/* ==================== FUNÇÕES PARA GERENCIAR CARRINHO ==================== */

/**
 * Função para adicionar um produto ao carrinho
 * Se o produto já está no carrinho, aumenta a quantidade
 * Subtrai do estoque do produto
 * @param {Number} id - ID do produto
*/
function adicionarAoCarrinho(id) {
    const produto = produtos.find(p => p.id === id);

    if (!produto) return;

    // Verificar se há estoque disponível
    if (produto.estoque <= 0) {
        alert('❌ Produto fora de estoque!');
        return;
    }

    // Verificar se este produto já está no carrinho
    const itemExistente = carrinho.find(item => item.id === id);

    if (itemExistente) {
        // Se existe, aumentar quantidade (mas verificar estoque)
        if (itemExistente.quantidade >= produto.estoque) {
            alert('❌ Quantidade máxima atingida! Não há mais estoque.');
            return;
        }
        itemExistente.quantidade++;
    } else {
        // Se não existe, adicionar novo item
        carrinho.push({
            id: produto.id,
            nome: produto.nome,
            preco: produto.preco,
            freteKm: produto.freteKm,
            quantidade: 1,
            descricao: produto.descricao
        });
    }

    // SUBTRAIR DO ESTOQUE DO PRODUTO
    produto.estoque--;

    // Salvar mudanças
    salvarCarrinho();
    salvarProdutos();
    atualizarCarrinho();
    renderizarProdutos(); // Atualizar visual dos cards
    verificarAlertas(); // Verificar se atingiu alerta mínimo
    
    alert('✅ Produto adicionado ao carrinho!');
}

/**
 * Função para exibir os itens do carrinho na tela
*/
function renderizarCarrinho() {
    const carrinhoDiv = document.getElementById('cart-items');

    if (carrinho.length === 0) {
        carrinhoDiv.innerHTML = '<p class="empty-message">Seu carrinho está vazio</p>';
        return;
    }

    carrinhoDiv.innerHTML = carrinho.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${item.nome}</h4>
                <p>Quantidade: ${item.quantidade}</p>
                <p>Frete: R$ ${item.freteKm.toFixed(2)}/km</p>
            </div>
            <div class="cart-item-price">
                R$ ${(item.preco * item.quantidade).toFixed(2)}
            </div>
            <button class="cart-item-remove" onclick="removerDoCarrinho(${item.id})">
                ✕
            </button>
        </div>
    `).join('');
}

/**
 * Função para remover um item do carrinho
 * DEVOLVE o item para o estoque do produto
 * @param {Number} id - ID do item a remover
*/
function removerDoCarrinho(id) {
    const item = carrinho.find(item => item.id === id);
    const produto = produtos.find(p => p.id === id);
    
    if (item && produto) {
        // DEVOLVER à estoque
        produto.estoque += item.quantidade;
    }
    
    carrinho = carrinho.filter(item => item.id !== id);
    salvarCarrinho();
    salvarProdutos();
    atualizarCarrinho();
    renderizarProdutos();
}

/**
 * Função para atualizar a exibição do carrinho
 * Atualiza contador, itens, total de preço e frete
*/
function atualizarCarrinho() {
    // Calcular total de itens
    const total = carrinho.reduce((sum, item) => sum + item.quantidade, 0);
    document.getElementById('cart-count').textContent = total;

    // Renderizar itens
    renderizarCarrinho();

    // Calcular subtotal (sem frete)
    const subtotal = carrinho.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
    document.getElementById('cart-subtotal').textContent = `R$ ${subtotal.toFixed(2)}`;

    // O frete vem da opção selecionada
    document.getElementById('cart-shipping').textContent = `R$ ${freteTotal.toFixed(2)}`;

    // Calcular total final (subtotal + frete)
    const totalFinal = subtotal + freteTotal;
    document.getElementById('cart-total').textContent = `R$ ${totalFinal.toFixed(2)}`;
}

/**
 * Função para limpar todos os itens do carrinho
 * DEVOLVE todos os itens para o estoque
*/
function limparCarrinho() {
    if (confirm('Tem certeza que deseja limpar o carrinho?')) {
        // Devolver produtos ao estoque
        carrinho.forEach(item => {
            const produto = produtos.find(p => p.id === item.id);
            if (produto) {
                produto.estoque += item.quantidade;
            }
        });
        
        carrinho = [];
        freteTotal = 0;
        salvarCarrinho();
        salvarProdutos();
        atualizarCarrinho();
        renderizarProdutos();
        alert('✅ Carrinho limpo!');
    }
}

/**
 * Função para finalizar a compra
 * Mostra resumo e limpa o carrinho
*/
function finalizarCompra() {
    if (carrinho.length === 0) {
        alert('❌ Seu carrinho está vazio!');
        return;
    }

    const subtotal = carrinho.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
    const total = subtotal + freteTotal;

    const mensagem = `
✅ COMPRA REALIZADA COM SUCESSO!

📦 Itens comprados:
${carrinho.map(item => `- ${item.nome} (x${item.quantidade}): R$ ${(item.preco * item.quantidade).toFixed(2)}`).join('\n')}

💰 Subtotal: R$ ${subtotal.toFixed(2)}
🚚 Frete: R$ ${freteTotal.toFixed(2)}
————————————————
📊 Total: R$ ${total.toFixed(2)}

Obrigado pela compra! 🎉
    `;

    alert(mensagem);

    // Limpar carrinho após compra
    carrinho = [];
    freteTotal = 0;
    salvarCarrinho();
    atualizarCarrinho();
    toggleCart(); // Fechar modal
}

/**
 * Função para abrir/fechar o modal do carrinho
*/
function toggleCart() {
    const modal = document.getElementById('cart-modal');
    modal.classList.toggle('active');
}

/* ==================== FUNÇÕES PARA CÁLCULO DE ENTREGA ==================== */

/**
 * Função para configurar as opções de entrega
*/
function configurarOpcaoEntrega() {
    const radios = document.querySelectorAll('input[name="shipping-type"]');
    radios.forEach(radio => {
        radio.addEventListener('change', atualizarOpcaoEntrega);
    });
    // Atualizar com opção padrão
    atualizarOpcaoEntrega();
}

/**
 * Função para atualizar a opção de entrega selecionada
*/
function atualizarOpcaoEntrega() {
    const distanceInput = document.getElementById('distance-input');
    const cepInput = document.getElementById('cep-input');
    const tipoEntrega = document.querySelector('input[name="shipping-type"]:checked').value;

    if (tipoEntrega === 'cep') {
        // Mostrar campo de CEP
        distanceInput.style.display = 'none';
        cepInput.style.display = 'flex';
        freteTotal = 0; // Resetar frete até calcular
    } else {
        // Mostrar campo de distância (KM) - opção padrão
        cepInput.style.display = 'none';
        distanceInput.style.display = 'flex';
        freteTotal = 0; // Resetar frete até calcular
    }

    atualizarCarrinho();
}

/**
 * Função para calcular o frete baseado na distância em KM
 * Usa o valor por KM cadastrado no produto multiplicado pela distância
*/
function calcularFretePorDistancia() {
    const distanceField = document.getElementById('distance-field');
    const distancia = parseFloat(distanceField.value);

    if (isNaN(distancia) || distancia <= 0) {
        alert('❌ Digite uma distância válida em KM!');
        return;
    }

    if (carrinho.length === 0) {
        alert('❌ Adicione itens ao carrinho primeiro!');
        return;
    }

    // Calcular frete: pega o valor por KM do primeiro item e multiplica pela distância
    // Você pode customizar para calcular de todas as formas diferentes se quiser
    const valorKm = carrinho[0].freteKm;
    freteTotal = valorKm * distancia;

    alert(`✅ Frete calculado!\n\nDistância: ${distancia} km\nValor por KM: R$ ${valorKm.toFixed(2)}\nFrete Total: R$ ${freteTotal.toFixed(2)}`);
    
    // Atualizar carrinho com novo frete
    atualizarCarrinho();
    distanceField.value = ''; // Limpar campo
}

/**
 * Função para calcular o frete baseado no CEP
 * Simula cálculo: quanto maior o número, maior o frete
*/
function calcularFretePorCEP() {
    const cepField = document.getElementById('cep-field');
    const cep = cepField.value.replace(/\D/g, ''); // Remove caracteres não numéricos

    if (cep.length !== 8) {
        alert('❌ CEP inválido! Digite 8 dígitos.');
        return;
    }

    // SIMULAÇÃO DE CÁLCULO DE FRETE POR CEP
    // Quanto maior o CEP, maior o frete (exemplo simulado)
    const cepNum = parseInt(cep);
    const freteBase = 15.00;
    const freteAdicional = (cepNum % 10) * 2; // Varia de 0 a 18 reais
    
    freteTotal = freteBase + freteAdicional;

    alert(`✅ Frete calculado!\n\nCEP: ${cep}\nFrete: R$ ${freteTotal.toFixed(2)}`);
    
    // Atualizar carrinho com novo frete
    atualizarCarrinho();
    cepField.value = ''; // Limpar campo
}

/* ==================== FUNÇÕES PARA GERENCIAR DADOS (localStorage) ==================== */

/**
 * Função para salvar produtos no navegador
*/
function salvarProdutos() {
    localStorage.setItem('produtos', JSON.stringify(produtos));
}

/**
 * Função para carregar produtos salvos do navegador
*/
function carregarProdutos() {
    const dados = localStorage.getItem('produtos');
    produtos = dados ? JSON.parse(dados) : [];
}

/**
 * Função para salvar carrinho no navegador
*/
function salvarCarrinho() {
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
}

/**
 * Função para carregar carrinho salvo do navegador
*/
function carregarCarrinho() {
    const dados = localStorage.getItem('carrinho');
    carrinho = dados ? JSON.parse(dados) : [];
}
