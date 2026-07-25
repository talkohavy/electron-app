import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './components/App';
import DarkThemeProvider from './providers/DarkThemeProvider';
import './common/styles/main.css';
import './common/styles/toast.css';
import './index.css';

// eslint-disable-next-line
function Client() {
  return (
    <StrictMode>
      <BrowserRouter>
        <DarkThemeProvider>
          <App />
        </DarkThemeProvider>
      </BrowserRouter>
    </StrictMode>
  );
}

const rootElement = document.getElementById('root')!;
const root = createRoot(rootElement);
root.render(<Client />);
