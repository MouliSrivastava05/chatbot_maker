(function() {
  // 1. Locate the widget script tag and extract configuration
  const scriptTag = document.querySelector('script[src*="widget.js"]');
  if (!scriptTag) {
    console.error('ChatBot Maker Widget: Script tag not found.');
    return;
  }

  const botName = scriptTag.getAttribute('data-bot-name');
  if (!botName) {
    console.error('ChatBot Maker Widget: "data-bot-name" attribute is required.');
    return;
  }

  // 2. Resolve target baseUrl from script src (e.g. localhost or custom Vercel domain)
  let baseUrl = 'http://localhost:3000';
  try {
    const url = new URL(scriptTag.src);
    baseUrl = url.origin;
  } catch (e) {
    console.warn('ChatBot Maker Widget: Failed to resolve origin from script src. Using localhost fallback.', e);
  }

  // 3. Prevent multiple widgets on the same page
  if (document.getElementById('nexcraft-chat-widget-root')) {
    return;
  }

  // 4. Create containers and inject styles
  const widgetRoot = document.createElement('div');
  widgetRoot.id = 'nexcraft-chat-widget-root';
  document.body.appendChild(widgetRoot);

  const styleTag = document.createElement('style');
  styleTag.innerHTML = `
    #nexcraft-chat-widget-root {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }
    
    .nexcraft-widget-launcher {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      box-shadow: 0 4px 16px rgba(79, 70, 229, 0.4);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      border: none;
      outline: none;
    }

    .nexcraft-widget-launcher:hover {
      transform: scale(1.1) rotate(5deg);
      box-shadow: 0 6px 20px rgba(79, 70, 229, 0.5);
    }

    .nexcraft-widget-launcher svg {
      width: 28px;
      height: 28px;
      fill: none;
      stroke: #ffffff;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
      transition: transform 0.3s ease;
    }

    .nexcraft-widget-launcher.open svg {
      transform: rotate(90deg);
    }

    .nexcraft-widget-container {
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 380px;
      height: 580px;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
      background: #ffffff;
      overflow: hidden;
      display: none;
      opacity: 0;
      transform: translateY(20px) scale(0.95);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: none;
    }

    .nexcraft-widget-container.open {
      display: block;
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }

    .nexcraft-widget-iframe {
      width: 100%;
      height: 100%;
      border: none;
      margin: 0;
      padding: 0;
      display: block;
    }

    @media (max-width: 450px) {
      #nexcraft-chat-widget-root {
        bottom: 10px;
        right: 10px;
      }
      .nexcraft-widget-container {
        position: fixed;
        top: 10px;
        left: 10px;
        right: 10px;
        bottom: 80px;
        width: auto;
        height: auto;
      }
    }
  `;
  widgetRoot.appendChild(styleTag);

  // 5. Create Widget Launcher button
  const launcher = document.createElement('button');
  launcher.className = 'nexcraft-widget-launcher';
  launcher.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="nexcraft-launcher-icon">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  `;
  widgetRoot.appendChild(launcher);

  // 6. Create Iframe Container
  const container = document.createElement('div');
  container.className = 'nexcraft-widget-container';
  
  // Build the URL for the Next.js widget page
  const widgetUrl = `${baseUrl}/widget/${encodeURIComponent(botName)}`;
  
  const iframe = document.createElement('iframe');
  iframe.className = 'nexcraft-widget-iframe';
  iframe.src = widgetUrl;
  iframe.title = `Chatbot ${botName}`;
  iframe.allow = 'clipboard-write'; // Let visitors copy bot code blocks
  
  container.appendChild(iframe);
  widgetRoot.appendChild(container);

  // 7. Toggle Open/Close logic
  let isOpen = false;
  launcher.addEventListener('click', function() {
    isOpen = !isOpen;
    if (isOpen) {
      launcher.classList.add('open');
      container.classList.add('open');
      // Change icon to 'X' close icon
      launcher.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="nexcraft-launcher-icon">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `;
    } else {
      launcher.classList.remove('open');
      container.classList.remove('open');
      // Restore standard chat icon
      launcher.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="nexcraft-launcher-icon">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      `;
    }
  });
})();
