# LinkedIn Connections Dashboard Chrome Extension

A Chrome extension built with TypeScript and Svelte that fetches and displays your LinkedIn connections in a clean, responsive dashboard with advanced filtering and caching capabilities.

## Features

- 🔐 **No Authentication Required** - Uses your existing LinkedIn session
- 📊 **Clean Dashboard** - View connections with profile pictures, names, positions, and companies
- 🔍 **Advanced Filtering** - Filter by name, position, or company
- ⚡ **Smart Caching** - TTL-based caching (5-10 minutes) with separate person/company data caching
- 🚦 **Request Queue & Throttling** - Randomized delays (300-1000ms) to avoid rate limits
- 📱 **Responsive Design** - Built with TailwindCSS for clean, professional UI
- 🔄 **Real-time Status** - Shows queue length and loading states

## Installation

### Option 1: Load as Unpacked Extension (Recommended for development)

1. **Clone and Build**:
   ```bash
   git clone <repository-url>
   cd linkedin-connections-dashboard
   yarn install
   yarn build
   ```

2. **Load in Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the project root directory (containing `manifest.json`)

3. **Grant Permissions**:
   - The extension will request permissions for LinkedIn.com
   - Accept the permissions to enable functionality

### Option 2: Development Mode

For development with hot reload:

```bash
yarn dev  # Watches for changes and rebuilds automatically
```

## Usage

1. **Navigate to LinkedIn**:
   - Open LinkedIn.com and ensure you're logged in
   - The extension icon will become active

2. **Open Dashboard**:
   - Click the extension icon in your Chrome toolbar
   - Or use the keyboard shortcut (if configured)

3. **View Connections**:
   - The dashboard will automatically load your connections
   - Profile pictures, names, positions, and companies are displayed
   - Use the search bar to filter by name or position
   - Use the company dropdown to filter by specific companies

4. **Features**:
   - **Click on any connection** to open their LinkedIn profile
   - **Refresh button** clears cache and reloads data
   - **Load more** button or scroll to bottom to load additional connections
   - **Queue status** shows pending requests in the status bar

## How It Works

### LinkedIn API Reverse Engineering

This extension works by intercepting LinkedIn's internal API calls to access connection data:

1. **Session Extraction**: Uses existing LinkedIn login session (cookies, CSRF tokens)
2. **API Endpoints**: Accesses LinkedIn's internal `/voyager/api/relationships/dash/connections` endpoint
3. **Data Parsing**: Extracts connection information from LinkedIn's internal data structure
4. **Company Information**: Makes additional calls to `/voyager/api/organization/companies/{id}` for company details

**Note**: This approach relies on LinkedIn's current internal API structure, which may change without notice.

### Architecture

- **Content Script** (`content.ts`): Runs on LinkedIn pages, handles API calls with user's session
- **Background Script** (`background.ts`): Manages extension lifecycle and tab communication
- **Popup** (`App.svelte`): Main dashboard UI built with Svelte and TailwindCSS
- **Utilities**:
  - `cache.ts`: TTL-based localStorage caching system
  - `requestQueue.ts`: Throttled request queue with randomized delays
  - `linkedinApi.ts`: LinkedIn API abstraction layer

## Caching Strategy

### Two-Tier Caching System

1. **Connection Data Cache**:
   - **TTL**: 5 minutes
   - **Key**: `connections_{start}_{count}`
   - **Data**: Connection list with basic info

2. **Company Data Cache**:
   - **TTL**: 1 hour (longer since company info changes less frequently)
   - **Key**: `company_{companyId}`
   - **Data**: Company name, logo, industry

### Cache Management

- **Automatic Expiration**: Data expires based on TTL
- **Manual Clear**: Refresh button clears all cached data
- **Storage**: Uses Chrome extension's localStorage API
- **Error Handling**: Graceful fallback if cache operations fail

## Request Queue Implementation

### Throttling Strategy

- **Base Delay**: 300-1000ms randomized delays
- **Human-like Behavior**: Varies request timing to avoid detection
- **Priority Queue**: High-priority requests (connections) processed first
- **Error Handling**: Failed requests don't block the queue

### Queue Features

- **Status Monitoring**: Real-time queue length display
- **Automatic Processing**: Background processing without blocking UI
- **Request Deduplication**: Prevents duplicate requests
- **Graceful Degradation**: Continues working even if some requests fail

## Technical Stack

- **TypeScript**: Full type safety and modern JavaScript features
- **Svelte 3**: Reactive UI framework with minimal bundle size
- **TailwindCSS**: Utility-first CSS framework for rapid styling
- **Webpack**: Module bundling and build optimization
- **Chrome Extension Manifest V3**: Latest extension API standards

## Development

### Project Structure

```
src/
├── background/          # Background script
├── content/            # Content script for LinkedIn integration
├── popup/              # Main dashboard UI (Svelte)
│   ├── components/     # Reusable Svelte components
│   └── styles.css      # TailwindCSS styles
├── types/              # TypeScript type definitions
└── utils/              # Utility modules (cache, queue, API)
```

### Build Commands

```bash
# Development build with watching
yarn dev

# Production build
yarn build

# Type checking
yarn type-check
```

### Configuration Files

- `manifest.json`: Chrome extension configuration
- `webpack.config.js`: Build system configuration
- `tsconfig.json`: TypeScript compiler settings
- `tailwind.config.js`: TailwindCSS customization

## Limitations and Assumptions

### Current Limitations

1. **LinkedIn Dependency**: Requires active LinkedIn session
2. **API Changes**: May break if LinkedIn changes internal APIs
3. **Rate Limits**: Subject to LinkedIn's undocumented rate limiting
4. **Data Availability**: Some connections may have limited public information
5. **Chrome Only**: Currently only supports Chrome (Manifest V3)

### Assumptions

1. **User Authentication**: User is logged into LinkedIn
2. **Connection Privacy**: User's connections are accessible via LinkedIn's API
3. **Browser Compatibility**: Modern Chrome with extension APIs enabled
4. **Network Access**: Stable internet connection for API calls

### Known Issues

- **Company Logos**: Not all companies have logo URLs available
- **Position Data**: Some connections may not have current position information
- **Large Networks**: Initial load may be slow for users with many connections
- **Session Expiry**: May require LinkedIn re-login if session expires

## Security Considerations

- **Data Privacy**: All data remains local to the user's browser
- **No External Servers**: No data is sent to third-party servers
- **Session Security**: Uses existing LinkedIn session cookies securely
- **Minimal Permissions**: Only requests necessary Chrome extension permissions

## Legal Notice

This extension is for educational purposes and personal use only. Users are responsible for ensuring their use complies with LinkedIn's Terms of Service. The extension accesses LinkedIn's internal APIs, which may be subject to change or terms of use restrictions.
