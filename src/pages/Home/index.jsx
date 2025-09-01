import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "../../style.css";


function App() {
  const [produtos, setProdutos] = useState([]);
  const [carrinho, setCarrinho] = useState(() => {
    const carrinhoSalvo = localStorage.getItem("carrinho");
    return carrinhoSalvo ? JSON.parse(carrinhoSalvo) : [];
  });

  const [categoriaFiltro, setCategoriaFiltro] = useState("Todos");
  const [precoFiltro, setPrecoFiltro] = useState("Todos");
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  const carregarProdutos = async () => {
    try {
      const res = await fetch("https://raw.githubusercontent.com/williamqbr/eco-trend-api/refs/heads/main/produtos.json");
      const data = await res.json();
      setProdutos(data);
    } catch (err) {
      console.error("Erro ao carregar produtos:", err);
    }
  };

  carregarProdutos();
}, []);

 
  useEffect(() => {
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
  }, [carrinho]);

  const adicionarAoCarrinho = (produto) => {
    setCarrinho((prev) => [...prev, produto]);
  };

  const removerDoCarrinho = (index) => {
    setCarrinho((prev) => prev.filter((_, i) => i !== index));
  };

  const total = carrinho.reduce((acc, item) => acc + item.preco, 0);

  const produtosFiltrados = produtos.filter((p) => {
    const filtroCategoria = categoriaFiltro === "Todos" || p.categoria === categoriaFiltro;
    const filtroPreco =
      precoFiltro === "Todos" ||
      (precoFiltro === "0-100" && p.preco <= 100) ||
      (precoFiltro === "101-300" && p.preco > 101 && p.preco <= 300) ||
      (precoFiltro === "301-500" && p.preco > 301 && p.preco <= 500) ||
      (precoFiltro === "500+" && p.preco > 500);

    return filtroCategoria && filtroPreco;
  });

  
  const finalizarCompra = () => {
    if (carrinho.length === 0) {
      setMensagem("O carrinho está vazio!");
      return;
    }

    setLoading(true);
    setMensagem("");

    new Promise((resolve, reject) => {
      setTimeout(() => {
        const dadosValidos = true;
        dadosValidos ? resolve() : reject("Erro na validação dos dados.");
      }, 1000);
    })
      .then(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            const pagamentoAprovado = true;
            pagamentoAprovado
              ? resolve("Pedido finalizado com sucesso!")
              : reject("Falha no processamento do pagamento.");
          }, 1500);
        });
      })
      .then((msgSucesso) => {
        setMensagem(msgSucesso);
        setCarrinho([]); // esvazia carrinho
        localStorage.removeItem("carrinho"); 
      })
      .catch((err) => setMensagem(err))
      .finally(() => setLoading(false));
  };

  return (
    <div className="container">
      <header>
        <h1>Eco Trend</h1>
        <p>Os melhores produtos sustentáveis para você!</p>
      </header>

      <section className="filtros">
        <select value={categoriaFiltro} onChange={(e) => setCategoriaFiltro(e.target.value)}>
          <option value="Todos">Todas as Categorias</option>
          <option value="Roupas">Roupas</option>
          <option value="Acessórios">Acessórios</option>
          <option value="Casa">Casa</option>
          <option value="Beleza">Beleza</option>
          <option value="Livros">Livros</option>
        </select>

        <select value={precoFiltro} onChange={(e) => setPrecoFiltro(e.target.value)}>
          <option value="Todos">Todos os preços</option>
          <option value="0-100">Até R$ 100</option>
          <option value="101-300">R$ 101 - R$ 300</option>
          <option value="301-500">R$ 301 - R$ 500</option>
          <option value="500+">Acima de R$ 500</option>
        </select>
      </section>

      <main className="grid">
        <section className="produtos">
          {produtosFiltrados.length === 0 ? (
            <p className="no-results">Nenhum produto encontrado.</p>
          ) : (
            produtosFiltrados.map((produto) => (
              <div className="card" key={produto.id}>
                <img src={produto.imagem} alt={produto.nome} />
                <div className="card-content">
                  <h2>{produto.nome}</h2>
                  <p>{produto.descricao}</p>
                  <p className="preco">
                    R$ {produto.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                  <button
                    className="btn-comprar"
                    onClick={() => adicionarAoCarrinho(produto)}
                  >
                    Adicionar ao Carrinho
                  </button>
                </div>
              </div>
            ))
          )}
        </section>

        <aside className="carrinho">
          <h2>Carrinho</h2>
          {carrinho.length === 0 ? (
            <p>Seu carrinho está vazio.</p>
          ) : (
            <ul>
              {carrinho.map((item, index) => (
                <li key={index}>
                  <div>
                    <p>{item.nome}</p>
                    <span>
                      R$ {item.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <button className="btn-remover" onClick={() => removerDoCarrinho(index)}>
                    Remover
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="total">
            <p>Total: R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
            <button className="btn-finalizar" onClick={finalizarCompra} disabled={loading}>
              {loading ? "Processando..." : "Finalizar Compra"}
            </button>
            {mensagem && <p className="mensagem">{mensagem}</p>}
          </div>
        </aside>
      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

export default App