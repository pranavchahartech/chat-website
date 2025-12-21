import { useEffect, useState } from 'react';

const Sparkles = () => {
    const [sparkles, setSparkles] = useState([]);

    useEffect(() => {
        // Create initial batch of sparkles
        const createSparkles = () => {
            const newSparkles = Array.from({ length: 100 }).map((_, i) => ({
                id: i,
                left: Math.random() * 100 + '%',
                animationDuration: Math.random() * 3 + 2 + 's',
                animationDelay: Math.random() * 5 + 's',
                size: Math.random() * 3 + 2 + 'px'
            }));
            setSparkles(newSparkles);
        };

        createSparkles();
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {sparkles.map((sparkle) => (
                <div
                    key={sparkle.id}
                    className="absolute top-[-10px] bg-white rounded-full opacity-0 animate-fall"
                    style={{
                        left: sparkle.left,
                        width: sparkle.size,
                        height: sparkle.size,
                        animationDuration: sparkle.animationDuration,
                        animationDelay: sparkle.animationDelay
                    }}
                />
            ))}
        </div>
    );
};

export default Sparkles;
