# Deploy na AWS Free Tier

Este documento descreve como configurar a infraestrutura na AWS para deploy do NLW Agents.

## Arquitetura

```
CloudFront (CDN) --> S3 (Frontend estático)
                --> EC2 t2.micro (Backend API)
                --> Neon.tech (PostgreSQL + pgvector)
```

## Componentes e Custos (Free Tier - 12 meses)

| Serviço | Tier | Limite Gratuito |
|---------|------|-----------------|
| EC2 t2.micro | Free Tier | 750 horas/mês |
| S3 | Free Tier | 5GB armazenamento |
| CloudFront | Free Tier | 1TB transferência/mês |
| Neon.tech | Free | 0.5GB storage, pgvector incluso |

## Pré-requisitos

1. Conta AWS com Free Tier ativo
2. Conta no [Neon.tech](https://neon.tech) (PostgreSQL gratuito com pgvector)
3. AWS CLI instalado e configurado
4. Par de chaves SSH para EC2

## Passo 1: Configurar Neon.tech (PostgreSQL)

1. Acesse [neon.tech](https://neon.tech) e crie uma conta
2. Crie um novo projeto
3. Na dashboard, copie a connection string
4. No SQL Editor, execute:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
5. Guarde a connection string para uso posterior

## Passo 2: Criar EC2 (Backend)

### Via Console AWS:

1. Acesse EC2 > Instances > Launch Instance
2. Configurações:
   - **Nome:** nlw-agents-backend
   - **AMI:** Amazon Linux 2023
   - **Tipo:** t2.micro (Free Tier)
   - **Par de chaves:** Crie ou selecione existente
   - **Security Group:** Permitir SSH (22), HTTP (80), Custom TCP (3333)
3. Conecte via SSH e execute:

```bash
# Instalar Node.js 22
curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -
sudo yum install -y nodejs git

# Instalar PM2
sudo npm install -g pm2

# Clonar repositório
cd ~
git clone https://github.com/SEU_USUARIO/nlw-agents.git
cd nlw-agents/server

# Configurar ambiente
cp .env.example .env
# Editar .env com suas credenciais

# Instalar dependências e iniciar
npm ci --production
npm run db:migrate
pm2 start npm --name "nlw-agents-api" -- start
pm2 save
pm2 startup
```

## Passo 3: Criar S3 Bucket (Frontend)

### Via Console AWS:

1. Acesse S3 > Create Bucket
2. Configurações:
   - **Nome:** nlw-agents-frontend-RANDOM (deve ser único)
   - **Região:** us-east-1 (recomendado para Free Tier)
   - **Block Public Access:** Desmarcar "Block all public access"
3. Após criar, vá em Properties > Static website hosting > Enable
4. Em Permissions > Bucket Policy, adicione:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::SEU-BUCKET-NAME/*"
    }
  ]
}
```

## Passo 4: Criar CloudFront Distribution

1. Acesse CloudFront > Create Distribution
2. Configurações:
   - **Origin domain:** Selecione seu bucket S3
   - **Viewer protocol policy:** Redirect HTTP to HTTPS
   - **Default root object:** index.html
3. Após criar, adicione Custom Error Response:
   - **Error code:** 404
   - **Response page path:** /index.html
   - **Response code:** 200

## Passo 5: Configurar GitHub Secrets

No seu repositório GitHub, vá em Settings > Secrets and variables > Actions:

### Secrets (valores sensíveis):

| Secret | Descrição |
|--------|-----------|
| `AWS_ACCESS_KEY_ID` | IAM user access key |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key |
| `EC2_HOST` | IP público ou DNS do EC2 |
| `EC2_USERNAME` | ec2-user |
| `EC2_SSH_KEY` | Conteúdo da chave privada SSH |

### Variables (configurações públicas):

| Variable | Descrição | Exemplo |
|----------|-----------|---------|
| `AWS_REGION` | Região AWS | us-east-1 |
| `API_URL` | URL do backend | http://EC2_IP:3333 |
| `S3_BUCKET` | Nome do bucket | nlw-agents-frontend-xyz |
| `CLOUDFRONT_DISTRIBUTION_ID` | ID da distribuição | E1234567890 |

## Passo 6: Criar IAM User para Deploy

1. Acesse IAM > Users > Create User
2. Nome: `github-actions-deploy`
3. Anexar políticas:
   - `AmazonS3FullAccess`
   - `CloudFrontFullAccess`
4. Criar Access Key para uso com GitHub Actions

## Variáveis de Ambiente no EC2

Crie o arquivo `/home/ec2-user/nlw-agents/server/.env`:

```env
PORT=3333
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
GEMINI_API_KEY="sua-chave-gemini"
```

## Verificação

Após o deploy:

1. **Backend:** Acesse `http://EC2_IP:3333/health`
2. **Frontend:** Acesse a URL do CloudFront

## Troubleshooting

### Backend não inicia
```bash
pm2 logs nlw-agents-api
```

### Erro de conexão com banco
- Verifique se o IP do EC2 está na whitelist do Neon.tech
- Confirme que `sslmode=require` está na connection string

### Frontend não carrega rotas
- Verifique a configuração de error pages no CloudFront
- O index.html deve ser retornado para 404s (SPA routing)

## Custos Após Free Tier

| Serviço | Custo Estimado/mês |
|---------|-------------------|
| EC2 t2.micro | ~$8.50 |
| S3 (5GB) | ~$0.12 |
| CloudFront | ~$1-5 |
| Neon.tech Free | $0 |
| **Total** | **~$10-15/mês** |

## Alternativas Mais Econômicas

Para reduzir custos após o Free Tier:

1. **Railway/Render:** Deploy gratuito para aplicações pequenas
2. **Vercel/Netlify:** Frontend gratuito com CI/CD integrado
3. **Neon.tech:** Continua gratuito para PostgreSQL
