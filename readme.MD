# 📦 TCC-BACK – API Node.js com SQL Server e Redis

Este projeto é uma API desenvolvida em Node.js com autenticação JWT, banco de dados SQL Server e suporte a Redis.  
A inicialização e configuração do banco é feita automaticamente com o script `start.sh`.

## ✅ Requisitos

Antes de iniciar, você precisará ter instalado em seu ambiente:

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Node.js e npm](https://nodejs.org/)

## ⚙️ Configuração do `.env`

Crie um arquivo chamado `.env` na raiz do projeto com as seguintes variáveis de ambiente:

```env
# Configurações da API
API_PORT=3000

# Configuração do banco SQL Server
DATABASE_URL="Server=sql_server,1433;Database=<DB NAME>;User Id=<DB USER>;Password=<DB PASSWORD>;TrustServerCertificate=True;"
DB_USER=<DB USER>
DB_PASSWORD=<DB PASSWORD>
DB_SERVER=sql_server
DB_NAME=<DB NAME>
DB_PORT=1433

# Configuração JWT
JWT_SECRET=your_secure_jwt_secret_1234567890
JWT_REFRESH_SECRET=your_secure_refresh_secret_0987654321
JWT_EXPIRES_IN=48h
JWT_REFRESH_EXPIRES_IN=7d

# Senha do usuário 'sa' do SQL Server (importante para inicialização)
SA_PASSWORD=<SA PASSWORD>
