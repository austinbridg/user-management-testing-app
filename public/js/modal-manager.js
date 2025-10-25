// Modal Manager - handles modal display with proper scrollbar compensation
class ModalManager {
    constructor() {
        this.activeModal = null;
        this.scrollbarWidth = 0;
        this.isModalOpen = false;
    }
    
    show(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`Modal with id '${modalId}' not found`);
            return;
        }
        
        // Prevent multiple modals
        if (this.isModalOpen) {
            this.hideActive();
        }
        
        // Store current scroll position
        this.scrollY = window.scrollY;
        
        // Calculate scrollbar width using multiple methods for accuracy
        this.scrollbarWidth = this.getScrollbarWidth();
        console.log('Scrollbar width:', this.scrollbarWidth);
        
        // Apply scrollbar compensation to both body and html
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        document.body.style.paddingRight = `${this.scrollbarWidth}px`;
        document.documentElement.style.paddingRight = `${this.scrollbarWidth}px`;
        
        // Show modal
        modal.style.display = 'block';
        this.activeModal = modalId;
        this.isModalOpen = true;
        
        // Add click-outside handler
        this.addClickOutsideHandler(modal);
    }
    
    hide(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`Modal with id '${modalId}' not found`);
            return;
        }
        
        // Restore scrollbar and remove padding from both body and html
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        document.body.style.paddingRight = '';
        document.documentElement.style.paddingRight = '';
        
        // Restore scroll position
        if (this.scrollY !== undefined) {
            window.scrollTo(0, this.scrollY);
        }
        
        // Hide modal
        modal.style.display = 'none';
        this.activeModal = null;
        this.isModalOpen = false;
        
        // Remove click-outside handler
        this.removeClickOutsideHandler(modal);
    }
    
    hideActive() {
        if (this.activeModal) {
            this.hide(this.activeModal);
        }
    }
    
    addClickOutsideHandler(modal) {
        const handler = (event) => {
            if (event.target === modal) {
                this.hide(this.activeModal);
            }
        };
        
        modal._clickOutsideHandler = handler;
        document.addEventListener('click', handler);
    }
    
    removeClickOutsideHandler(modal) {
        if (modal._clickOutsideHandler) {
            document.removeEventListener('click', modal._clickOutsideHandler);
            delete modal._clickOutsideHandler;
        }
    }
    
    // Handle escape key
    handleEscapeKey(event) {
        if (event.key === 'Escape' && this.isModalOpen) {
            this.hideActive();
        }
    }
    
    // Initialize escape key listener
    init() {
        document.addEventListener('keydown', (event) => this.handleEscapeKey(event));
    }
    
    // Get accurate scrollbar width
    getScrollbarWidth() {
        // Method 1: Calculate difference between window and document width
        const method1 = window.innerWidth - document.documentElement.clientWidth;
        
        // Method 2: Create a temporary div to measure scrollbar
        const outer = document.createElement('div');
        outer.style.visibility = 'hidden';
        outer.style.overflow = 'scroll';
        outer.style.msOverflowStyle = 'scrollbar';
        document.body.appendChild(outer);
        
        const inner = document.createElement('div');
        outer.appendChild(inner);
        
        const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
        outer.parentNode.removeChild(outer);
        
        // Use the more accurate method
        return Math.max(method1, scrollbarWidth);
    }
}
