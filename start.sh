#!/bin/bash

# Carregar variáveis de ambiente do arquivo .env
source .env

set -e

# Validar SA_PASSWORD
if [ -z "$SA_PASSWORD" ]; then
    echo "❌ Erro: A variável SA_PASSWORD não está definida no .env."
    echo "Exemplo de .env:"
    echo "SA_PASSWORD=SqlServer@2025"
    exit 1
fi

echo "🔧 SA_PASSWORD carregado com sucesso."

echo "🔧 Subindo containers com docker-compose..."
docker compose up -d

echo "⏳ Aguardando SQL Server iniciar (timeout de 60s)..."
MAX_RETRIES=60
RETRY_COUNT=0

# Esperando o SQL ficar pronto
until docker exec sql_server /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -Q "SELECT 1" -b >/dev/null 2>&1; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ "$RETRY_COUNT" -ge "$MAX_RETRIES" ]; then
        echo "❌ Timeout: SQL Server não respondeu após $MAX_RETRIES segundos."
        docker logs sql_server
        exit 1
    fi
    printf "."
    sleep 1
done

echo ""
echo "✅ SQL Server está pronto!"

echo "📦 Verificando/criando banco de dados e login..."

# Verificar se o contêiner sql_server está rodando
echo "🔍 Verificando se o contêiner sql_server está rodando..."
if ! docker ps | grep -q sql_server; then
    echo "❌ Erro: Contêiner sql_server não está rodando."
    docker logs sql_server
    exit 1
fi
echo "✅ Contêiner sql_server está rodando."

# Testar conexão com o SQL Server
echo "🔍 Testando conexão com o SQL Server (usuário sa)..."
if docker exec sql_server /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -Q "SELECT 1" -b >/dev/null 2>&1; then
    echo "✅ Conexão com o SQL Server bem-sucedida."
else
    echo "❌ Erro: Falha ao conectar ao SQL Server com o usuário sa."
    docker logs sql_server
    exit 1
fi

echo "📦 Iniciando configuração do banco de dados e login..."

# Função para executar comandos SQL e verificar sucesso
execute_sql() {
    local query="$1"
    docker exec sql_server /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -b -Q "$query"
    if [ $? -eq 0 ]; then
        echo "✅ Comando SQL executado com sucesso."
    else
        echo "❌ Erro ao executar o comando SQL."
        docker logs sql_server
        exit 1
    fi
}

# Etapa 1: Criar banco de dados $DB_NAME
echo "🔍 Etapa 1: Verificando/criando banco de dados $DB_NAME..."
create_db_query="IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'$DB_NAME')
BEGIN
    PRINT 'Criando banco de dados $DB_NAME...';
    CREATE DATABASE $DB_NAME;
END
ELSE
BEGIN
    PRINT 'Banco de dados $DB_NAME já existe.';
END"
execute_sql "$create_db_query"

# Etapa 2: Criar login $DB_USER
echo "🔍 Etapa 2: Verificando/criando login $DB_USER..."
create_login_query="IF NOT EXISTS (SELECT name FROM sys.sql_logins WHERE name = N'$DB_USER')
BEGIN
    PRINT 'Criando login $DB_USER...';
    CREATE LOGIN $DB_USER WITH PASSWORD = '$DB_PASSWORD';
END
ELSE
BEGIN
    PRINT 'Login $DB_USER já existe.';
END"
execute_sql "$create_login_query"

# Etapa 3: Criar usuário $DB_USER no banco $DB_NAME
echo "🔍 Etapa 3: Verificando/criando usuário $DB_USER no banco $DB_NAME..."
create_user_query="USE $DB_NAME;
GO
IF NOT EXISTS (SELECT name FROM sys.database_principals WHERE name = N'$DB_USER')
BEGIN
    PRINT 'Criando usuário $DB_USER no banco $DB_NAME...';
    CREATE USER $DB_USER FOR LOGIN $DB_USER;
    ALTER ROLE db_owner ADD MEMBER $DB_USER;
END
ELSE
BEGIN
    PRINT 'Usuário $DB_USER já existe no banco.';
END"
execute_sql "$create_user_query"

if [ $? -eq 0 ]; then
    echo "✅ Banco e usuário configurados com sucesso."
else
    echo "❌ Erro ao configurar banco ou usuário."
    docker logs sql_server
    exit 1
fi

echo "🚀 Ambiente pronto para uso!"
echo "🌐 API rodando em http://localhost:$API_PORT"
