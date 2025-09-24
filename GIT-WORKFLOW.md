# Git Flow Workflow - Chatinho

## Estrutura de Branches

### Branches Principais
- **`main`** - Produção (sempre deployável)
- **`develop`** - Desenvolvimento integrado (próxima release)

### Branches de Suporte
- **`maint/X.Y`** - Manutenção de versões específicas (ex: `maint/1.0`, `maint/2.1`)
- **`release/X.Y.Z-rc.N`** - Preparação de releases (ex: `release/2.0.0-rc.1`)
- **`feature/nome-da-feature`** - Desenvolvimento de funcionalidades
- **`hotfix/nome-do-fix`** - Correções urgentes de produção

## Fluxo de Trabalho

### 1. Desenvolvimento de Features
```bash
# Criar feature branch a partir de develop
git checkout develop
git pull origin develop
git checkout -b feature/nova-funcionalidade

# Após desenvolvimento
git checkout develop
git merge --no-ff feature/nova-funcionalidade
git push origin develop
git branch -d feature/nova-funcionalidade
```

### 2. Preparação de Release
```bash
# Criar release candidate
git checkout develop
git checkout -b release/2.0.0-rc.1

# Ajustes finais, testes, documentação
# Criar tag anotada para RC
git tag -a v2.0.0-rc.1 -m "Release Candidate 2.0.0-rc.1

Features:
- Multi-tenancy support
- Enhanced webhook system
- Docker optimization

Testing required before final release."

# Finalizar release
git checkout main
git merge --no-ff release/2.0.0-rc.1
git tag -a v2.0.0 -m "Release 2.0.0 - Multi-tenant Architecture

🚀 New Features:
- Multi-tenant SaaS architecture
- Enhanced webhook integration
- Improved Docker containerization
- Advanced security features

🔧 Improvements:
- Performance optimizations
- Better error handling
- Enhanced testing suite

🐛 Bug Fixes:
- Socket.IO connection stability
- Memory leak fixes
- Security vulnerabilities"

# Back-merge para develop
git checkout develop
git merge --no-ff main
git push origin main develop --tags

# Limpar branch de release
git branch -d release/2.0.0-rc.1
git push origin --delete release/2.0.0-rc.1
```

### 3. Hotfixes de Produção
```bash
# Criar hotfix a partir de main (produção atual)
git checkout main
git pull origin main
git checkout -b hotfix/correcao-critica

# Após correção
git checkout main
git merge --no-ff hotfix/correcao-critica
git tag -a v1.0.1 -m "Hotfix 1.0.1

🐛 Critical Fix:
- Security vulnerability patch
- Database connection fix"

# Back-merge para develop
git checkout develop
git merge --no-ff main

# Para versões específicas em manutenção
git checkout maint/1.0
git merge --no-ff hotfix/correcao-critica

git push origin main develop maint/1.0 --tags
git branch -d hotfix/correcao-critica
```

### 4. Manutenção de Versões Legadas
```bash
# Hotfix específico para versão em manutenção
git checkout maint/1.0
git checkout -b hotfix/fix-v1.0

# Após correção
git checkout maint/1.0
git merge --no-ff hotfix/fix-v1.0
git tag -a v1.0.2 -m "Maintenance Release 1.0.2 - Security Update"

git push origin maint/1.0 --tags
git branch -d hotfix/fix-v1.0
```

## Convenções de Tags

### Formato SemVer
- **Major**: `v2.0.0` - Mudanças incompatíveis
- **Minor**: `v2.1.0` - Novas funcionalidades compatíveis
- **Patch**: `v2.1.1` - Correções de bugs

### Release Candidates
- **RC**: `v2.0.0-rc.1`, `v2.0.0-rc.2`

### Tags Anotadas Obrigatórias
Todas as tags de release devem ser anotadas com:
- Resumo das mudanças
- Lista de features
- Lista de correções
- Notas de breaking changes (se houver)

## Automação via GitHub Actions

### Triggers por Tags
- **v***: Deploy para produção
- **v*-rc.***: Deploy para staging
- **v*-beta.***: Deploy para ambiente de testes

### Validações Automáticas
- Testes unitários e integração
- Lint e análise de código
- Build e testes de Docker
- Verificação de segurança

## Exemplo de Estrutura Atual

```
main (v1.0.0) ────────────────── (produção)
     │                            ↑
     │                         hotfix/
     │                            │
maint/1.0 ─────────────────────── (manutenção v1.0)
     │
     │
develop ──── feature/multitenancy ── (desenvolvimento v2.0)
     │            │
     │            └── release/2.0.0-rc.1
     │
     └── merge back após releases
```

## Comandos Úteis

```bash
# Ver estrutura de branches
git log --oneline --graph --all

# Ver todas as tags
git tag -l -n1

# Ver informações de tag anotada
git show v1.0.0

# Verificar status dos branches
git branch -vv
```