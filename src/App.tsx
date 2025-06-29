import './App.css';
import WalletAuth from './components/WalletAuth';

function App() {
  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <h1>🔗 EVM Wallet Authentication</h1>
          <p>Connect your wallet and authenticate with Sign-In with Ethereum (SIWE)</p>
        </header>
        
        <main className="main-content">
          <WalletAuth />
        </main>
      </div>
    </div>
  );
}

export default App;
