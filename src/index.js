import React from 'react';

import { createRoot } from 'react-dom/client';

import App from './jsx/App.jsx';
import Footer from './jsx/Footer.jsx';

const container = document.getElementById('app-root-2025-tdr_report');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}

const container_footer = document.getElementById('app-root-2025-tdr_report_footer');
if (container_footer) {
  const root_footer = createRoot(container_footer);
  root_footer.render(<Footer />);
}
