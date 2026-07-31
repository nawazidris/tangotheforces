window.tangoUtils = (() => {
    function formatDate(value, options = {}) {
        if (!value) return 'TBA';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return 'TBA';
        return new Intl.DateTimeFormat('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            ...options
        }).format(date);
    }

    function formatShortDate(value) {
        return formatDate(value, { month: 'short', day: 'numeric' });
    }

    function formatNumber(value) {
        return new Intl.NumberFormat('en-GB').format(Number(value || 0));
    }

    function createStatusMessage(message, type = 'info') {
        const container = document.createElement('div');
        container.className = `status-message ${type}`;
        container.textContent = message;
        return container;
    }

    function debounce(fn, wait = 120) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn(...args), wait);
        };
    }

    return { formatDate, formatShortDate, formatNumber, createStatusMessage, debounce };
})();
