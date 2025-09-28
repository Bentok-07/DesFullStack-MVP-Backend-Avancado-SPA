// src/utils/CarrinhoUtils.js

export function adicionarAoCarrinho(item) {
  const carrinhoAtual = JSON.parse(localStorage.getItem('carrinho')) || [];

  const itemExistente = carrinhoAtual.find(i => i.id === item.id);
  if (itemExistente) {
    alert('Este item já está no carrinho.');
    return;
  }

  // Adiciona o item com a propriedade quantidade: 1
  const novoItem = { ...item, quantidade: 1 };
  const novoCarrinho = [...carrinhoAtual, novoItem];

  localStorage.setItem('carrinho', JSON.stringify(novoCarrinho));
  alert('Item adicionado ao carrinho!');
}
