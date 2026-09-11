import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import '../src/styles.css';
import './styles.css';

document.documentElement.classList.add('ray-scrollbar');
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
