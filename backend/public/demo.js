// Demo Page JavaScript - CSP Compliant (External JS)

(function() {
  'use strict';

  // Wait for widget script to load
  function initWidget() {
    if (typeof PriceDropWidget === 'undefined') {
      console.error('PriceDropWidget not loaded');
      return;
    }

    // Create demo product data
    const demoProduct = {
      name: 'Premium Wireless Headphones - Noise Cancelling',
      price: '$299.99',
      url: window.location.href,
    };

    // Initialize widget
    const widget = new PriceDropWidget({
      apiEndpoint: '/subscribe-price-drop',
      product: demoProduct,
      containerId: 'price-drop-widget-root',
      theme: {
        accentColor: '#667eea',
        backgroundColor: '#ffffff',
      },
    });

    widget.init();
    console.log('Widget initialized');
  }

  // Load widget script dynamically
  function loadWidgetScript() {
    const script = document.createElement('script');
    script.src = '/assets/price-drop-widget.min.js';
    script.async = true;
    
    script.onload = function() {
      console.log('Widget script loaded');
      // Wait a bit for widget to be available
      setTimeout(initWidget, 100);
    };
    
    script.onerror = function() {
      console.error('Failed to load widget script');
      showError();
    };

    document.head.appendChild(script);
  }

  // Show error message
  function showError() {
    const container = document.getElementById('price-drop-widget-root');
    if (container) {
      container.innerHTML = '<p style="color: #d32f2f; text-align: center; padding: 20px;">Failed to load widget. Please refresh the page.</p>';
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadWidgetScript);
  } else {
    loadWidgetScript();
  }

  // Add smooth scroll behavior
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

})();
