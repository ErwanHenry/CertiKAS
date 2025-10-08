# 🚂 Déploiement CertiKAS sur Railway

**Guide complet de déploiement en 5 minutes**

---

## ✅ Prérequis

- [x] Railway CLI installé (v4.10.0)
- [x] Code sur GitHub (https://github.com/ErwanHenry/CertiKAS)
- [x] Compte Railway (gratuit - créer sur https://railway.app)

---

## 📋 Étape 1 : Authentification Railway

### Méthode A : Via CLI (Recommandé)

```bash
cd ~/claude-projects/CertiKAS
railway login
```

Cela ouvrira votre navigateur pour l'authentification GitHub.

### Méthode B : Via Dashboard (Plus simple)

1. Aller sur https://railway.app
2. Cliquer "Login with GitHub"
3. Autoriser Railway

---

## 📋 Étape 2 : Créer le Projet

### Option 1 : Via CLI

```bash
cd ~/claude-projects/CertiKAS
railway init
# Choisir "Empty Project"
# Nommer: certikas
```

### Option 2 : Via Dashboard (Recommandé pour débutants)

1. Aller sur https://railway.app/new
2. Cliquer "Deploy from GitHub repo"
3. Sélectionner `ErwanHenry/CertiKAS`
4. Railway détecte automatiquement Node.js !

---

## 📋 Étape 3 : Configuration Automatique

Railway détecte automatiquement :
- ✅ `package.json` → Install command: `npm install`
- ✅ `"start": "node src/server.js"` → Start command
- ✅ Node.js 18+
- ✅ Port dynamique

**Aucune configuration manuelle nécessaire !**

---

## 📋 Étape 4 : Variables d'Environnement

### Via Dashboard

1. Dans votre projet Railway
2. Onglet "Variables"
3. Ajouter ces variables :

```bash
# Obligatoires
NODE_ENV=production
MOCK_BLOCKCHAIN=true

# Optionnelles (pour production réelle)
KASPA_NODE_URL=https://api.kaspa.org
KASPA_WALLET_ADDRESS=votre_wallet
KASPA_PRIVATE_KEY=votre_clé_privée
KASPLEX_ENABLED=false
JWT_SECRET=générer_32_caractères_aléatoires
```

### Via CLI

```bash
railway variables set NODE_ENV=production
railway variables set MOCK_BLOCKCHAIN=true
```

---

## 📋 Étape 5 : Déployer !

### Via Dashboard (Automatique)

Dès que vous connectez le repo GitHub, Railway déploie automatiquement !

### Via CLI

```bash
cd ~/claude-projects/CertiKAS
railway up
```

**Temps de déploiement : 1-2 minutes**

---

## 🎉 Étape 6 : Obtenir l'URL

### Via Dashboard

1. Aller dans votre projet
2. Onglet "Settings"
3. Section "Domains"
4. Cliquer "Generate Domain"

Vous obtiendrez une URL comme : `certikas-production.up.railway.app`

### Via CLI

```bash
railway open
```

Ouvre le dashboard du projet dans le navigateur.

---

## ✅ Vérification

Une fois déployé, testez :

```bash
# Health check
curl https://certikas-production.up.railway.app/health

# Devrait retourner :
{
  "status": "healthy",
  "timestamp": "2025-10-08T...",
  "version": "1.0.0",
  "services": {
    "kaspa": { ... },
    "kasplex": { ... }
  }
}

# API Statistics
curl https://certikas-production.up.railway.app/api/v1/statistics

# Frontend
open https://certikas-production.up.railway.app
```

---

## 🌐 Domaine Personnalisé

### Ajouter certikas.org

1. Dans Railway Dashboard → Settings → Domains
2. Cliquer "Custom Domain"
3. Entrer : `certikas.org`
4. Railway donne des records DNS :

```
Type: CNAME
Name: @
Value: certikas-production.up.railway.app
```

5. Aller chez votre registrar (Namecheap, GoDaddy, etc.)
6. Ajouter le record CNAME
7. Attendre 5-30 minutes pour propagation DNS

Railway génère automatiquement le certificat SSL !

---

## 📊 Monitoring

### Via Dashboard

- **Logs en temps réel** : Onglet "Deployments" → "View Logs"
- **Métriques** : CPU, RAM, Requêtes/sec
- **Alerts** : Email si déploiement échoue

### Via CLI

```bash
# Logs en direct
railway logs

# Informations projet
railway status
```

---

## 💰 Coûts

### Plan Gratuit (Hobby)
- ✅ 500 heures/mois
- ✅ 5$ de crédit gratuit/mois
- ✅ 1 GB RAM
- ✅ 1 GB disque
- ✅ Déploiements illimités

**Suffisant pour commencer !**

### Plan Pro (5$/mois + usage)
- ✅ Illimité
- ✅ 8 GB RAM max
- ✅ Bases de données
- ✅ Support prioritaire

---

## 🔧 Dépannage

### Build échoue

```bash
# Vérifier les logs
railway logs

# Erreur commune : dépendances manquantes
# Solution : Vérifier package.json
```

### App crash au démarrage

```bash
# Vérifier les variables d'environnement
railway variables

# Ajouter MOCK_BLOCKCHAIN si absent
railway variables set MOCK_BLOCKCHAIN=true
```

### Port incorrect

Railway assigne automatiquement le port via `process.env.PORT`.

Vérifier dans `src/server.js` :
```javascript
const PORT = process.env.PORT || 3000;
```

---

## 🚀 Déploiements Automatiques

Railway redéploie automatiquement à chaque push sur `main` !

```bash
cd ~/claude-projects/CertiKAS

# Faire des modifications
git add .
git commit -m "Update feature"
git push

# Railway déploie automatiquement en ~2 min
```

---

## 🎯 Commandes Utiles

```bash
# Voir tous les projets
railway list

# Lier un projet local
railway link

# Ouvrir le dashboard
railway open

# Voir les logs
railway logs

# Exécuter commande dans l'environnement Railway
railway run npm test

# Variables d'environnement
railway variables
railway variables set KEY=value
railway variables delete KEY

# Redéployer
railway up

# Supprimer le projet
railway delete
```

---

## 📚 Ressources

- **Dashboard:** https://railway.app/dashboard
- **Documentation:** https://docs.railway.app
- **Discord Support:** https://discord.gg/railway
- **Status:** https://status.railway.app

---

## ✅ Checklist Finale

Une fois déployé :

- [ ] Health check fonctionne (`/health`)
- [ ] API répond (`/api/v1/statistics`)
- [ ] Frontend accessible
- [ ] Variables d'environnement configurées
- [ ] Domaine personnalisé ajouté (optionnel)
- [ ] Monitoring activé
- [ ] Logs vérifiés

---

## 🎉 Prochaines Étapes

Après le déploiement :

1. **Partager l'URL** sur Discord Kaspa
2. **Tweeter** l'annonce (ANNOUNCEMENT_TWEET.md)
3. **Poster sur Reddit** r/kaspa
4. **Ajouter au README** le badge "Deployed on Railway"
5. **Configurer analytics** (optionnel)

---

**Temps total de déploiement : 5 minutes** ⏱️

**Difficulté : ⭐ Facile**

---

## 💡 Pourquoi Railway > Vercel pour CertiKAS ?

| Critère | Railway | Vercel |
|---------|---------|--------|
| **Express.js natif** | ✅ Oui | ❌ Serverless only |
| **ES6 modules** | ✅ Supporte | ⚠️ Configuration complexe |
| **Déploiement** | ✅ 1 commande | ❌ Échec (7 tentatives) |
| **PostgreSQL** | ✅ Intégré | ⚠️ Externe requis |
| **Logs en temps réel** | ✅ Natifs | ⚠️ Limités |
| **Prix** | 💰 5$/mois | 💰 20$/mois |

**Railway est le choix évident pour CertiKAS ! 🚂**

---

**Besoin d'aide ? Ouvrez une issue sur GitHub !**

https://github.com/ErwanHenry/CertiKAS/issues
