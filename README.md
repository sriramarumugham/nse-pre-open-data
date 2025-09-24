# NSE Scraper - Headed Mode

## 🚀 Quick Start

### Local (See Browser)
```bash
npm install
node index.js
```

### Docker (Virtual Display)
```bash
docker build -t nse-scraper .
docker run --rm nse-scraper
```

### Docker with VNC (See Browser via Web)
```bash
docker-compose up
# Open http://localhost:6080
# VNC Password: password
```

## 📦 Free Cloud Deployment

### GitHub Codespaces
- Push to GitHub → Open in Codespaces
- Auto-uses `.devcontainer/` config
- Browser view at port 6080
- Free: 120 core-hours/month

### Gitpod
- Push to GitHub → Open with `gitpod.io/#your-repo`
- Uses `.gitpod.yml` config
- Browser preview auto-opens
- Free: 50 hours/month

## 📁 Files

- `index.js` - Scraper (headed mode)
- `Dockerfile` - Basic Xvfb setup
- `Dockerfile.vnc` - VNC web viewer setup
- `docker-compose.yml` - Local VNC testing