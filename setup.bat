@echo off
REM Setup automático para e-ducatoris com Yarn (Windows)
REM Uso: setup.bat

setlocal enabledelayedexpansion

echo.
echo 🚀 Iniciando setup do e-ducatoris...
echo.

REM Verificar se yarn está instalado
where yarn >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Yarn não encontrado!
    echo    Instale com: npm install -g yarn
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('yarn --version') do set YARN_VERSION=%%i
echo ✅ Yarn encontrado (%YARN_VERSION%)
echo.

REM Step 1: Instalar dependências
echo 📦 Instalando dependências...
call yarn install:all
if %errorlevel% neq 0 (
    echo ❌ Erro ao instalar dependências
    pause
    exit /b 1
)
echo ✅ Dependências instaladas
echo.

REM Step 2: Seed do banco de dados
echo 🌱 Populando banco de dados...
call yarn seed
if %errorlevel% neq 0 (
    echo ❌ Erro ao popular banco de dados
    pause
    exit /b 1
)
echo ✅ Banco de dados criado
echo.

REM Step 3: Criar .env se não existir
if not exist "backend\.env" (
    echo 🔑 Criando arquivo .env no backend...
    if exist "backend\.env.example" (
        copy "backend\.env.example" "backend\.env" >nul
    ) else (
        (
            echo PORT=3001
            echo JWT_SECRET=seu_segredo_aqui_coloque_uma_string_longa_e_aleatoria
            echo NODE_ENV=development
        ) > "backend\.env"
    )
    echo ✅ Arquivo .env criado
) else (
    echo ✅ Arquivo .env já existe
)
echo.

REM Step 4: Verificação final
echo 🔍 Verificando setup...
echo.
echo Backend:
node -e "console.log('  ✅ Node.js funcionando')" 2>nul || echo   ⚠️  Erro ao testar Node.js
echo.
echo Frontend:
cd frontend 2>nul && cd .. && echo   ✅ Frontend pronto
echo.

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ✨ Setup concluído com sucesso!
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 🎯 Próximos passos:
echo.
echo 1️⃣  Rodar backend + frontend juntos:
echo    yarn dev
echo.
echo 2️⃣  Em outro terminal, rodar testes:
echo    yarn test              REM Testes unitários
echo    yarn e2e:run          REM Testes E2E
echo.
echo 3️⃣  Credenciais de teste:
echo    Admin:     admin@educatoris.com / admin123
echo    Professor: professor@example.com / password123
echo.
echo 📚 Documentação:
echo    - YARN_GUIDE.md (guia completo com yarn^)
echo    - GUIDE.md (guia geral^)
echo    - README.md (overview^)
echo.
pause
