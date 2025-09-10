# FinBoard - Customizable Finance Dashboard

A real-time finance monitoring dashboard built with Next.js that allows users to create customizable widgets for tracking stocks, cryptocurrency, and market data from multiple financial APIs.

## 🚀 Live Demo

[Live Link](https://finboard-nine.vercel.app/)

## 📋 Assignment Overview

This project was developed as part of the **Groww Web Intern Assignment** - a customizable finance dashboard that enables users to build their own real-time finance monitoring dashboard by connecting to various financial APIs and displaying data through customizable widgets.

**Developer:** Aditya Kumar Singh

---

## ✨ Implemented Features

### 🎯 Core Features (Completed)

#### 1. **Widget Management System** ✅
- **Add Widgets**: Create finance data widgets by connecting to financial APIs
  - **Table Widgets**: Paginated stock/crypto data with filters and search
  - **Finance Cards**: Watchlist, market gainers, performance metrics
  - **Charts**: Line and area charts for stock price visualization
- **Remove Widgets**: Easy deletion of unwanted widgets
- **Drag & Drop Rearrangement**: Reorder widgets with smooth animations
- **Widget Configuration**: Comprehensive settings panel for each widget

#### 2. **API Integration & Data Handling** ✅
- **Multiple Financial APIs**:
  - Finnhub (Stock market data)
  - Alpha Vantage (Stock quotes and company profiles)
  - CoinGecko (Cryptocurrency data)
  - Exchange Rate API (Currency conversion)
- **Dynamic Data Mapping**: API response explorer to select display fields
- **Auto-refresh**: Configurable refresh intervals (30s - 60min)
- **Data Caching**: Intelligent caching to optimize API calls
- **Error Handling**: Comprehensive error states and retry mechanisms

#### 3. **User Interface & Experience** ✅
- **Responsive Design**: Fully responsive across desktop, tablet, and mobile
- **Dark/Light Theme**: Dynamic theme switching with system preference detection
- **Loading States**: Skeleton loaders and loading indicators
- **Empty States**: Intuitive onboarding and template suggestions
- **Search & Filter**: Real-time widget search functionality

#### 4. **Data Persistence** ✅
- **Browser Storage**: Complete dashboard state persisted in localStorage
- **State Recovery**: Full dashboard restoration on page refresh
- **Widget Configuration Backup**: All settings and layouts saved

#### 5. **Advanced Widget Features** ✅
- **Field Selection Interface**: Interactive JSON explorer for API responses
- **Custom Formatting**: Currency, percentage, and number formatting
- **Widget Naming**: User-defined titles and descriptions
- **Multiple Data Sources**: Easy switching between API endpoints

### 🏆 Bonus Features (Implemented)

#### 1. **Dynamic Theme Switching** ✅
- Seamless light/dark mode toggle
- System preference detection
- Persistent theme settings
- Smooth transitions between themes

#### 2. **Dashboard Templates** ✅
- **Stock Trader Template**: Live quotes, charts, and market summary
- **Crypto Tracker Template**: Cryptocurrency price tracking
- **Market Overview Template**: Quick market conditions overview
- **Template Categories**: Organized template library
- **One-click Apply**: Instant dashboard setup

#### 3. **Enhanced State Management** ✅
- Redux Toolkit for complex application state
- Optimized widget data management
- Efficient re-rendering strategies
- Bulk operations support

---

## 🛠 Tech Stack

### Frontend Framework
- **Next.js 15.5.2** - React framework with App Router
- **React 19.1.0** - Latest React with concurrent features

### Styling & UI
- **Tailwind CSS 4.1.13** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library
- **CSS Custom Properties** - Dynamic theming

### State Management
- **Redux Toolkit 2.9.0** - Predictable state container
- **React Redux 9.2.0** - React bindings for Redux

### Data Visualization
- **Recharts 3.2.0** - Composable charting library built on D3

### Drag & Drop
- **@dnd-kit** - Modern drag and drop toolkit
  - Core, sortable, utilities, and modifiers

### Deployment
- **Vercel** - Optimized for Next.js applications

## 📁 Project Structure

```
finboard/
├── src/
│   ├── app/
│   │   ├── globals.css          # Global styles and themes
│   │   ├── layout.js            # Root layout with providers
│   │   └── page.js              # Main dashboard page
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── draggable-widget.jsx      # Drag & drop widget
│   │   │   ├── droppable-area.jsx        # Drop zones
│   │   │   ├── template-selector.jsx     # Template selection UI
│   │   │   └── widget-card.jsx           # Widget container
│   │   ├── modals/
│   │   │   ├── add-widget-modal.jsx      # Widget creation wizard
│   │   │   ├── api-response-explorer.jsx # API field explorer
│   │   │   ├── dashboard-templates-modal.jsx # Template library
│   │   │   └── widget-settings-modal.jsx # Widget configuration
│   │   ├── providers/
│   │   │   └── redux-provider.jsx        # Redux store provider
│   │   ├── ui/                           # Reusable UI components
│   │   └── widgets/
│   │       ├── card-widget.jsx           # Finance card display
│   │       ├── chart-widget.jsx          # Chart visualization
│   │       ├── table-widget.jsx          # Data table display
│   │       └── widget-renderer.jsx       # Widget type router
│   ├── hooks/
│   │   └── use-theme-sync.js             # Theme synchronization
│   ├── lib/
│   │   ├── api/                          # API client modules
│   │   │   ├── alpha-vantage-client.js
│   │   │   ├── finnhub-client.js
│   │   │   ├── coingecko-client.js
│   │   │   └── exchange-rate-client.js
│   │   ├── config/
│   │   │   └── api-config.js             # API configuration
│   │   ├── store/                        # Redux store setup
│   │   │   ├── index.js
│   │   │   ├── hooks.js
│   │   │   └── slices/
│   │   │       ├── widgets-slice.js      # Widget state management
│   │   │       ├── settings-slice.js     # App settings
│   │   │       └── layout-slice.js       # Layout state
│   │   ├── dashboard-templates.js        # Template definitions
│   │   ├── data-service.js              # Data fetching service
│   │   ├── storage-service.js           # LocalStorage utilities
│   │   ├── utils.js                     # Helper functions
│   │   └── widget-configs.js            # Widget configurations
│   └── ...
├── package.json
├── next.config.mjs
├── tailwind.config.js
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- API keys for financial services

### Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd finboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_FINNHUB_API_KEY=your_finnhub_api_key
   NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key
   NEXT_PUBLIC_COINGECKO_API_KEY=your_coingecko_api_key
   NEXT_PUBLIC_EXCHANGE_RATE_API_KEY=your_exchange_rate_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

---

### API Keys Setup

#### Finnhub (Primary Stock Data)
1. Visit [Finnhub.io](https://finnhub.io)
2. Create a free account
3. Get your API key from the dashboard
4. Free tier: 60 calls/minute

#### Alpha Vantage (Stock Data)
1. Visit [Alpha Vantage](https://www.alphavantage.co)
2. Get a free API key
3. Free tier: 25 calls/day

#### CoinGecko (Crypto Data)
1. Visit [CoinGecko](https://www.coingecko.com/en/api)
2. Free tier available without API key
3. Pro tier for higher limits

---

## 🐛 Known Issues & Limitations

### API Limitations
- **Rate Limits**: Free tier APIs have request limitations
- **CORS Issues**: Some APIs require proxy for browser requests

### Technical Limitations
- **Browser Storage**: LocalStorage has size limitations
- **Mobile Performance**: Large datasets may impact mobile performance
- **Real-time Updates**: Currently polling-based, not true real-time

## 📞 Contact

**Aditya Kumar Singh**
- Email: singh.adityakr26@gmail.com
- GitHub: [AdityaKrSingh26](https://github.com/AdityaKrSingh26)
- LinkedIn: [Connect with me](https://linkedin.com/in/adityakrsingh26)