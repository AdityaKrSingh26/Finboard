// Dashboard Templates for FinBoard
// Simple templates for common dashboard layouts - Simplified to 3 templates

export const DASHBOARD_TEMPLATES = {
  'stock-trader': {
    id: 'stock-trader',
    name: 'Stock Trader',
    description: 'Perfect for active stock trading with live quotes and charts',
    icon: '📈',
    category: 'Trading',
    widgets: [
      {
        type: 'table',
        title: 'Live Stock Quotes',
        config: {
          dataSource: 'stocks',
          displayFields: ['symbol', 'c', 'd', 'dp', 'h', 'l', 'o'],
          columns: [
            { key: 'symbol', label: 'Symbol', width: '15%', type: 'text' },
            { key: 'c', label: 'Current Price', width: '15%', type: 'currency' },
            { key: 'd', label: 'Change', width: '15%', type: 'number' },
            { key: 'dp', label: 'Change %', width: '15%', type: 'percentage' },
            { key: 'h', label: 'High', width: '15%', type: 'currency' },
            { key: 'l', label: 'Low', width: '15%', type: 'currency' },
            { key: 'o', label: 'Open', width: '10%', type: 'currency' }
          ],
          sortBy: 'dp',
          sortOrder: 'desc',
          refreshInterval: 120, // 2 minutes for templates
          itemsPerPage: 15,
          symbols: ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'AMZN', 'META']
        }
      },
      {
        type: 'chart',
        title: 'AAPL Price Chart',
        config: {
          dataSource: 'chart_data',
          displayFields: ['date', 'open', 'high', 'low', 'close', 'volume'],
          refreshInterval: 180, // 3 minutes for chart data
          chartType: 'line',
          timeframe: 'daily',
          symbol: 'AAPL'
        }
      },
      {
        type: 'card',
        title: 'Market Summary',
        config: {
          dataSource: 'market_summary',
          displayFields: ['gainers', 'losers', 'watchlist'],
          refreshInterval: 180,
          cardType: 'summary'
        }
      }
    ]
  },

  'crypto-tracker': {
    id: 'crypto-tracker',
    name: 'Crypto Tracker',
    description: 'Track cryptocurrency prices and market trends',
    icon: '₿',
    category: 'Crypto',
    widgets: [
      {
        type: 'table',
        title: 'Top Cryptocurrencies',
        config: {
          dataSource: 'crypto',
          displayFields: ['symbol', 'name', 'current_price', 'price_change_24h', 'price_change_percentage_24h', 'market_cap'],
          columns: [
            { key: 'symbol', label: 'Symbol', width: '15%', type: 'text' },
            { key: 'name', label: 'Name', width: '25%', type: 'text' },
            { key: 'current_price', label: 'Price', width: '15%', type: 'currency' },
            { key: 'price_change_24h', label: '24h Change', width: '15%', type: 'number' },
            { key: 'price_change_percentage_24h', label: '24h %', width: '15%', type: 'percentage' },
            { key: 'market_cap', label: 'Market Cap', width: '15%', type: 'currency' }
          ],
          sortBy: 'market_cap',
          sortOrder: 'desc',
          refreshInterval: 180,
          itemsPerPage: 20
        }
      }
    ]
  },



  'market-overview': {
    id: 'market-overview',
    name: 'Market Overview',
    description: 'Get a quick overview of market conditions and trends',
    icon: '📊',
    category: 'Overview',
    widgets: [
      {
        type: 'table',
        title: 'Market Movers',
        config: {
          dataSource: 'stocks',
          displayFields: ['symbol', 'c', 'd', 'dp'],
          columns: [
            { key: 'symbol', label: 'Symbol', width: '25%', type: 'text' },
            { key: 'c', label: 'Price', width: '25%', type: 'currency' },
            { key: 'd', label: 'Change', width: '25%', type: 'number' },
            { key: 'dp', label: 'Change %', width: '25%', type: 'percentage' }
          ],
          sortBy: 'dp',
          sortOrder: 'desc',
          refreshInterval: 180,
          itemsPerPage: 10,
          symbols: ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'AMZN', 'META', 'NFLX']
        }
      },
      {
        type: 'card',
        title: 'Market Summary',
        config: {
          dataSource: 'market_summary',
          displayFields: ['gainers', 'losers', 'watchlist'],
          refreshInterval: 180,
          cardType: 'summary'
        }
      }
    ]
  }
}

// Template categories for filtering
export const TEMPLATE_CATEGORIES = [
  { id: 'all', label: 'All Templates', icon: '📋' },
  { id: 'Trading', label: 'Trading', icon: '📈' },
  { id: 'Crypto', label: 'Crypto', icon: '₿' },
  { id: 'Overview', label: 'Overview', icon: '📊' }
]

// Helper function to apply template to dashboard
export function applyTemplate(templateId) {
  const template = DASHBOARD_TEMPLATES[templateId]
  if (!template) {
    console.error('Template not found:', templateId)
    return []
  }

  // Create widgets from template with unique IDs and optimized settings
  const widgets = template.widgets.map((widgetTemplate, index) => ({
    id: `widget-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
    type: widgetTemplate.type,
    title: widgetTemplate.title,
    config: {
      refreshInterval: 120, // Longer refresh interval for templates (2 minutes)
      displayFields: [],
      ...widgetTemplate.config
    },
    position: { x: 0, y: index * 6 },
    size: { 
      width: widgetTemplate.type === 'chart' ? 6 : 12, 
      height: widgetTemplate.type === 'card' ? 4 : 6 
    },
    data: null,
    loading: false,
    error: null,
    lastUpdated: null
  }))

  return widgets
}

// Get templates by category
export function getTemplatesByCategory(categoryId) {
  if (categoryId === 'all') {
    return Object.values(DASHBOARD_TEMPLATES)
  }
  
  return Object.values(DASHBOARD_TEMPLATES).filter(
    template => template.category === categoryId
  )
}

// Get template by ID
export function getTemplate(templateId) {
  return DASHBOARD_TEMPLATES[templateId]
}

// Get template suggestions based on existing widgets
export function getTemplateSuggestions(existingWidgets) {
  if (existingWidgets.length === 0) {
    return [
      DASHBOARD_TEMPLATES['market-overview'],
      DASHBOARD_TEMPLATES['stock-trader']
    ]
  }

  // Simple logic: suggest templates that complement existing widgets
  const hasStockWidgets = existingWidgets.some(w => w.config?.dataSource === 'stocks')
  const hasCryptoWidgets = existingWidgets.some(w => w.config?.dataSource === 'crypto')
  
  if (hasStockWidgets && !hasCryptoWidgets) {
    return [DASHBOARD_TEMPLATES['crypto-tracker']]
  }
  
  if (hasCryptoWidgets && !hasStockWidgets) {
    return [DASHBOARD_TEMPLATES['stock-trader']]
  }
  
  return [DASHBOARD_TEMPLATES['market-overview']]
}
