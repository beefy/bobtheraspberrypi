# Bob the Raspberry Pi

A comprehensive React-based dashboard for monitoring and managing various aspects of Bob the Raspberry Pi system, including chess games, system monitoring, cryptocurrency tracking, and status updates.

## Features

### 🏗️ Architecture
- **Frontend**: React 18 with modern hooks and context
- **Styling**: Custom CSS with responsive design and glassmorphism effects
- **Deployment**: Google Cloud Platform with CI/CD
- **Containerization**: Docker and Docker Compose

### 📊 Dashboard Sections
- **♟️ Chess**: Game tracking, analysis, and tournament management
- **⚙️ System**: Health monitoring, performance metrics, and logs
- **₿ Crypto**: Portfolio tracking, market analysis, and trading algorithms
- **📊 Status**: Overall system status, service health, and notifications

### 🚀 Deployment Features
- GitHub Actions CI/CD pipeline
- Google Cloud Run deployment
- Compute Engine support
- Docker containerization
- Automated testing and linting

## Quick Start

### Prerequisites
- Node.js 18+ 
- Backend API service
- Docker (optional)
- Google Cloud SDK (for deployment)

### Local Development

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd bobtheraspberrypi
   npm install
   ```

2. **Setup environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Start Backend API** (if running locally)
   ```bash
   # Start your backend API service
   # This should be running on localhost:5000
   ```

4. **Run development server**
   ```bash
   npm start
   ```

5. **Open browser**
   Navigate to `http://localhost:3000`

### Docker Development

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

2. **Access the application**
   - Frontend: `http://localhost:3000`
   - Backend API: `localhost:5000`

## Project Structure

```
bobtheraspberrypi/
├── public/                 # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── Header.js      # Site header
│   │   ├── Navigation.js  # Section navigation
│   │   ├── ChessSection.js
│   │   ├── SystemSection.js
│   │   ├── CryptoSection.js
│   │   ├── StatusSection.js
│   │   └── Footer.js
│   ├── utils/             # Utilities
   │   └── api.js         # Backend API client
│   ├── App.js             # Main application
│   ├── App.css            # Main styles
│   └── index.js           # Entry point
├── .github/workflows/     # GitHub Actions
│   ├── deploy.yml         # Deployment pipeline
│   └── test.yml           # Testing pipeline
├── docker-compose.yml     # Docker services
├── Dockerfile             # Container definition
├── nginx.conf             # Nginx configuration
├── gcp-deployment.yaml    # GCP deployment config
└── package.json           # Dependencies and scripts
```

## API Endpoints

### Backend Services
- `chess/*` - Chess game endpoints
- `system/*` - System monitoring endpoints  
- `crypto/*` - Cryptocurrency endpoints
- `status/*` - Status and activity endpoints

### Example API Responses

**Chess Game:**
```javascript
{
  id: "game-123",
  white: "Player1",
  black: "Player2", 
  result: "1-0",
  moves: ["e4", "e5", "Nf3"],
  createdAt: "2026-02-20T10:00:00Z"
}
```

**System Metrics:**
```javascript
{
  id: "metric-456",
  cpu: { usage: 45.2, temperature: 65, cores: 4 },
  memory: { used: 2048, total: 8192, percentage: 25 },
  disk: { used: 50000, total: 250000, percentage: 20 },
  timestamp: "2026-02-20T10:00:00Z"
}
```

## API Usage

### Chess API
```javascript
import { API } from './utils/api';

// Get recent games
const games = await API.Chess.getGames(10);

// Create new game
const newGame = await API.Chess.createGame({
  white: "Alice",
  black: "Bob", 
  result: "1-0",
  moves: ["e4", "e5"]
});
```

### System API
```javascript
// Get health metrics
const health = await API.System.getHealthMetrics('24h');

// Add system metric
await API.System.addMetric({
  cpu: { usage: 45.2 },
  memory: { used: 2048, total: 8192 }
});
```

## Deployment

### Google Cloud Platform

1. **Setup GCP Project**
   ```bash
   gcloud projects create bob-raspberry-pi
   gcloud config set project bob-raspberry-pi
   ```

2. **Enable APIs**
   ```bash
   gcloud services enable run.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   ```

3. **Setup GitHub Secrets**
   - `GCP_PROJECT_ID`: Your GCP project ID
   - `GCP_SA_KEY`: Service account key JSON
   - `REACT_APP_API_URL`: API endpoint URL

4. **Deploy**
   ```bash
   # Push to main branch triggers deployment
   git push origin main
   ```

### Manual Deployment

1. **Build Docker image**
   ```bash
   docker build -t bob-raspberry-pi .
   ```

2. **Tag and push to GCR**
   ```bash
   docker tag bob-raspberry-pi gcr.io/PROJECT_ID/bob-raspberry-pi
   docker push gcr.io/PROJECT_ID/bob-raspberry-pi
   ```

3. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy bob-raspberry-pi-app \
     --image gcr.io/PROJECT_ID/bob-raspberry-pi \
     --platform managed \
     --allow-unauthenticated
   ```

## Development

### Available Scripts

- `npm start` - Start development server
- `npm test` - Run tests
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

### Testing
```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test
npm test ChessSection.test.js
```

### Linting
```bash
# Check for issues
npm run lint

# Auto-fix issues
npm run lint:fix
```

## Configuration

### Environment Variables
See `.env.example` for all available configuration options.

### API Configuration
Modify API endpoints in `src/utils/api.js`.

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)  
5. Open Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@bobtheraspberrypi.com or open an issue on GitHub.

## Acknowledgments

- React team for the amazing framework
- Backend API teams for reliable services
- Google Cloud for reliable hosting
- The open source community

---

**Built with ❤️ for Bob the Raspberry Pi**
Web dashboard to monitor AI agent activity
