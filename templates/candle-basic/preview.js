// Candle Basic Template - Preview Version
// Lightweight preview for iframe rendering

window.TEMPLATE = {
    renderPreview(data, container) {
        const { receiver, sender, message, photos } = data;

        // Get up to 2 photos
        const photoList = photos && photos.length > 0 ? photos.slice(0, 2) : [];

        // Build photo gallery HTML
        let photosHtml = '';
        if (photoList.length > 0) {
            photosHtml = `
                <div style="
                    display: grid;
                    grid-template-columns: repeat(${photoList.length === 1 ? 1 : 2}, 1fr);
                    gap: 15px;
                    margin: 25px 0;
                    max-width: 400px;
                ">
                    ${photoList.map(url => `
                        <div style="
                            border-radius: 12px;
                            overflow: hidden;
                            border: 2px solid rgba(251, 191, 36, 0.3);
                            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                        ">
                            <img src="${url}" style="
                                width: 100%;
                                height: 150px;
                                object-fit: cover;
                                display: block;
                            " alt="Gift photo">
                        </div>
                    `).join('')}
                </div>
            `;
        }

        container.innerHTML = `
            <div style="
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 40px 20px;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                color: #fff;
                text-align: center;
                font-family: 'Georgia', serif;
            ">
                <div style="
                    font-size: 80px;
                    margin-bottom: 20px;
                    animation: flicker 2s infinite alternate;
                ">🕯️</div>
                
                <h2 style="
                    font-size: 2.5rem;
                    margin-bottom: 20px;
                    color: #fbbf24;
                    text-shadow: 0 0 20px rgba(251, 191, 36, 0.5);
                ">
                    Happy Birthday ${receiver || 'Friend'}
                </h2>
                
                <div style="
                    max-width: 500px;
                    padding: 30px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 16px;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                ">
                    <p style="
                        font-size: 1.25rem;
                        line-height: 1.8;
                        margin-bottom: 20px;
                        color: #e5e7eb;
                    ">${message || 'Wishing you a wonderful day!'}</p>
                    
                    ${photosHtml}
                    
                    <small style="
                        display: block;
                        color: #9ca3af;
                        font-size: 1rem;
                        margin-top: 15px;
                    ">— ${sender || 'Someone special'}</small>
                </div>
            </div>
            
            <style>
                @keyframes flicker {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(0.98); }
                }
            </style>
        `;
    }
};