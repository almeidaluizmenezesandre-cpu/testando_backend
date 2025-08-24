const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./database');

const app = express();
const port = 3000;

// Sessão
app.use(session({
  secret: 'segredo-super-seguro',
  resave: false,
  saveUninitialized: false
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend')));

// Credenciais do administrador
const USUARIO = 'admin';
const SENHA = '1234';

// Página inicial com formulário
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Rota para processar envio do formulário
app.post('/contato', (req, res) => {
  const { nome, email, mensagem } = req.body;

  db.run(
    'INSERT INTO contatos (nome, email, mensagem) VALUES (?, ?, ?)',
    [nome, email, mensagem],
    (err) => {
      if (err) {
        console.error('Erro ao salvar no banco:', err.message);
        return res.status(500).send('Erro ao salvar a mensagem.');
      }

      res.send('<p>Mensagem enviada com sucesso!</p><a href="/">Voltar</a>');
    }
  );
});

// Tela de login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

// Autenticação
app.post('/login', (req, res) => {
  const { usuario, senha } = req.body;

  if (usuario === USUARIO && senha === SENHA) {
    req.session.logado = true;
    res.redirect('/admin');
  } else {
    res.send('<p>Usuário ou senha inválidos.</p><a href="/login">Tentar novamente</a>');
  }
});

// Painel admin protegido
app.get('/admin', (req, res) => {
  if (!req.session.logado) return res.redirect('/login');

  db.all('SELECT * FROM contatos ORDER BY data_envio DESC', (err, rows) => {
    if (err) return res.status(500).send('Erro ao buscar dados.');

    let html = `
      <h1>Mensagens Recebidas</h1>
      <table border="1" cellpadding="10" cellspacing="0">
        <tr><th>ID</th><th>Nome</th><th>Email</th><th>Mensagem</th><th>Data</th></tr>
    `;

    rows.forEach(contato => {
      html += `
        <tr>
          <td>${contato.id}</td>
          <td>${contato.nome}</td>
          <td>${contato.email}</td>
          <td>${contato.mensagem}</td>
          <td>${contato.data_envio}</td>
        </tr>
      `;
    });

    html += '</table><br><a href="/logout">Sair</a>';
    res.send(html);
  });
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em: http://localhost:${port}`);
});
