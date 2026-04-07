// Magic Balloon Wish Adventure - Full Version
// Complete experience with all features

window.TEMPLATE = {
    renderFull(data, container) {
        // The full template is implemented in full.html
        // This file exists for compatibility with the template system
        console.log('Magic Balloon Wish Adventure - Full template rendering');

        // Load the full HTML template
        const templateUrl = 'templates/magic-balloon-adventure/full.html';

        fetch(templateUrl)
            .then(response => response.text())
            .then(html => {
                // Replace placeholder with actual data
                const processedHtml = html.replace(
                    /const GIFT_DATA = \{[^}]+\};/,
                    `const GIFT_DATA = ${JSON.stringify(data)};`
                );
                container.innerHTML = processedHtml;
            })
            .catch(error => {
                console.error('Failed to load template:', error);
                container.innerHTML = '<p style="color: white; text-align: center;">Failed to load template</p>';
            });
    }
};
