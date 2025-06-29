# 🔗 EVM Wallet Authentication UI

A modern React application that integrates Rainbow Kit for wallet connection with EVM Wallet Auth API for secure authentication using Sign-In with Ethereum (SIWE).

## 🚀 Features

- **Wallet Connection**: Easy wallet connection using Rainbow Kit
- **SIWE Authentication**: Secure authentication with Sign-In with Ethereum
- **Profile Management**: User profile access after authentication
- **Modern UI**: Beautiful and responsive user interface
- **Cookie-based Sessions**: Secure session management
- **Error Handling**: Comprehensive error handling and user feedback

## 🛠️ Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- EVM Wallet Auth API running on `http://localhost:8080`

### Installation

1. Clone and install dependencies:
```bash
npm install
```

2. **Important**: Get a WalletConnect Project ID:
   - Visit [WalletConnect Cloud](https://cloud.walletconnect.com/)
   - Create a new project
   - Copy your Project ID
   - Update `src/config/wagmi.ts` and replace `YOUR_PROJECT_ID` with your actual project ID

3. Start the development server:
```bash
npm run dev
```

## 🔧 Configuration

### Wagmi Configuration

Update `src/config/wagmi.ts` with your WalletConnect Project ID:

```typescript
export const config = getDefaultConfig({
  appName: 'EVM Wallet UI',
  projectId: 'your-actual-project-id-here', // Replace this!
  chains: [mainnet, polygon, sepolia],
  ssr: false,
});
```

### API Configuration

The application is configured to work with the EVM Wallet Auth API at `http://localhost:8080/api`. If your API is running on a different URL, update the `API_BASE_URL` constant in `src/contexts/AuthContext.tsx`.

## 🎯 Usage

1. **Connect Wallet**: Click the "Connect Wallet" button to connect your EVM wallet
2. **Authenticate**: After connecting, click "Sign In with Ethereum" to authenticate
3. **View Profile**: Once authenticated, view your profile information
4. **Logout**: Use the logout button to end your session

## 🏗️ Project Structure

```
src/
├── components/
│   └── WalletAuth.tsx          # Main wallet authentication component
├── contexts/
│   └── AuthContext.tsx         # Authentication context and API calls
├── config/
│   └── wagmi.ts               # Wagmi and Rainbow Kit configuration
├── App.tsx                    # Main application component
├── main.tsx                   # Application entry point
└── App.css                    # Styling
```

## 🔌 API Integration

The application integrates with the following API endpoints:

- `GET /api/auth/nonce` - Get authentication nonce
- `POST /api/auth/verify` - Verify SIWE signature
- `GET /api/auth/status` - Check authentication status
- `GET /api/a/profile` - Get user profile (authenticated)
- `POST /api/auth/logout` - Logout user

## 🎨 UI Components

### Authentication Flow

1. **Wallet Connection**: Rainbow Kit's ConnectButton for wallet selection
2. **Authentication Status**: Real-time display of connection and auth status
3. **Profile Display**: User profile information after successful authentication
4. **Error Handling**: User-friendly error messages and loading states

### Styling

The application features a modern gradient design with:
- Responsive layout
- Smooth animations and transitions
- Professional color scheme
- Clear visual hierarchy
- Mobile-friendly design

## 🔐 Security Features

- **SIWE Standard**: Implements Sign-In with Ethereum standard
- **Cookie-based Auth**: Secure HTTP-only cookies for session management
- **Nonce Protection**: Fresh nonce for each authentication attempt
- **Automatic Session Check**: Checks authentication status on app load
- **Error Boundaries**: Proper error handling throughout the flow

## 🧪 Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

## 📦 Dependencies

### Core Dependencies
- `@rainbow-me/rainbowkit` - Wallet connection UI
- `wagmi` - React hooks for Ethereum
- `viem` - TypeScript interface for Ethereum
- `@tanstack/react-query` - Data fetching and caching

### Development Dependencies
- `typescript` - Type safety
- `vite` - Build tool
- `eslint` - Code linting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 Notes

- Make sure your EVM Wallet Auth API is running before testing
- Replace the placeholder WalletConnect Project ID with your actual ID
- The application is configured for mainnet, polygon, and sepolia networks
- All API calls include credentials for cookie-based authentication

## 🆘 Troubleshooting

### Common Issues

1. **"Failed to get nonce"**: Ensure the API server is running on `http://localhost:8080`
2. **Wallet connection issues**: Check that you have a valid WalletConnect Project ID
3. **Authentication failures**: Verify the SIWE message format and API endpoints
4. **CORS errors**: Ensure the API server has proper CORS configuration for `http://localhost:3000`

### Support

If you encounter issues, check:
- Console logs for detailed error messages
- Network tab for failed API requests
- That all dependencies are properly installed
- WalletConnect Project ID is correctly configured
