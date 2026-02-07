/**
 * Price Drop Widget
 * A lightweight embeddable widget for price drop notifications
 */

interface ProductData {
    name: string;
    price: string;
    url: string;
}

interface WidgetConfig {
    apiEndpoint?: string;
    product?: ProductData;
    containerId?: string;
    cssUrl?: string;
    htmlTemplate?: string;
    theme?: {
        accentColor?: string;
        backgroundColor?: string;
    };
}

type WidgetState = 'idle' | 'submitting' | 'success' | 'error';

interface SubscriptionPayload {
    email: string;
    product: ProductData;
}

class PriceDropWidget {
    private config: WidgetConfig;
    private container: HTMLElement | null = null;
    private state: WidgetState = 'idle';
    private shadowRoot: ShadowRoot | null = null;

    constructor(config: WidgetConfig = {}) {
        this.config = {
            apiEndpoint: config.apiEndpoint || '/subscribe-price-drop',
            product: config.product || this.extractProductData(),
            containerId: config.containerId || 'price-drop-widget-root',
            cssUrl: config.cssUrl || '/assets/widget.css',
            htmlTemplate: config.htmlTemplate,
            theme: {
                accentColor: config.theme?.accentColor || '#FF9900',
                backgroundColor: config.theme?.backgroundColor || '#ffffff',
            },
        };
    }

    /**
     * Extract product data from current page
     */
    private extractProductData(): ProductData {
        return {
            name: document.title || 'Unknown Product',
            price: 'N/A',
            url: window.location.href,
        };
    }

    /**
     * Initialize and render the widget
     */
    public async init(): Promise<void> {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.render());
        } else {
            await this.render();
        }
    }

    /**
     * Render the widget
     */
    private async render(): Promise<void> {
        this.container = document.getElementById(this.config.containerId!);

        if (!this.container) {
            console.error(`Widget container #${this.config.containerId} not found`);
            return;
        }

        // Use Shadow DOM for style isolation
        this.shadowRoot = this.container.attachShadow({ mode: 'open' });

        // Load and inject CSS
        await this.loadStyles();

        // Create widget structure
        const widget = await this.createWidgetElement();
        this.shadowRoot.appendChild(widget);

        // Attach event listeners
        this.attachEventListeners();
    }

    /**
     * Load external CSS into Shadow DOM
     */
    private async loadStyles(): Promise<void> {
        const { accentColor, backgroundColor } = this.config.theme!;

        // Create style element for theme variables
        const themeStyle = document.createElement('style');
        themeStyle.textContent = `
            :host {
                --pdw-accent: ${accentColor};
                --pdw-bg: ${backgroundColor};
            }
        `;
        this.shadowRoot!.appendChild(themeStyle);

        // Try to load external CSS
        try {
            const response = await fetch(this.config.cssUrl!);
            if (response.ok) {
                const css = await response.text();
                const style = document.createElement('style');
                style.textContent = css;
                this.shadowRoot!.appendChild(style);
            } else {
                throw new Error('Failed to load CSS');
            }
        } catch (error) {
            console.warn('Failed to load external CSS, using inline fallback');
            // Fallback to inline styles
            const style = document.createElement('style');
            style.textContent = this.getFallbackStyles();
            this.shadowRoot!.appendChild(style);
        }
    }

    /**
     * Get fallback styles if external CSS fails to load
     */
    private getFallbackStyles(): string {
        return `
      :host {
        --pdw-text: #1a1a1a;
        --pdw-text-light: #666;
        --pdw-border: #e0e0e0;
        --pdw-error: #d32f2f;
        --pdw-success: #388e3c;
        
        display: block;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
        font-size: 14px;
        line-height: 1.5;
        color: var(--pdw-text);
        box-sizing: border-box;
      }
      
      *, *::before, *::after {
        box-sizing: border-box;
      }
      
      .pdw-container {
        background: var(--pdw-bg);
        border: 1px solid var(--pdw-border);
        border-radius: 8px;
        padding: 16px;
        max-width: 400px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        animation: pdw-fadeIn 0.3s ease-out;
      }
      
      @keyframes pdw-fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .pdw-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
      .pdw-icon { font-size: 20px; line-height: 1; }
      .pdw-title { font-size: 16px; font-weight: 600; margin: 0; color: var(--pdw-text); }
      .pdw-description { font-size: 13px; color: var(--pdw-text-light); margin: 0 0 16px 0; }
      .pdw-product-info { background: #f8f8f8; border-radius: 4px; padding: 8px; margin-bottom: 16px; font-size: 12px; }
      .pdw-product-name { font-weight: 600; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .pdw-product-price { color: var(--pdw-accent); font-weight: 700; font-size: 14px; }
      .pdw-form { display: flex; flex-direction: column; gap: 12px; }
      .pdw-input { width: 100%; padding: 10px 12px; border: 2px solid var(--pdw-border); border-radius: 6px; font-size: 14px; outline: none; transition: border-color 0.2s ease; font-family: inherit; }
      .pdw-input:focus { border-color: var(--pdw-accent); }
      .pdw-input::placeholder { color: #999; }
      .pdw-button { width: 100%; padding: 10px 16px; background: var(--pdw-accent); color: white; border: none; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; font-family: inherit; position: relative; overflow: hidden; }
      .pdw-button:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); }
      .pdw-button:active:not(:disabled) { transform: translateY(0); }
      .pdw-button:disabled { opacity: 0.6; cursor: not-allowed; }
      .pdw-button.submitting { animation: pdw-pulse 1.5s ease-in-out infinite; }
      @keyframes pdw-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
      .pdw-message { padding: 10px 12px; border-radius: 6px; font-size: 13px; margin-top: 12px; display: none; animation: pdw-slideDown 0.3s ease-out; }
      @keyframes pdw-slideDown { from { opacity: 0; transform: translateY(-10px); max-height: 0; } to { opacity: 1; transform: translateY(0); max-height: 100px; } }
      .pdw-message.show { display: block; }
      .pdw-message.success { background: #e8f5e9; color: var(--pdw-success); border: 1px solid #c8e6c9; }
      .pdw-message.error { background: #ffebee; color: var(--pdw-error); border: 1px solid #ffcdd2; }
      .pdw-spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(255, 255, 255, 0.3); border-top-color: white; border-radius: 50%; animation: pdw-spin 0.6s linear infinite; margin-right: 8px; vertical-align: middle; }
      @keyframes pdw-spin { to { transform: rotate(360deg); } }
      @media (max-width: 480px) {
        .pdw-container { padding: 12px; }
        .pdw-title { font-size: 14px; }
        .pdw-input, .pdw-button { font-size: 13px; }
      }
    `;
    }

    /**
     * Load HTML template
     */
    private async loadTemplate(): Promise<string> {
        // If custom template provided, use it
        if (this.config.htmlTemplate) {
            return this.config.htmlTemplate;
        }

        // Return inline template as fallback
        return this.getInlineTemplate();
    }

    /**
     * Get inline HTML template
     */
    private getInlineTemplate(): string {
        return `
      <div class="pdw-container">
        <div class="pdw-header">
          <span class="pdw-icon">🔔</span>
          <h3 class="pdw-title">Price Drop Alert</h3>
        </div>
        <p class="pdw-description">Get notified when the price drops!</p>
        <div class="pdw-product-info">
          <div class="pdw-product-name" data-pdw="product-name"></div>
          <div class="pdw-product-price" data-pdw="product-price"></div>
        </div>
        <form class="pdw-form" id="pdw-form">
          <input 
            type="email" 
            class="pdw-input" 
            id="pdw-email" 
            placeholder="your.email@example.com" 
            required 
            autocomplete="email"
            aria-label="Email address"
          />
          <button type="submit" class="pdw-button" id="pdw-submit">
            Notify Me
          </button>
        </form>
        <div class="pdw-message" id="pdw-message" role="alert"></div>
      </div>
    `;
    }

    /**
     * Create widget DOM structure
     */
    private async createWidgetElement(): Promise<HTMLElement> {
        const container = document.createElement('div');

        // Load template
        const templateHtml = await this.loadTemplate();
        container.innerHTML = templateHtml;

        // Populate product data
        const nameEl = container.querySelector('[data-pdw="product-name"]');
        const priceEl = container.querySelector('[data-pdw="product-price"]');

        if (nameEl) {
            nameEl.textContent = this.escapeHtml(this.config.product!.name);
            nameEl.setAttribute('title', this.escapeHtml(this.config.product!.name));
        }
        if (priceEl) {
            priceEl.textContent = this.escapeHtml(this.config.product!.price);
        }

        return container.firstElementChild as HTMLElement;
    }

    /**
     * Attach event listeners
     */
    private attachEventListeners(): void {
        const form = this.shadowRoot!.querySelector('#pdw-form') as HTMLFormElement;
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Keyboard accessibility
        const input = this.shadowRoot!.querySelector('#pdw-email') as HTMLInputElement;
        if (input) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    input.blur();
                }
            });
        }
    }

    /**
     * Handle form submission
     */
    private async handleSubmit(e: Event): Promise<void> {
        e.preventDefault();

        if (this.state === 'submitting') return;

        const emailInput = this.shadowRoot!.querySelector('#pdw-email') as HTMLInputElement;
        const submitButton = this.shadowRoot!.querySelector('#pdw-submit') as HTMLButtonElement;

        const email = emailInput.value.trim();

        if (!email || !this.validateEmail(email)) {
            this.showMessage('Please enter a valid email address', 'error');
            return;
        }

        this.setState('submitting');
        submitButton.innerHTML = '<span class="pdw-spinner"></span>Subscribing...';
        submitButton.classList.add('submitting');

        const payload: SubscriptionPayload = {
            email,
            product: this.config.product!,
        };

        try {
            const response = await this.submitSubscription(payload);

            if (response.ok) {
                this.setState('success');
                this.showMessage('✅ Success! We\'ll notify you when the price drops.', 'success');
                emailInput.value = '';

                // Store subscription in localStorage
                this.markAsSubscribed();
            } else {
                this.handleError(response);
            }
        } catch (error) {
            this.setState('error');
            this.showMessage('❌ Network error. Please check your connection.', 'error');
        } finally {
            submitButton.innerHTML = 'Notify Me';
            submitButton.classList.remove('submitting');

            setTimeout(() => {
                if (this.state !== 'submitting') {
                    this.setState('idle');
                }
            }, 3000);
        }
    }

    /**
     * Submit subscription to API
     */
    private async submitSubscription(payload: SubscriptionPayload): Promise<any> {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

        try {
            const response = await fetch(this.config.apiEndpoint!, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
                signal: controller.signal,
            });

            clearTimeout(timeout);

            const data = await response.json();
            return { ok: response.ok, status: response.status, data };
        } catch (error) {
            clearTimeout(timeout);
            throw error;
        }
    }

    /**
     * Handle API errors
     */
    private handleError(response: any): void {
        this.setState('error');

        const errorMessages: Record<string, string> = {
            invalid_email: '❌ Please enter a valid email address',
            already_subscribed: 'ℹ️ You\'re already subscribed to this product',
            server_error: '⚠️ Server error. Please try again later.',
        };

        const errorKey = response.data?.error;
        const message = errorMessages[errorKey] || '❌ Something went wrong. Please try again.';

        this.showMessage(message, 'error');
    }

    /**
     * Show message to user
     */
    private showMessage(text: string, type: 'success' | 'error'): void {
        const messageDiv = this.shadowRoot!.querySelector('#pdw-message') as HTMLElement;
        if (messageDiv) {
            messageDiv.textContent = text;
            messageDiv.className = `pdw-message ${type} show`;
        }
    }

    /**
     * Update widget state
     */
    private setState(newState: WidgetState): void {
        this.state = newState;
    }

    /**
     * Validate email format
     */
    private validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Escape HTML to prevent XSS
     */
    private escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Mark product as subscribed in localStorage
     */
    private markAsSubscribed(): void {
        try {
            const key = `pdw_subscribed_${this.config.product!.url}`;
            localStorage.setItem(key, 'true');
        } catch (e) {
            // localStorage might be disabled
            console.warn('Could not save subscription state');
        }
    }

    /**
     * Check if already subscribed to this product
     */
    public isSubscribed(): boolean {
        try {
            const key = `pdw_subscribed_${this.config.product!.url}`;
            return localStorage.getItem(key) === 'true';
        } catch (e) {
            return false;
        }
    }
}

// Export for module systems
if (typeof window !== 'undefined') {
    (window as any).PriceDropWidget = PriceDropWidget;
}

export default PriceDropWidget;
