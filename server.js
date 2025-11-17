const jsonServer = require('json-server');

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Custom route for login authentication
server.post('/autenticacao/login', (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ 
      error: 'E-mail e senha são obrigatórios' 
    });
  }

  // Read users from db
  const db = router.db;
  const users = db.get('users').value();
  
  // Find user by email and password
  const user = users.find(u => u.email === email && u.password === senha);

  if (!user) {
    return res.status(401).json({ 
      error: 'E-mail ou senha incorretos' 
    });
  }

  // Generate mock JWT token
  const mockToken = `header.${Buffer.from(JSON.stringify({ 
    userId: user.id, 
    email: user.email 
  })).toString('base64')}`;

  res.status(200).json({
    token: mockToken,
    clienteId: user.id
  });
});

// Custom route to get user profile with risk profile details
server.get('/perfil-risco/:clienteId', (req, res) => {
  const clienteId = parseInt(req.params.clienteId);
  
  const db = router.db;
  const user = db.get('users').find({ id: clienteId }).value();
  
  if (!user) {
    return res.status(404).json({ error: 'Cliente não encontrado' });
  }

  const riskProfile = db.get('riskProfiles').find({ id: user.riskProfileId }).value();
  
  res.json({
    clienteId: user.id,
    nome: user.name,
    email: user.email,
    perfilRisco: riskProfile
  });
});

// Custom route to update user risk profile
server.post('/perfil-risco', (req, res) => {
  const { clienteId, riskProfileId } = req.body;

  if (!clienteId || !riskProfileId) {
    return res.status(400).json({ 
      error: 'clienteId e riskProfileId são obrigatórios' 
    });
  }

  const db = router.db;
  const user = db.get('users').find({ id: clienteId }).value();
  
  if (!user) {
    return res.status(404).json({ error: 'Cliente não encontrado' });
  }

  const riskProfile = db.get('riskProfiles').find({ id: riskProfileId }).value();
  
  if (!riskProfile) {
    return res.status(404).json({ error: 'Perfil de risco não encontrado' });
  }

  // Update user's risk profile
  db.get('users')
    .find({ id: clienteId })
    .assign({ riskProfileId: riskProfileId })
    .write();

  res.json({
    success: true,
    message: 'Perfil de risco atualizado com sucesso',
    clienteId: user.id,
    nome: user.name,
    perfilRisco: riskProfile
  });
});

// Custom route to get recommended products based on risk profile
server.get('/produtos-recomendados/:perfil', (req, res) => {
  const perfil = req.params.perfil;
  
  const db = router.db;
  const riskProfile = db.get('riskProfiles').find({ nivel: perfil }).value();
  
  if (!riskProfile) {
    return res.status(404).json({ error: 'Perfil de risco não encontrado' });
  }

  const products = db.get('products')
    .filter(p => riskProfile.productIds.includes(p.id))
    .value();
  
  res.json(products);
});

// Custom route to simulate investment
server.post('/simular-investimento', (req, res) => {
  const { valorInicial, prazoMeses, produtoId } = req.body;

  if (!valorInicial || !prazoMeses || !produtoId) {
    return res.status(400).json({ 
      error: 'valorInicial, prazoMeses e produtoId são obrigatórios' 
    });
  }

  const db = router.db;
  const product = db.get('products').find({ id: produtoId }).value();
  
  if (!product) {
    return res.status(404).json({ error: 'Produto não encontrado' });
  }

  // Calculate monthly returns
  const taxaMensal = Math.pow(1 + product.rentabilidade, 1/12) - 1;
  const detalheMensal = [];
  let saldoAtual = valorInicial;

  for (let mes = 1; mes <= prazoMeses; mes++) {
    const rendimentoMes = saldoAtual * taxaMensal;
    saldoAtual += rendimentoMes;
    
    detalheMensal.push({
      mes,
      saldo: parseFloat(saldoAtual.toFixed(2)),
      rendimento: parseFloat(rendimentoMes.toFixed(2))
    });
  }

  const valorFinal = saldoAtual;
  const rendimentoTotal = valorFinal - valorInicial;

  res.json({
    valorInicial,
    valorFinal: parseFloat(valorFinal.toFixed(2)),
    rendimentoTotal: parseFloat(rendimentoTotal.toFixed(2)),
    prazoMeses,
    produto: product,
    detalheMensal
  });
});

// Custom route to get user investments
server.get('/investimentos/:clienteId', (req, res) => {
  const clienteId = parseInt(req.params.clienteId);
  
  const db = router.db;
  const investments = db.get('investments')
    .filter({ userId: clienteId })
    .value();

  const investmentsWithProducts = investments.map(inv => {
    const product = db.get('products').find({ id: inv.productId }).value();
    return {
      ...inv,
      produto: product
    };
  });

  res.json(investmentsWithProducts);
});

// Use default router for other routes
server.use(router);

// Start server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`\nJSON Server está rodando em http://localhost:${PORT}\n`);
  console.log('Endpoints disponíveis:');
  console.log(`POST   http://localhost:${PORT}/autenticacao/login`);
  console.log(`GET    http://localhost:${PORT}/perfil-risco/:clienteId`);
  console.log(`POST   http://localhost:${PORT}/perfil-risco`);
  console.log(`GET    http://localhost:${PORT}/produtos-recomendados/:perfil`);
  console.log(`POST   http://localhost:${PORT}/simular-investimento`);
  console.log(`GET    http://localhost:${PORT}/investimentos/:clienteId`);
  console.log(`GET    http://localhost:${PORT}/users`);
  console.log(`GET    http://localhost:${PORT}/products`);
  console.log(`GET    http://localhost:${PORT}/riskProfiles\n`);
});