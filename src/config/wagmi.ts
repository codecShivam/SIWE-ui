import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'EVM Wallet UI',
  projectId: 'YOUR_PROJECT_ID', // Replace with your WalletConnect project ID
  chains: [mainnet, polygon, sepolia],
  ssr: false, // If your dApp uses server side rendering (SSR)
}); 