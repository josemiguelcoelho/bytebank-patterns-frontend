import { useEffect, useState } from "react";
import "./App.css";


type Conta = {
  id: number;
  titular: string;
  saldo: number;
};


type Operacao = "DEPOSITAR" | "SACAR";


type Movimentacao = {
  id: number;
  tipo: Operacao;
  valor: number;
  dataHora: string;
};


type Pagina = "visao-geral" | "conta" | "operacoes";


type UsuarioLogado = {
  id: number;
  nome: string;
  email: string;
  contaId: number;
  token: string;
};


function App() {
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(null);

  const [modoAuth, setModoAuth] = useState<
    "login" | "cadastro" | "esqueci-senha" | "redefinir-senha"
  >("login");


  // Recuperação de senha
  const [emailRecuperacao, setEmailRecuperacao] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState("");
  const [tokenRecuperacao, setTokenRecuperacao] = useState("");
  const [mensagemRecuperacao, setMensagemRecuperacao] = useState("");
  const [erroRecuperacao, setErroRecuperacao] = useState("");
  const [carregandoRecuperacao, setCarregandoRecuperacao] =
    useState(false);


  // Cadastro
  const [nomeCadastro, setNomeCadastro] = useState("");
  const [emailCadastro, setEmailCadastro] = useState("");
  const [senhaCadastro, setSenhaCadastro] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erroCadastro, setErroCadastro] = useState("");
  const [carregandoCadastro, setCarregandoCadastro] =
    useState(false);


  // Login
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erroLogin, setErroLogin] = useState("");
  const [carregandoLogin, setCarregandoLogin] = useState(false);


  // Conta
  const [conta, setConta] = useState<Conta | null>(null);
  const [movimentacoes, setMovimentacoes] =
    useState<Movimentacao[]>([]);
  const [pagina, setPagina] =
    useState<Pagina>("visao-geral");


  // Operações
  const [valor, setValor] = useState("");
  const [operacao, setOperacao] =
    useState<Operacao | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);


  const buscarConta = async (contaId: number) => {
    setCarregando(true);

    try {
      const response = await fetch(
        `https://bytebank-patterns-backend.onrender.com/contas/${contaId}`,
        {
          headers: {
            Authorization: `Bearer ${usuario?.token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Não foi possível carregar a conta."
        );
      }

      const data = await response.json();
      setConta(data);
    } catch {
      setMensagem(
        "Não foi possível conectar ao ByteBank."
      );
    } finally {
      setCarregando(false);
    }
  };


  const buscarMovimentacoes = async (
    contaId: number
  ) => {
    try {
      const response = await fetch(
        `https://bytebank-patterns-backend.onrender.com/contas/${contaId}/movimentacoes`,
        {
          headers: {
            Authorization: `Bearer ${usuario?.token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Não foi possível carregar as movimentações."
        );
      }

      const data = await response.json();
      setMovimentacoes(data);
    } catch {
      setMensagem(
        "Não foi possível carregar as movimentações."
      );
    }
  };


  useEffect(() => {
    if (!usuario) {
      return;
    }

    buscarConta(usuario.contaId);
    buscarMovimentacoes(usuario.contaId);
  }, [usuario]);


  useEffect(() => {
    const parametros =
      new URLSearchParams(window.location.search);

    const token =
      parametros.get("resetToken");

    if (token) {
      setTokenRecuperacao(token);
      setModoAuth("redefinir-senha");
    }
  }, []);


  const fazerLogin = async () => {
    if (!email.trim() || !senha) {
      setErroLogin(
        "Preencha seu e-mail e sua senha."
      );
      return;
    }

    setCarregandoLogin(true);
    setErroLogin("");

    try {
      const response = await fetch(
        "https://bytebank-patterns-backend.onrender.com/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            senha,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.erro ||
            "E-mail ou senha inválidos."
        );
      }

      setUsuario(data);
      setSenha("");
    } catch (error) {
      if (error instanceof Error) {
        setErroLogin(error.message);
      }
    } finally {
      setCarregandoLogin(false);
    }
  };


  const fazerCadastro = async () => {
    if (
      !nomeCadastro.trim() ||
      !emailCadastro.trim() ||
      !senhaCadastro ||
      !confirmarSenha
    ) {
      setErroCadastro(
        "Preencha todos os campos."
      );
      return;
    }

    if (senhaCadastro !== confirmarSenha) {
      setErroCadastro(
        "As senhas não coincidem."
      );
      return;
    }

    if (senhaCadastro.length < 8) {
      setErroCadastro(
        "A senha deve ter pelo menos 8 caracteres."
      );
      return;
    }

    setCarregandoCadastro(true);
    setErroCadastro("");

    try {
      const response = await fetch(
        "https://bytebank-patterns-backend.onrender.com/auth/cadastro",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome: nomeCadastro,
            email: emailCadastro,
            senha: senhaCadastro,
            confirmarSenha,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.erro ||
            "Não foi possível criar sua conta."
        );
      }

      setEmail(
        emailCadastro.trim().toLowerCase()
      );

      setNomeCadastro("");
      setEmailCadastro("");
      setSenhaCadastro("");
      setConfirmarSenha("");

      setModoAuth("login");

      setErroLogin(
        "Conta criada com sucesso. Agora entre com sua senha."
      );
    } catch (error) {
      if (error instanceof Error) {
        setErroCadastro(error.message);
      }
    } finally {
      setCarregandoCadastro(false);
    }
  };


  const solicitarRecuperacaoSenha = async () => {
    if (!emailRecuperacao.trim()) {
      setErroRecuperacao(
        "Digite seu e-mail."
      );
      return;
    }

    setCarregandoRecuperacao(true);
    setErroRecuperacao("");
    setMensagemRecuperacao("");

    try {
      const response = await fetch(
        "https://bytebank-patterns-backend.onrender.com/auth/esqueci-senha",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: emailRecuperacao,
          }),
        }
      );

      const texto = await response.text();

let data: any = {};

if (texto) {
  try {
    data = JSON.parse(texto);
  } catch {
    data = {};
  }
}

if (!response.ok) {
  throw new Error(
    data.erro ||
      "Não foi possível solicitar a recuperação."
  );
}

setMensagemRecuperacao(
  data.mensagem ||
    "Se o e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha."
);

    } catch (error) {
      if (error instanceof Error) {
        setErroRecuperacao(
          error.message
        );
      }
    } finally {
      setCarregandoRecuperacao(false);
    }
  };


  const redefinirSenha = async () => {
    if (!novaSenha || !confirmarNovaSenha) {
      setErroRecuperacao(
        "Preencha a nova senha e a confirmação."
      );
      return;
    }

    if (novaSenha.length < 8) {
      setErroRecuperacao(
        "A senha deve ter pelo menos 8 caracteres."
      );
      return;
    }

    if (novaSenha !== confirmarNovaSenha) {
      setErroRecuperacao(
        "As senhas não coincidem."
      );
      return;
    }

    if (!tokenRecuperacao) {
      setErroRecuperacao(
        "Link de recuperação inválido."
      );
      return;
    }

    setCarregandoRecuperacao(true);
    setErroRecuperacao("");
    setMensagemRecuperacao("");

    try {
      const response = await fetch(
        "https://bytebank-patterns-backend.onrender.com/auth/redefinir-senha",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: tokenRecuperacao,
            novaSenha,
            confirmarSenha:
              confirmarNovaSenha,
          }),
        }
      );

const texto = await response.text();

let data: any = {};

if (texto) {
  try {
    data = JSON.parse(texto);
  } catch {
    data = {};
  }
}

      if (!response.ok) {
        throw new Error(
          data.erro ||
            "Não foi possível redefinir sua senha."
        );
      }

      setNovaSenha("");
      setConfirmarNovaSenha("");
      setTokenRecuperacao("");

      window.history.replaceState(
        {},
        "",
        window.location.pathname
      );

      setModoAuth("login");

      setErroLogin(
        "Senha redefinida com sucesso. Entre com sua nova senha."
      );
    } catch (error) {
      if (error instanceof Error) {
        setErroRecuperacao(
          error.message
        );
      }
    } finally {
      setCarregandoRecuperacao(false);
    }
  };


  const sair = () => {
    setUsuario(null);
    setConta(null);
    setMovimentacoes([]);
    setPagina("visao-geral");
    setValor("");
    setOperacao(null);
    setMensagem("");
    setSenha("");
  };


  const executarOperacao = async () => {
    if (!conta || !operacao) {
      return;
    }

    const valorNumerico = Number(
      valor.replace(",", ".")
    );

    if (
      !valorNumerico ||
      valorNumerico <= 0
    ) {
      setMensagem(
        "Digite um valor válido."
      );
      return;
    }

    try {
      const response = await fetch(
        `https://bytebank-patterns-backend.onrender.com/contas/${conta.id}/operacoes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              `Bearer ${usuario?.token}`,
          },
          body: JSON.stringify({
            operacao,
            valor: valorNumerico,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.erro ||
            "Não foi possível realizar a operação."
        );
      }

      const operacaoRealizada =
        operacao;

      setConta(data);
      setValor("");
      setOperacao(null);

      await buscarMovimentacoes(
        conta.id
      );

      setMensagem(
        operacaoRealizada === "DEPOSITAR"
          ? "Depósito realizado com sucesso."
          : "Saque realizado com sucesso."
      );
    } catch (error) {
      if (error instanceof Error) {
        setMensagem(error.message);
      }
    }
  };


  const formatarDinheiro = (
    valor: number
  ) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);


  const formatarData = (
    dataHora: string
  ) => {
    const data = new Date(dataHora);

    return new Intl.DateTimeFormat(
      "pt-BR",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    ).format(data);
  };


  const abrirOperacao = (
    tipo: Operacao
  ) => {
    setOperacao(tipo);
    setValor("");
    setMensagem("");
  };


  const tituloPagina = () => {
    if (pagina === "conta") {
      return {
        eyebrow: "SUA CONTA",
        titulo: "Detalhes da conta",
      };
    }

    if (pagina === "operacoes") {
      return {
        eyebrow: "MOVIMENTAÇÕES",
        titulo: "Operações",
      };
    }

    return {
      eyebrow: "VISÃO GERAL",
      titulo: `Olá, ${
        conta?.titular.split(" ")[0] ?? ""
      }.`,
    };
  };


  if (!usuario) {

    return (
      <div className="auth-page">
        <section className="auth-brand-panel">
          <div className="auth-brand">
            <div className="brand-mark">B</div>
            <span>ByteBank</span>
          </div>

          <div className="auth-brand-content">
            <p className="auth-kicker">
              SUA VIDA FINANCEIRA, SIMPLIFICADA.
            </p>

            <h1>
              Seu dinheiro.
              <br />
              Do seu jeito.
            </h1>

            <p>
              Uma experiência bancária simples, segura e
              feita para você.
            </p>
          </div>

          <div className="auth-brand-footer">
            ByteBank • Banking reimagined
          </div>
        </section>

        <main className="auth-form-panel">
          <div className="auth-mobile-brand">
            <div className="brand-mark">B</div>
            <span>ByteBank</span>
          </div>

<div className="auth-form-container">
 {modoAuth === "login" ? (
  <>
    <p className="eyebrow">BEM-VINDO DE VOLTA</p>

    <h2>Acesse sua conta</h2>

    <p className="auth-description">
      Entre com seus dados para continuar.
    </p>

    <div className="auth-fields">
      <label>
        E-mail

        <input
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              fazerLogin();
            }
          }}
        />
      </label>

      <label>
        <div className="password-label">
          <span>Senha</span>

          <button
            type="button"
            className="forgot-password"
            onClick={() => {
              setEmailRecuperacao(email);
              setErroRecuperacao("");
              setMensagemRecuperacao("");
              setModoAuth("esqueci-senha");
            }}
          >
            Esqueci minha senha
          </button>
        </div>

        <input
          type="password"
          placeholder="Digite sua senha"
          value={senha}
          onChange={(event) =>
            setSenha(event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              fazerLogin();
            }
          }}
        />
      </label>
    </div>

    {erroLogin && (
      <div className="auth-error">
        {erroLogin}
      </div>
    )}

    <button
      className="login-button"
      onClick={fazerLogin}
      disabled={carregandoLogin}
    >
      {carregandoLogin
        ? "Entrando..."
        : "Entrar na conta"}
    </button>

    <div className="auth-divider">
      <span></span>
      <p>NOVO NO BYTEBANK?</p>
      <span></span>
    </div>

    <button
      type="button"
      className="create-account-button"
      onClick={() => {
        setModoAuth("cadastro");
        setErroLogin("");
        setErroCadastro("");
      }}
    >
      Criar minha conta
    </button>
  </>
) : modoAuth === "cadastro" ? (
  <>
    <p className="eyebrow">COMECE AGORA</p>

    <h2>Crie sua conta</h2>

    <p className="auth-description">
      Abra sua conta ByteBank em poucos passos.
    </p>

    <div className="auth-fields">
      <label>
        Nome completo

        <input
          type="text"
          placeholder="Seu nome"
          value={nomeCadastro}
          onChange={(event) =>
            setNomeCadastro(event.target.value)
          }
        />
      </label>

      <label>
        E-mail

        <input
          type="email"
          placeholder="seu@email.com"
          value={emailCadastro}
          onChange={(event) =>
            setEmailCadastro(event.target.value)
          }
        />
      </label>

      <label>
        Senha

        <input
          type="password"
          placeholder="Mínimo de 8 caracteres"
          value={senhaCadastro}
          onChange={(event) =>
            setSenhaCadastro(event.target.value)
          }
        />
      </label>

      <label>
        Confirmar senha

        <input
          type="password"
          placeholder="Digite sua senha novamente"
          value={confirmarSenha}
          onChange={(event) =>
            setConfirmarSenha(event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              fazerCadastro();
            }
          }}
        />
      </label>
    </div>

    {erroCadastro && (
      <div className="auth-error">
        {erroCadastro}
      </div>
    )}

    <button
      className="login-button"
      onClick={fazerCadastro}
      disabled={carregandoCadastro}
    >
      {carregandoCadastro
        ? "Criando sua conta..."
        : "Criar minha conta"}
    </button>

    <div className="auth-divider">
      <span></span>
      <p>JÁ POSSUI UMA CONTA?</p>
      <span></span>
    </div>

    <button
      type="button"
      className="create-account-button"
      onClick={() => {
        setModoAuth("login");
        setErroCadastro("");
        setErroLogin("");
      }}
    >
      Voltar para o login
    </button>
  </>
) : modoAuth === "esqueci-senha" ? (
  <>
    <p className="eyebrow">RECUPERAÇÃO DE ACESSO</p>

    <h2>Esqueceu sua senha?</h2>

    <p className="auth-description">
      Informe o e-mail cadastrado na sua conta.
      Enviaremos um link para você criar uma nova senha.
    </p>

    <div className="auth-fields">
      <label>
        E-mail

        <input
          type="email"
          placeholder="seu@email.com"
          value={emailRecuperacao}
          onChange={(event) =>
            setEmailRecuperacao(event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              solicitarRecuperacaoSenha();
            }
          }}
        />
      </label>
    </div>

    {erroRecuperacao && (
      <div className="auth-error">
        {erroRecuperacao}
      </div>
    )}

    {mensagemRecuperacao && (
      <div className="auth-success">
        {mensagemRecuperacao}
      </div>
    )}

    <button
      className="login-button"
      onClick={solicitarRecuperacaoSenha}
      disabled={carregandoRecuperacao}
    >
      {carregandoRecuperacao
        ? "Enviando..."
        : "Enviar link de recuperação"}
    </button>

    <div className="auth-divider">
      <span></span>
      <p>LEMBROU SUA SENHA?</p>
      <span></span>
    </div>

    <button
      type="button"
      className="create-account-button"
      onClick={() => {
        setModoAuth("login");
        setErroRecuperacao("");
        setMensagemRecuperacao("");
      }}
    >
      Voltar para o login
    </button>
  </>
) : (
  <>
    <p className="eyebrow">NOVA SENHA</p>

    <h2>Crie uma nova senha</h2>

    <p className="auth-description">
      Escolha uma nova senha segura para acessar sua
      conta ByteBank.
    </p>

    <div className="auth-fields">
      <label>
        Nova senha

        <input
          type="password"
          placeholder="Mínimo de 8 caracteres"
          value={novaSenha}
          onChange={(event) =>
            setNovaSenha(event.target.value)
          }
        />
      </label>

      <label>
        Confirmar nova senha

        <input
          type="password"
          placeholder="Digite a nova senha novamente"
          value={confirmarNovaSenha}
          onChange={(event) =>
            setConfirmarNovaSenha(event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              redefinirSenha();
            }
          }}
        />
      </label>
    </div>

    {erroRecuperacao && (
      <div className="auth-error">
        {erroRecuperacao}
      </div>
    )}

    <button
      className="login-button"
      onClick={redefinirSenha}
      disabled={carregandoRecuperacao}
    >
      {carregandoRecuperacao
        ? "Redefinindo..."
        : "Redefinir minha senha"}
    </button>

    <div className="auth-divider">
      <span></span>
      <p>BYTEBANK</p>
      <span></span>
    </div>

    <button
      type="button"
      className="create-account-button"
      onClick={() => {
        window.history.replaceState(
          {},
          "",
          window.location.pathname
        );

        setTokenRecuperacao("");
        setNovaSenha("");
        setConfirmarNovaSenha("");
        setErroRecuperacao("");
        setModoAuth("login");
      }}
    >
      Voltar para o login
    </button>
  </>
  )}

  <p className="auth-security">
    Seus dados são protegidos e sua senha nunca é
    armazenada em texto puro.
  </p>
</div>

        </main>
      </div>
    );
  }

  if (carregando || !conta) {
    return (
      <div className="loading">
        Carregando ByteBank...
      </div>
    );
  }

  const cabecalho = tituloPagina();

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">B</div>
          <span>ByteBank</span>
        </div>

        <nav>
          <button
            className={`nav-item ${
              pagina === "visao-geral" ? "active" : ""
            }`}
            onClick={() => setPagina("visao-geral")}
          >
            <span>⌂</span>
            Visão geral
          </button>

          <button
            className={`nav-item ${
              pagina === "conta" ? "active" : ""
            }`}
            onClick={() => setPagina("conta")}
          >
            <span>▣</span>
            Conta
          </button>

          <button
            className={`nav-item ${
              pagina === "operacoes" ? "active" : ""
            }`}
            onClick={() => {
              setPagina("operacoes");
              buscarMovimentacoes(conta.id);
            }}
          >
            <span>↗</span>
            Operações
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button
            className="logout-button"
            onClick={sair}
          >
            <span>↪</span>
            Sair
          </button>

          <div className="sidebar-footer">
            <div className="avatar">
              {conta.titular.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{conta.titular}</strong>
              <span>
                Conta #
                {String(conta.id).padStart(4, "0")}
              </span>
            </div>
          </div>
        </div>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">
              {cabecalho.eyebrow}
            </p>
            <h1>{cabecalho.titulo}</h1>
          </div>

          <div className="status">
            <span className="status-dot"></span>
            Conta ativa
          </div>
        </header>

        {pagina === "visao-geral" && (
          <>
            <section className="balance-card">
              <div className="balance-header">
                <span>Saldo disponível</span>

                <div className="card-logo">
                  <span></span>
                  <span></span>
                </div>
              </div>

              <h2>
                {formatarDinheiro(conta.saldo)}
              </h2>

              <div className="balance-footer">
                <div>
                  <small>TITULAR</small>
                  <strong>{conta.titular}</strong>
                </div>

                <div>
                  <small>CONTA</small>
                  <strong>
                    ••••{" "}
                    {String(conta.id).padStart(4, "0")}
                  </strong>
                </div>
              </div>
            </section>

            <section className="quick-actions">
              <div className="section-heading">
                <div>
                  <h3>Ações rápidas</h3>
                  <p>
                    Movimente sua conta com segurança.
                  </p>
                </div>
              </div>

              <div className="actions-grid">
                <button
                  className="action-card"
                  onClick={() =>
                    abrirOperacao("DEPOSITAR")
                  }
                >
                  <div className="action-icon">↓</div>

                  <div>
                    <strong>Depositar</strong>
                    <span>Adicionar dinheiro</span>
                  </div>

                  <b>›</b>
                </button>

                <button
                  className="action-card"
                  onClick={() =>
                    abrirOperacao("SACAR")
                  }
                >
                  <div className="action-icon">↑</div>

                  <div>
                    <strong>Sacar</strong>
                    <span>Retirar dinheiro</span>
                  </div>

                  <b>›</b>
                </button>
              </div>
            </section>

            <section className="account-panel">
              <div>
                <p className="eyebrow">
                  SUA CONTA
                </p>
                <h3>ByteBank Principal</h3>
                <span>
                  Conta digital • #
                  {String(conta.id).padStart(4, "0")}
                </span>
              </div>

              <strong>
                {formatarDinheiro(conta.saldo)}
              </strong>
            </section>
          </>
        )}

        {pagina === "conta" && (
          <section className="account-details">
            <div className="account-details-header">
              <div className="account-avatar">
                {conta.titular
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <p className="eyebrow">
                  BYTEBANK PRINCIPAL
                </p>
                <h2>{conta.titular}</h2>
                <span>Conta digital ativa</span>
              </div>
            </div>

            <div className="account-info-grid">
              <div className="account-info-item">
                <span>Titular</span>
                <strong>{conta.titular}</strong>
              </div>

              <div className="account-info-item">
                <span>Número da conta</span>
                <strong>
                  #
                  {String(conta.id).padStart(4, "0")}
                </strong>
              </div>

              <div className="account-info-item">
                <span>Status</span>
                <strong>Ativa</strong>
              </div>

              <div className="account-info-item">
                <span>Saldo disponível</span>
                <strong>
                  {formatarDinheiro(conta.saldo)}
                </strong>
              </div>
            </div>

            <div className="account-actions">
              <button
                className="secondary-action"
                onClick={() =>
                  abrirOperacao("DEPOSITAR")
                }
              >
                <span>↓</span>
                Depositar
              </button>

              <button
                className="secondary-action"
                onClick={() =>
                  abrirOperacao("SACAR")
                }
              >
                <span>↑</span>
                Sacar
              </button>
            </div>
          </section>
        )}

        {pagina === "operacoes" && (
          <section className="transactions-panel">
            <div className="transactions-header">
              <div>
                <h3>
                  Histórico de movimentações
                </h3>
                <p>
                  Acompanhe os depósitos e saques
                  realizados na sua conta.
                </p>
              </div>

              <span className="transaction-count">
                {movimentacoes.length}{" "}
                {movimentacoes.length === 1
                  ? "movimentação"
                  : "movimentações"}
              </span>
            </div>

            {movimentacoes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  ↗
                </div>
                <h3>
                  Nenhuma movimentação ainda
                </h3>
                <p>
                  Seus depósitos e saques
                  aparecerão aqui.
                </p>
              </div>
            ) : (
              <div className="transactions-list">
                {movimentacoes.map(
                  (movimentacao) => {
                    const deposito =
                      movimentacao.tipo ===
                      "DEPOSITAR";

                    return (
                      <div
                        className="transaction-item"
                        key={movimentacao.id}
                      >
                        <div
                          className={`transaction-icon ${
                            deposito
                              ? "deposit"
                              : "withdraw"
                          }`}
                        >
                          {deposito ? "↓" : "↑"}
                        </div>

                        <div className="transaction-info">
                          <strong>
                            {deposito
                              ? "Depósito"
                              : "Saque"}
                          </strong>
                          <span>
                            {formatarData(
                              movimentacao.dataHora
                            )}
                          </span>
                        </div>

                        <div
                          className={`transaction-value ${
                            deposito
                              ? "positive"
                              : "negative"
                          }`}
                        >
                          {deposito ? "+" : "-"}{" "}
                          {formatarDinheiro(
                            movimentacao.valor
                          )}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </section>
        )}
      </main>

      {operacao && (
        <div
          className="modal-backdrop"
          onClick={() => setOperacao(null)}
        >
          <div
            className="modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              className="close-button"
              onClick={() => setOperacao(null)}
            >
              ×
            </button>

            <div className="modal-icon">
              {operacao === "DEPOSITAR"
                ? "↓"
                : "↑"}
            </div>

            <p className="eyebrow">
              {operacao === "DEPOSITAR"
                ? "DEPÓSITO"
                : "SAQUE"}
            </p>

            <h2>
              {operacao === "DEPOSITAR"
                ? "Quanto você quer depositar?"
                : "Quanto você quer sacar?"}
            </h2>

            <div className="money-input">
              <span>R$</span>

              <input
                autoFocus
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={valor}
                onChange={(event) =>
                  setValor(event.target.value)
                }
              />
            </div>

            {mensagem && (
              <p className="modal-message">
                {mensagem}
              </p>
            )}

            <button
              className="confirm-button"
              onClick={executarOperacao}
            >
              Confirmar{" "}
              {operacao === "DEPOSITAR"
                ? "depósito"
                : "saque"}
            </button>

            <button
              className="cancel-button"
              onClick={() =>
                setOperacao(null)
              }
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {!operacao && mensagem && (
        <div
          className="toast"
          onClick={() => setMensagem("")}
        >
          {mensagem}
        </div>
      )}
    </div>
  );
}

export default App;

