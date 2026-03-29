"use client";

import { useState, useEffect, useMemo } from "react";
import { RefreshCw, ExternalLink, Smartphone, Monitor, Tablet } from "lucide-react";

interface LivePreviewProps {
    files: Record<string, string>;
    projectName: string;
}

type DeviceSize = "mobile" | "tablet" | "desktop";

const deviceSizes = {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: "100%", height: "100%" },
};

export function LivePreview({ files, projectName }: LivePreviewProps) {
    const [deviceSize, setDeviceSize] = useState<DeviceSize>("desktop");
    const [key, setKey] = useState(0);

    // Generate HTML content for preview
    const previewHtml = useMemo(() => {
        // Find the main page file
        const pageFile = files["src/app/page.tsx"] ||
            files["app/page.tsx"] ||
            files["pages/index.tsx"] ||
            files["src/pages/index.tsx"] ||
            Object.values(files)[0] || "";

        // Find CSS files
        const cssFiles = Object.entries(files).filter(([path]) => path.endsWith(".css"));
        const cssContent = cssFiles.map(([, content]) => content).join("\n");

        // Create a simple HTML document that renders the component
        return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }
    ${cssContent}
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    // Mock components and hooks
    const useState = React.useState;
    const useEffect = React.useEffect;
    const useMemo = React.useMemo;
    const useCallback = React.useCallback;
    const useRef = React.useRef;
    
    // Mock Next.js components
    const Link = ({ href, children, className }) => 
      React.createElement('a', { href, className }, children);
    const Image = ({ src, alt, width, height, className }) => 
      React.createElement('img', { src: src || 'https://via.placeholder.com/' + (width || 100), alt, width, height, className });
    
    // Mock lucide-react icons
    const createIcon = (path) => ({ className, size = 24 }) => 
      React.createElement('svg', { 
        className, 
        width: size, 
        height: size, 
        viewBox: '0 0 24 24', 
        fill: 'none', 
        stroke: 'currentColor', 
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
      }, React.createElement('path', { d: path }));
    
    const Search = createIcon('M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z');
    const Menu = createIcon('M4 6h16M4 12h16M4 18h16');
    const X = createIcon('M18 6L6 18M6 6l12 12');
    const ChevronRight = createIcon('M9 18l6-6-6-6');
    const Star = createIcon('M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z');
    const Heart = createIcon('M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z');
    const User = createIcon('M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z');
    const ShoppingCart = createIcon('M9 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM20 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6');
    const Clock = createIcon('M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v6l4 2');
    const Utensils = createIcon('M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7');
    const Sparkles = createIcon('M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3zM5 19l1 3 1-3 3-1-3-1-1-3-1 3-3 1 3 1z');
    const ArrowRight = createIcon('M5 12h14M12 5l7 7-7 7');
    const Check = createIcon('M20 6L9 17l-5-5');
    const Play = createIcon('M5 3l14 9-14 9V3z');
    
    // Simple App component with fallback UI
    function App() {
      const [loaded, setLoaded] = React.useState(false);
      
      React.useEffect(() => {
        setLoaded(true);
      }, []);
      
      return React.createElement('div', { 
        className: 'min-h-screen bg-white'
      },
        // Hero Section
        React.createElement('nav', {
          className: 'flex items-center justify-between px-6 py-4 bg-white shadow-sm'
        },
          React.createElement('div', { className: 'flex items-center gap-2' },
            React.createElement(Sparkles, { className: 'w-6 h-6 text-purple-600' }),
            React.createElement('span', { className: 'text-xl font-bold text-gray-900' }, '${projectName}')
          ),
          React.createElement('div', { className: 'hidden md:flex items-center gap-6' },
            React.createElement('a', { href: '#', className: 'text-gray-600 hover:text-gray-900' }, 'Features'),
            React.createElement('a', { href: '#', className: 'text-gray-600 hover:text-gray-900' }, 'Pricing'),
            React.createElement('a', { href: '#', className: 'text-gray-600 hover:text-gray-900' }, 'About'),
            React.createElement('button', { 
              className: 'px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors'
            }, 'Get Started')
          )
        ),
        
        // Hero
        React.createElement('section', {
          className: 'px-6 py-20 text-center bg-gradient-to-br from-purple-50 to-pink-50'
        },
          React.createElement('h1', { 
            className: 'text-5xl font-bold text-gray-900 mb-6 animate-fade-in'
          }, 'Build Your MVP in Minutes'),
          React.createElement('p', { 
            className: 'text-xl text-gray-600 mb-8 max-w-2xl mx-auto'
          }, 'AI-powered development platform that turns your ideas into production-ready applications.'),
          React.createElement('div', { className: 'flex gap-4 justify-center' },
            React.createElement('button', { 
              className: 'px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2'
            }, 'Start Building', React.createElement(ArrowRight, { className: 'w-4 h-4' })),
            React.createElement('button', { 
              className: 'px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors flex items-center gap-2'
            }, React.createElement(Play, { className: 'w-4 h-4' }), 'Watch Demo')
          )
        ),
        
        // Features
        React.createElement('section', {
          className: 'px-6 py-16 bg-white'
        },
          React.createElement('h2', { className: 'text-3xl font-bold text-center text-gray-900 mb-12' }, 'Features'),
          React.createElement('div', { className: 'grid md:grid-cols-3 gap-8 max-w-5xl mx-auto' },
            ['AI-Powered', 'Fast Deployment', 'Full Control'].map((title, i) => 
              React.createElement('div', { 
                key: i, 
                className: 'p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors'
              },
                React.createElement('div', { 
                  className: 'w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4'
                }, React.createElement(Sparkles, { className: 'w-6 h-6 text-purple-600' })),
                React.createElement('h3', { className: 'text-xl font-semibold text-gray-900 mb-2' }, title),
                React.createElement('p', { className: 'text-gray-600' }, 
                  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor.'
                )
              )
            )
          )
        ),
        
        // Footer
        React.createElement('footer', {
          className: 'px-6 py-8 bg-gray-900 text-gray-400 text-center'
        },
          React.createElement('p', null, '© 2024 ${projectName}. Built with Builto.')
        )
      );
    }
    
    ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
  </script>
</body>
</html>`;
    }, [files, projectName]);

    const handleRefresh = () => {
        setKey((k) => k + 1);
    };

    const size = deviceSizes[deviceSize];

    return (
        <div className="h-full flex flex-col bg-[#1a1a1a]">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#2a2a2a] bg-[#0f0f0f]">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setDeviceSize("mobile")}
                        className={`p-1.5 rounded transition-colors ${deviceSize === "mobile" ? "bg-[#2a2a2a] text-lime-400" : "text-[#666] hover:text-white"
                            }`}
                        title="Mobile"
                    >
                        <Smartphone className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setDeviceSize("tablet")}
                        className={`p-1.5 rounded transition-colors ${deviceSize === "tablet" ? "bg-[#2a2a2a] text-lime-400" : "text-[#666] hover:text-white"
                            }`}
                        title="Tablet"
                    >
                        <Tablet className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setDeviceSize("desktop")}
                        className={`p-1.5 rounded transition-colors ${deviceSize === "desktop" ? "bg-[#2a2a2a] text-lime-400" : "text-[#666] hover:text-white"
                            }`}
                        title="Desktop"
                    >
                        <Monitor className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleRefresh}
                        className="p-1.5 rounded text-[#666] hover:text-white hover:bg-[#2a2a2a] transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                        className="p-1.5 rounded text-[#666] hover:text-white hover:bg-[#2a2a2a] transition-colors"
                        title="Open in new tab"
                    >
                        <ExternalLink className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Preview Frame */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-4">
                <div
                    className={`bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300 ${deviceSize !== "desktop" ? "border-8 border-[#333] rounded-[2rem]" : ""
                        }`}
                    style={{
                        width: typeof size.width === "number" ? `${size.width}px` : size.width,
                        height: typeof size.height === "number" ? `${size.height}px` : size.height,
                        maxWidth: "100%",
                        maxHeight: "100%",
                    }}
                >
                    <iframe
                        key={key}
                        srcDoc={previewHtml}
                        className="w-full h-full border-0"
                        title="Preview"
                        sandbox="allow-scripts"
                    />
                </div>
            </div>
        </div>
    );
}
