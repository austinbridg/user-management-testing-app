// Table Resizer - handles resizable columns functionality
class TableResizer {
    constructor() {
        this.isResizing = false;
        this.currentColumn = null;
        this.startX = 0;
        this.startWidth = 0;
        this.minWidth = 60; // Minimum column width
        this.columnWidths = [80, 200, 120, 100, 100, 80, 150]; // Default widths
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupResizeHandles());
        } else {
            this.setupResizeHandles();
        }
    }

    setupResizeHandles() {
        const table = document.querySelector('.test-management-table table');
        if (!table) {
            console.log('Table not found, retrying...');
            setTimeout(() => this.setupResizeHandles(), 100);
            return;
        }

        const resizeHandles = table.querySelectorAll('.resize-handle');
        
        resizeHandles.forEach((handle, index) => {
            handle.addEventListener('mousedown', (e) => this.startResize(e, index));
        });

        // Add global event listeners
        document.addEventListener('mousemove', (e) => this.handleResize(e));
        document.addEventListener('mouseup', () => this.stopResize());

        // Prevent text selection during resize
        document.addEventListener('selectstart', (e) => {
            if (this.isResizing) {
                e.preventDefault();
            }
        });

        console.log('✅ Table resizer initialized with', resizeHandles.length, 'columns');
    }

    startResize(e, columnIndex) {
        e.preventDefault();
        e.stopPropagation();

        this.isResizing = true;
        this.currentColumn = columnIndex;
        this.startX = e.clientX;
        
        // Get current width of the column
        const table = document.querySelector('.test-management-table table');
        const th = table.querySelectorAll('th')[columnIndex];
        this.startWidth = th.offsetWidth;

        // Add visual feedback
        document.body.classList.add('resizing');
        e.target.classList.add('active');

        console.log(`🔄 Started resizing column ${columnIndex} from width ${this.startWidth}px`);
    }

    handleResize(e) {
        if (!this.isResizing || this.currentColumn === null) return;

        e.preventDefault();

        const deltaX = e.clientX - this.startX;
        const newWidth = Math.max(this.minWidth, this.startWidth + deltaX);

        // Update the column width
        this.updateColumnWidth(this.currentColumn, newWidth);

        // Update visual feedback
        const handle = document.querySelector(`.resize-handle[data-column="${this.currentColumn}"]`);
        if (handle) {
            handle.style.background = '#0056b3';
        }
    }

    stopResize() {
        if (!this.isResizing) return;

        console.log(`✅ Finished resizing column ${this.currentColumn}`);

        // Remove visual feedback
        document.body.classList.remove('resizing');
        const activeHandle = document.querySelector('.resize-handle.active');
        if (activeHandle) {
            activeHandle.classList.remove('active');
            activeHandle.style.background = '';
        }

        // Save the new width
        if (this.currentColumn !== null) {
            this.columnWidths[this.currentColumn] = this.getColumnWidth(this.currentColumn);
            this.saveColumnWidths();
        }

        // Reset state
        this.isResizing = false;
        this.currentColumn = null;
        this.startX = 0;
        this.startWidth = 0;
    }

    updateColumnWidth(columnIndex, width) {
        const table = document.querySelector('.test-management-table table');
        if (!table) return;

        // Update header
        const th = table.querySelectorAll('th')[columnIndex];
        if (th) {
            th.style.width = `${width}px`;
        }

        // Update all cells in this column
        const rows = table.querySelectorAll('tr');
        rows.forEach(row => {
            const cell = row.children[columnIndex];
            if (cell) {
                cell.style.width = `${width}px`;
            }
        });

        // Update CSS custom properties for consistency
        document.documentElement.style.setProperty(`--column-${columnIndex}-width`, `${width}px`);
    }

    getColumnWidth(columnIndex) {
        const table = document.querySelector('.test-management-table table');
        const th = table.querySelectorAll('th')[columnIndex];
        return th ? th.offsetWidth : this.columnWidths[columnIndex];
    }

    resetColumnWidths() {
        const defaultWidths = [80, 200, 120, 100, 100, 80, 150];
        
        defaultWidths.forEach((width, index) => {
            this.updateColumnWidth(index, width);
        });

        this.columnWidths = [...defaultWidths];
        this.saveColumnWidths();
        
        console.log('🔄 Column widths reset to defaults');
    }

    saveColumnWidths() {
        try {
            localStorage.setItem('testTableColumnWidths', JSON.stringify(this.columnWidths));
        } catch (error) {
            console.warn('Could not save column widths:', error);
        }
    }

    loadColumnWidths() {
        try {
            const saved = localStorage.getItem('testTableColumnWidths');
            if (saved) {
                const widths = JSON.parse(saved);
                if (Array.isArray(widths) && widths.length === 7) {
                    this.columnWidths = widths;
                    
                    // Apply saved widths
                    widths.forEach((width, index) => {
                        this.updateColumnWidth(index, width);
                    });
                    
                    console.log('📁 Loaded saved column widths:', widths);
                    return true;
                }
            }
        } catch (error) {
            console.warn('Could not load column widths:', error);
        }
        
        return false;
    }

    // Public method to reset columns (can be called from UI)
    resetColumns() {
        this.resetColumnWidths();
    }
}

// Initialize the table resizer
window.tableResizer = new TableResizer();
