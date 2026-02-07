// ==UserScript==
// @name         Price Drop Notifier - Amazon & eBay Injector
// @namespace    http://tampermonkey.net/
// @version      1.0.1
// @description  Inject price drop notification widget on Amazon and eBay product pages
// @author       You
// @match        *://www.amazon.com/*
// @match        *://www.amazon.co.uk/*
// @match        *://www.amazon.de/*
// @match        *://www.amazon.ca/*
// @match        *://www.amazon.fr/*
// @match        *://www.amazon.it/*
// @match        *://www.amazon.es/*
// @match        *://www.ebay.com/*
// @match        *://www.ebay.co.uk/*
// @match        *://www.ebay.de/*
// @match        *://www.aliexpress.com/*
// @match        *://www.aliexpress.us/*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @connect      localhost
// @connect      127.0.0.1
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        widgetScriptUrl: 'http://localhost:3000/assets/price-drop-widget.min.js',
        iframeUrl: 'http://localhost:3000/embed/price-drop.html',
        apiEndpoint: 'http://localhost:3000/subscribe-price-drop',
        storagePrefix: 'pdw_',
    };

    // Site-specific selectors
    const SELECTORS = {
        amazon: {
            title: '#productTitle, #title, [data-feature-name="title"] h1',
            price: '.a-price .a-offscreen, #priceblock_ourprice, #priceblock_dealprice, .a-price-whole, .a-price .a-price-whole',
            priceContainer: '#corePrice_feature_div, #corePriceDisplay_desktop_feature_div, [data-feature-name="corePriceDisplay"]',
            insertAfter: '#averageCustomerReviews, #social-share-container, #dp-container, #feature-bullets, [data-feature-name="featurebullets"]',
        },
        ebay: {
            title: '.x-item-title__mainTitle, h1.it-ttl',
            price: '.x-price-primary .ux-textspans, .vi-price .notranslate',
            priceContainer: '.x-price-section, .vi-price',
            insertAfter: '.x-buybox, #vi-evo-view',
        },
        aliexpress: {
            title: '.product-title-text, h1',
            price: '.product-price-value, .price-current',
            priceContainer: '.product-price, .price-box',
            insertAfter: '.product-action, .product-info',
        },
    };

    /**
     * Detect current e-commerce site
     */
    function detectSite() {
        const hostname = window.location.hostname;
        const pathname = window.location.pathname;
        
        if (hostname.includes('amazon')) {
            // Check if it's a product page
            if (pathname.includes('/dp/') || pathname.includes('/gp/product/')) {
                return 'amazon';
            }
        }
        if (hostname.includes('ebay') && pathname.includes('/itm/')) return 'ebay';
        if (hostname.includes('aliexpress') && pathname.includes('/item/')) return 'aliexpress';
        
        return null;
    }

    /**
     * Extract product data from page
     */
    function extractProductData(site) {
        const selectors = SELECTORS[site];
        if (!selectors) return null;

        // Extract title
        const titleEl = document.querySelector(selectors.title);
        const name = titleEl ? titleEl.textContent.trim() : document.title.split(':')[0].trim();
        
        console.log('[PDW] Extracted name:', name);

        // Extract price
        let price = 'N/A';
        const priceEl = document.querySelector(selectors.price);
        if (priceEl) {
            price = priceEl.textContent.trim().replace(/\s+/g, ' ');
        } else {
            // Fallback: try to find any price on page
            const priceMatch = document.body.innerText.match(/\$\d+\.?\d*/);
            if (priceMatch) price = priceMatch[0];
        }
        
        console.log('[PDW] Extracted price:', price);

        // Get URL (clean)
        const url = window.location.href.split('?')[0].split('#')[0];

        return { name, price, url };
    }

    /**
     * Check if already subscribed to this product
     */
    function isSubscribed(productUrl) {
        const key = CONFIG.storagePrefix + 'subscribed_' + btoa(productUrl).substring(0, 32);
        return GM_getValue(key, false);
    }

    /**
     * Mark product as subscribed
     */
    function markSubscribed(productUrl) {
        const key = CONFIG.storagePrefix + 'subscribed_' + btoa(productUrl).substring(0, 32);
        GM_setValue(key, true);
    }

    /**
     * Create widget container with reserved space
     */
    function createWidgetContainer(site) {
        // Check if already exists
        let container = document.getElementById('price-drop-widget-root');
        if (container) {
            console.log('[PDW] Container already exists');
            return container;
        }
        
        container = document.createElement('div');
        container.id = 'price-drop-widget-root';
        container.style.cssText = `
            margin: 20px 0;
            padding: 0;
            min-height: 200px;
            opacity: 0;
            transition: opacity 0.3s ease-in;
        `;

        // Insert container in appropriate location
        const selectors = SELECTORS[site];
        const insertAfterSelectors = selectors.insertAfter.split(', ');
        let inserted = false;
        
        for (const selector of insertAfterSelectors) {
            const insertAfter = document.querySelector(selector);
            if (insertAfter && insertAfter.parentNode) {
                console.log('[PDW] Inserting after:', selector);
                insertAfter.parentNode.insertBefore(container, insertAfter.nextSibling);
                inserted = true;
                break;
            }
        }
        
        if (!inserted) {
            // Fallback: insert at price container
            const priceContainer = document.querySelector(selectors.priceContainer);
            if (priceContainer && priceContainer.parentNode) {
                console.log('[PDW] Inserting after price container');
                priceContainer.parentNode.insertBefore(container, priceContainer.nextSibling);
                inserted = true;
            }
        }
        
        if (!inserted) {
            // Last resort: append to body
            console.log('[PDW] Appending to body');
            document.body.appendChild(container);
        }

        return container;
    }

    /**
     * Load widget via script injection (CSP-friendly approach)
     */
    function loadWidgetScript(productData) {
        return new Promise((resolve, reject) => {
            // Check if script already loaded
            if (window.PriceDropWidget) {
                resolve(true);
                return;
            }

            const script = document.createElement('script');
            script.src = CONFIG.widgetScriptUrl;
            script.async = true;
            
            script.onload = () => {
                console.log('[PDW] Widget script loaded');
                resolve(true);
            };
            
            script.onerror = () => {
                console.warn('[PDW] Failed to load widget script, will fallback to iframe');
                reject(new Error('Script load failed'));
            };

            document.head.appendChild(script);
        });
    }

    /**
     * Initialize widget with script method
     */
    function initWidgetScript(productData) {
        if (!window.PriceDropWidget) {
            console.error('[PDW] Widget class not found');
            return false;
        }

        try {
            const widget = new window.PriceDropWidget({
                apiEndpoint: CONFIG.apiEndpoint,
                product: productData,
                containerId: 'price-drop-widget-root',
                theme: {
                    accentColor: detectSite() === 'amazon' ? '#FF9900' : '#e53238',
                    backgroundColor: '#ffffff',
                },
            });

            widget.init();
            
            // Show container
            const container = document.getElementById('price-drop-widget-root');
            if (container) {
                setTimeout(() => {
                    container.style.opacity = '1';
                }, 100);
            }

            return true;
        } catch (error) {
            console.error('[PDW] Widget initialization failed:', error);
            return false;
        }
    }

    /**
     * Fallback: Load widget via iframe
     */
    function loadWidgetIframe(productData) {
        const container = document.getElementById('price-drop-widget-root');
        if (!container) return;

        const iframe = document.createElement('iframe');
        const params = new URLSearchParams({
            name: productData.name,
            price: productData.price,
            url: productData.url,
        });
        iframe.setAttribute(
        'sandbox',
        'allow-scripts allow-forms allow-same-origin'
        );

        iframe.src = `${CONFIG.iframeUrl}?${params.toString()}`;
        iframe.style.cssText = `
            width: 100%;
            max-width: 420px;
            height: 280px;
            border: none;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        `;
        iframe.title = 'Price Drop Notification Widget';

        container.innerHTML = '';
        container.appendChild(iframe);
        
        // Show container
        setTimeout(() => {
            container.style.opacity = '1';
        }, 100);

        console.log('[PDW] Loaded widget via iframe');
    }

    /**
     * Main injection logic
     */
    async function injectWidget() {
        const site = detectSite();
        
        if (!site) {
            console.log('[PDW] Not a supported e-commerce site');
            return;
        }

        console.log(`[PDW] Detected site: ${site}`);

        // Extract product data
        const productData = extractProductData(site);
        
        if (!productData || !productData.name) {
            console.warn('[PDW] Could not extract product data');
            return;
        }

        console.log('[PDW] Product data:', productData);

        // Check if already subscribed
        if (isSubscribed(productData.url)) {
            console.log('[PDW] Already subscribed to this product, skipping injection');
            return;
        }

        // Create container (reserves space to prevent layout shift)
        const container = createWidgetContainer(site);
        if (!container) {
            console.error('[PDW] Could not create widget container');
            return;
        }

        // For HTTPS sites (like Amazon), use iframe directly to avoid CORS/CSP issues
        console.log('[PDW] Using iframe method (CORS-safe for HTTPS sites)');
        loadWidgetIframe(productData);

        // Listen for successful subscription
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'pdw-subscription-success') {
                markSubscribed(productData.url);
                console.log('[PDW] Subscription stored');
            }
        });
    }

    /**
     * Wait for page to be ready
     */
    function waitForContent() {
        const site = detectSite();
        if (!site) {
            console.log('[PDW] Site not supported');
            return;
        }

        console.log('[PDW] Waiting for content on', site);
        const selectors = SELECTORS[site];
        let attempts = 0;
        const maxAttempts = 20; // 10 seconds
        
        const checkInterval = setInterval(() => {
            attempts++;
            const titleEl = document.querySelector(selectors.title);
            const priceEl = document.querySelector(selectors.price);

            console.log(`[PDW] Attempt ${attempts}: title=${!!titleEl}, price=${!!priceEl}`);

            if (titleEl && priceEl) {
                clearInterval(checkInterval);
                console.log('[PDW] Page content ready, injecting widget');
                
                // Inject with slight delay to ensure DOM is stable
                setTimeout(injectWidget, 500);
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                console.log('[PDW] Timeout - attempting injection anyway');
                // Try to inject anyway
                setTimeout(injectWidget, 500);
            }
        }, 500);
    }

    // Start
    console.log('[PDW] ========================================');
    console.log('[PDW] Price Drop Notifier Userscript Loaded!');
    console.log('[PDW] URL:', window.location.href);
    console.log('[PDW] Hostname:', window.location.hostname);
    console.log('[PDW] Pathname:', window.location.pathname);
    console.log('[PDW] ========================================');
    
    // Detect site immediately
    const detectedSite = detectSite();
    console.log('[PDW] Detected site:', detectedSite || 'NONE (not a product page)');
    
    if (!detectedSite) {
        console.log('[PDW] Not a product page, userscript will not run');
        return;
    }
    
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        console.log('[PDW] Document ready, starting in 1 second...');
        setTimeout(waitForContent, 1000);
    } else {
        console.log('[PDW] Waiting for document load');
        window.addEventListener('DOMContentLoaded', () => {
            console.log('[PDW] DOMContentLoaded event fired');
            setTimeout(waitForContent, 1000);
        });
        window.addEventListener('load', () => {
            console.log('[PDW] Load event fired');
            setTimeout(waitForContent, 1000);
        });
    }

})();
