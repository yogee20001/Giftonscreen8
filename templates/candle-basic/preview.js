// Candle Basic Template - Preview Version
// Lightweight preview for iframe rendering

window.TEMPLATE = {
    renderPreview(data, container) {
        const { receiver, sender, message } = data;

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
                    margin-bottom: 30px;
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
                    
                    <small style="
                        display: block;
                        color: #9ca3af;
                        font-size: 1rem;
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
