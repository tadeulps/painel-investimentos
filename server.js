const jsonServer = require("json-server");

const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Custom route for login authentication
server.post("/autenticacao/login", (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({
      error: "E-mail e senha são obrigatórios",
    });
  }

  // Read users from db
  const db = router.db;
  const users = db.get("users").value();

  // Find user by email and password
  const user = users.find((u) => u.email === email && u.password === senha);

  if (!user) {
    return res.status(401).json({
      error: "E-mail ou senha incorretos",
    });
  }

  // Generate mock JWT token
  const mockToken = `header.${Buffer.from(
    JSON.stringify({
      userId: user.id,
      email: user.email,
    })
  ).toString("base64")}`;

  res.status(200).json({
    token: mockToken,
    clienteId: user.id,
  });
});

// Custom route to get user profile with risk profile details
server.get("/perfil-risco/:clienteId", (req, res) => {
  const clienteId = parseInt(req.params.clienteId);

  const db = router.db;
  const user = db.get("users").find({ id: clienteId }).value();

  if (!user) {
    return res.status(404).json({ error: "Cliente não encontrado" });
  }

  const riskProfile = db
    .get("riskProfiles")
    .find({ id: user.riskProfileId })
    .value();

  // Compute pontuacao (1-100) based on user's investments and product risks
  const userInvestments =
    db.get("investments").filter({ userId: clienteId }).value() || [];

  if (userInvestments.length === 0) {
    return res.json({
      clienteId: user.id,
      nome: user.name,
      email: user.email,
      perfilRisco: riskProfile, // mantém o perfil do banco
      pontuacao: 50, // neutro quando não há carteira
    });
  }

  const investmentsWithProducts = userInvestments.map((inv) => {
    const product = db.get("products").find({ id: inv.productId }).value();
    return { ...inv, produto: product };
  });

  // Map text risk to numeric base score (1-3)
  const riskValue = (riskText) => {
    const r = (riskText || "").toLowerCase();
    if (r.includes("alto") || r.includes("agressivo")) return 3;
    if (r.includes("baixo") || r.includes("conservador")) return 1;
    return 2; // médio
  };

  const total = investmentsWithProducts.reduce(
    (sum, i) => sum + (i.valorAtual || i.valor),
    0
  );

  const baseScore = investmentsWithProducts.reduce((sum, inv) => {
    const peso = (inv.valorAtual || inv.valor) / total;
    return sum + peso * riskValue(inv.produto?.risco);
  }, 0);

  // Convert 1–3 → 0–100 scale
  const pontuacao = Math.round((baseScore - 1) * 50);

  // Auto-update riskProfileId based on pontuacao
  let newRiskProfileId;
  if (pontuacao <= 33) {
    newRiskProfileId = 1; // Conservador
  } else if (pontuacao <= 66) {
    newRiskProfileId = 2; // Moderado
  } else {
    newRiskProfileId = 3; // Agressivo
  }

  // Check if pontuacao changed and save to history
  const lastHistory = db
    .get("pontuacaoHistory")
    .filter({ clienteId })
    .sortBy("timestamp")
    .reverse()
    .first()
    .value();

  const pontuacaoChanged = !lastHistory || lastHistory.pontuacao !== pontuacao;

  if (pontuacaoChanged) {
    const historyEntries = db.get("pontuacaoHistory").value();
    const newHistoryId =
      historyEntries.length > 0
        ? Math.max(...historyEntries.map((h) => h.id)) + 1
        : 1;

    db.get("pontuacaoHistory")
      .push({
        id: newHistoryId,
        clienteId,
        pontuacao,
        riskProfileId: newRiskProfileId,
        timestamp: new Date().toISOString(),
      })
      .write();
  }

  // Update user's risk profile if it changed
  if (user.riskProfileId !== newRiskProfileId) {
    db.get("users")
      .find({ id: clienteId })
      .assign({ riskProfileId: newRiskProfileId })
      .write();
  }

  // Get updated risk profile
  const updatedRiskProfile = db
    .get("riskProfiles")
    .find({ id: newRiskProfileId })
    .value();

  res.json({
    clienteId: user.id,
    nome: user.name,
    email: user.email,
    perfilRisco: updatedRiskProfile,
    pontuacao,
  });
});

// Custom route to get pontuacao history for a client
server.get("/pontuacao-history/:clienteId", (req, res) => {
  const clienteId = parseInt(req.params.clienteId);

  const db = router.db;
  const user = db.get("users").find({ id: clienteId }).value();

  if (!user) {
    return res.status(404).json({ error: "Cliente não encontrado" });
  }

  const history = db
    .get("pontuacaoHistory")
    .filter({ clienteId })
    .sortBy("timestamp")
    .value();

  // Enrich history with risk profile names
  const historyWithProfiles = history.map((entry) => {
    const riskProfile = db
      .get("riskProfiles")
      .find({ id: entry.riskProfileId })
      .value();
    return {
      ...entry,
      perfilRisco: riskProfile?.name || "Desconhecido",
    };
  });

  res.json({
    clienteId,
    totalEntries: historyWithProfiles.length,
    history: historyWithProfiles,
  });
});

// Custom route to update user risk profile
server.post("/perfil-risco", (req, res) => {
  const { clienteId, riskProfileId } = req.body;

  if (!clienteId || !riskProfileId) {
    return res.status(400).json({
      error: "clienteId e riskProfileId são obrigatórios",
    });
  }

  const db = router.db;
  const user = db.get("users").find({ id: clienteId }).value();

  if (!user) {
    return res.status(404).json({ error: "Cliente não encontrado" });
  }

  const riskProfile = db
    .get("riskProfiles")
    .find({ id: riskProfileId })
    .value();

  if (!riskProfile) {
    return res.status(404).json({ error: "Perfil de risco não encontrado" });
  }

  // Update user's risk profile
  db.get("users")
    .find({ id: clienteId })
    .assign({ riskProfileId: riskProfileId })
    .write();

  res.json({
    success: true,
    message: "Perfil de risco atualizado com sucesso",
    clienteId: user.id,
    nome: user.name,
    perfilRisco: riskProfile,
  });
});

// Custom route to get recommended products based on risk profile
server.get("/produtos-recomendados/:perfil", (req, res) => {
  const perfil = req.params.perfil;

  const db = router.db;
  const riskProfile = db.get("riskProfiles").find({ nivel: perfil }).value();

  if (!riskProfile) {
    return res.status(404).json({ error: "Perfil de risco não encontrado" });
  }

  const products = db
    .get("products")
    .filter((p) => riskProfile.productIds.includes(p.id))
    .value();

  res.json(products);
});

// Custom route to simulate investment
server.post("/simular-investimento", (req, res) => {
  const { valorInicial, prazoMeses, produtoId } = req.body;

  if (!valorInicial || !prazoMeses || !produtoId) {
    return res.status(400).json({
      error: "valorInicial, prazoMeses e produtoId são obrigatórios",
    });
  }

  const db = router.db;
  const product = db.get("products").find({ id: produtoId }).value();

  if (!product) {
    return res.status(404).json({ error: "Produto não encontrado" });
  }

  // Calculate monthly returns
  const taxaMensal = Math.pow(1 + product.rentabilidade, 1 / 12) - 1;
  const detalheMensal = [];
  let saldoAtual = valorInicial;

  for (let mes = 1; mes <= prazoMeses; mes++) {
    const rendimentoMes = saldoAtual * taxaMensal;
    saldoAtual += rendimentoMes;

    detalheMensal.push({
      mes,
      saldo: parseFloat(saldoAtual.toFixed(2)),
      rendimento: parseFloat(rendimentoMes.toFixed(2)),
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
    detalheMensal,
  });
});

// Custom route to get user investments
server.get("/investimentos/:clienteId", (req, res) => {
  const clienteId = parseInt(req.params.clienteId);

  const db = router.db;
  const investments = db
    .get("investments")
    .filter({ userId: clienteId })
    .value();

  const investmentsWithProducts = investments.map((inv) => {
    const product = db.get("products").find({ id: inv.productId }).value();
    return {
      ...inv,
      produto: product,
    };
  });

  res.json(investmentsWithProducts);
});

// Custom route to create new investment
server.post("/investimentos", (req, res) => {
  const { clienteId, productId, valor, prazoMeses } = req.body;

  if (!clienteId || !productId || !valor || !prazoMeses) {
    return res.status(400).json({
      error: "clienteId, productId, valor e prazoMeses são obrigatórios",
    });
  }

  const db = router.db;

  // Validate user exists
  const user = db.get("users").find({ id: clienteId }).value();
  if (!user) {
    return res.status(404).json({ error: "Cliente não encontrado" });
  }

  // Validate product exists
  const product = db.get("products").find({ id: productId }).value();
  if (!product) {
    return res.status(404).json({ error: "Produto não encontrado" });
  }

  // Calculate current value based on time elapsed (simulate initial investment)
  const taxaMensal = Math.pow(1 + product.taxaAnual, 1 / 12) - 1;
  const valorAtual = valor; // Initial investment, no time elapsed yet

  // Get next ID
  const investments = db.get("investments").value();
  const newId =
    investments.length > 0 ? Math.max(...investments.map((i) => i.id)) + 1 : 1;

  // Create new investment
  const newInvestment = {
    id: newId,
    userId: clienteId,
    productId: productId,
    valor: valor,
    dataInicio: new Date().toISOString().split("T")[0], // Current date YYYY-MM-DD
    prazoMeses: prazoMeses,
    valorAtual: valorAtual,
  };

  // Add to database
  db.get("investments").push(newInvestment).write();

  // Return investment with product details
  res.status(201).json({
    success: true,
    message: "Investimento criado com sucesso",
    investment: {
      ...newInvestment,
      produto: product,
    },
  });
});

// Use default router for other routes
server.use(router);

// Start server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`\nJSON Server está rodando em http://localhost:${PORT}\n`);
  console.log("Endpoints disponíveis:");
  console.log(`POST   http://localhost:${PORT}/autenticacao/login`);
  console.log(`GET    http://localhost:${PORT}/perfil-risco/:clienteId`);
  console.log(`GET    http://localhost:${PORT}/pontuacao-history/:clienteId`);
  console.log(`POST   http://localhost:${PORT}/perfil-risco`);
  console.log(`GET    http://localhost:${PORT}/produtos-recomendados/:perfil`);
  console.log(`POST   http://localhost:${PORT}/simular-investimento`);
  console.log(`GET    http://localhost:${PORT}/investimentos/:clienteId`);
  console.log(`POST   http://localhost:${PORT}/investimentos`);
  console.log(`GET    http://localhost:${PORT}/users`);
  console.log(`GET    http://localhost:${PORT}/products`);
  console.log(`GET    http://localhost:${PORT}/riskProfiles\n`);
});
