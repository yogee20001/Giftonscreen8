// Magic Balloon Wish Adventure - Preview Version
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
                            border: 2px solid rgba(255, 107, 157, 0.3);
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
                background: linear-gradient(180deg, #1a1a3e 0%, #2d1b69 25%, #4a148c 50%, #6a1b9a 75%, #8e24aa 100%);
                color: #fff;
                text-align: center;
                font-family: 'Nunito', sans-serif;
            ">
                <div style="
                    font-size: 60px;
                    margin-bottom: 15px;
                    animation: float 3s ease-in-out infinite;
                    filter: drop-shadow(0 0 20px #ffd700) drop-shadow(0 0 40px #ff00ff);
                ">🎈</div>
                
                <h2 style="
                    font-family: 'Fredoka One', cursive;
                    font-size: 2rem;
                    margin-bottom: 15px;
                    color: #ffd700;
                    text-shadow: 0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 0, 255, 0.3);
                ">
                    Magic Balloon Adventure
                </h2>
                
                <p style="
                    font-size: 1.5rem;
                    margin-bottom: 20px;
                    color: #ff6b9d;
                    font-weight: 600;
                ">For ${receiver || 'You'} ✨</p>
                
                <div style="
                    max-width: 500px;
                    padding: 30px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                ">
                    <p style="
                        font-size: 1.1rem;
                        line-height: 1.7;
                        margin-bottom: 20px;
                        color: #e5e7eb;
                    ">${message || 'Tap balloons to collect stars and reveal a magical surprise!'}</p>
                    
                    ${photosHtml}
                    
                    <div style="
                        display: flex;
                        justify-content: center;
                        gap: 10px;
                        margin-top: 20px;
                    ">
                        <span style="font-size: 24px;">⭐</span>
                        <span style="font-size: 24px;">🎈</span>
                        <span style="font-size: 24px;">✨</span>
                        <span style="font-size: 24px;">🎉</span>
                    </div>
                    
                    <small style="
                        display: block;
                        color: rgba(255, 255, 255, 0.7);
                        font-size: 0.95rem;
                        margin-top: 15px;
                    ">— ${sender || 'Someone special'} wants you to play!</small>
                </div>
                
                <div style="
                    margin-top: 30px;
                    padding: 15px 30px;
                    background: linear-gradient(135deg, #ff6b9d, #c44569);
                    border-radius: 30px;
                    font-family: 'Fredoka One', cursive;
                    color: white;
                    box-shadow: 0 4px 15px rgba(255, 107, 157, 0.4);
                ">
                    👆 Tap to Play!
                </div>
            </div>
            
            <style>
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(-3deg); }
                    50% { transform: translateY(-15px) rotate(3deg); }
                }
                @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700&display=swap');
            </style>
        `;
    }
};
