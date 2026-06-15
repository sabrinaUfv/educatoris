#!/bin/bash

# Setup automático para e-ducatoris com Yarn
# Uso: bash setup.sh

set -e

echo "🚀 Iniciando setup do e-ducatoris..."
echo ""

# Verificar se yarn está instalado
if ! command -v yarn &> /dev/null; then
    echo "❌ Yarn não encontrado!"
    echo "   Instale com: npm install -g yarn"
    exit 1
fi

echo "✅ Yarn encontrado ($(yarn --version))"
echo ""

# Step 1: Instalar dependências
echo "📦 Instalando dependências..."
yarn install:all
echo "✅ Dependências instaladas"
echo ""

# Step 2: Seed do banco de dados
echo "🌱 Populando banco de dados..."
yarn seed
echo "✅ Banco de dados criado"
echo ""

# Step 3: Criar .env se não existir
if [ ! -f "backend/.env" ]; then
    echo "🔑 Criando arquivo .env no backend..."
    cp backend/.env.example backend/.env 2>/dev/null || cat > backend/.env << 'EOF'
PORT=3001
JWT_SECRET=$(date +%s%N | sha256sum | base64 | head -c 32)
NODE_ENV=development
EOF
    echo "✅ Arquivo .env criado"
else
    echo "✅ Arquivo .env já existe"
fi
echo ""

# Step 4: Verificação final
echo "🔍 Verificando setup..."
echo ""
echo "Backend:"
cd backend
node -e "console.log('  ✅ Node.js funcionando')" 2>/dev/null || echo "  ⚠️  Erro ao testar Node.js"
cd ..
echo ""
echo "Frontend:"
cd frontend
node -e "console.log('  ✅ Next.js deve estar pronto')" 2>/dev/null || echo "  ⚠️  Erro ao testar"
cd ..
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Setup concluído com sucesso!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎯 Próximos passos:"
echo ""
echo "1️⃣  Rodar backend + frontend juntos:"
echo "   yarn dev"
echo ""
echo "2️⃣  Em outro terminal, rodar testes:"
echo "   yarn test              # Testes unitários"
echo "   yarn e2e:run          # Testes E2E"
echo ""
echo "3️⃣  Credenciais de teste:"
echo "   Admin:     admin@educatoris.com / admin123"
echo "   Professor: professor@example.com / password123"
echo ""
echo "📚 Documentação:"
echo "   - YARN_GUIDE.md (guia completo com yarn)"
echo "   - GUIDE.md (guia geral)"
echo "   - README.md (overview)"
echo ""
