import React, { useEffect, useRef } from 'react';

interface StarFieldProps {
  isDarkMode: boolean;
}

const StarField: React.FC<StarFieldProps> = ({ isDarkMode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let animationFrameId: number;

    // Stars
    const stars: { x: number; y: number; size: number; speed: number; opacity: number }[] = [];
    const numStars = 150;

    // Asteroid
    const asteroid = {
      x: -100,
      y: Math.random() * height,
      size: 30,
      speedX: 0.5,
      speedY: 0.2,
      rotation: 0,
      active: false,
      nextSpawn: Date.now() + 2000 
    };

    // Rocket
    const rocket = {
      x: width + 100,
      y: height / 2,
      speed: 4,
      active: false,
      nextSpawn: Date.now() + 10000
    };

    const init = () => {
      canvas.width = width;
      canvas.height = height;
      
      if (isDarkMode) {
        stars.length = 0;
        for (let i = 0; i < numStars; i++) {
            stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2,
            speed: Math.random() * 0.2 + 0.05,
            opacity: Math.random()
            });
        }
      }
    };

    const drawGrid = () => {
        if (!ctx) return;
        ctx.strokeStyle = '#E5E7EB';
        ctx.lineWidth = 1;
        
        const gridSize = 50;
        const offsetX = (Date.now() / 50) % gridSize;
        const offsetY = (Date.now() / 50) % gridSize;

        for (let x = -gridSize; x < width + gridSize; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x - offsetX, 0);
            ctx.lineTo(x - offsetX, height);
            ctx.stroke();
        }
        for (let y = -gridSize; y < height + gridSize; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y + offsetY);
            ctx.lineTo(width, y + offsetY);
            ctx.stroke();
        }
    }

    const drawAsteroid = () => {
      if (!isDarkMode) return; // Only in space

      if (!asteroid.active) {
        if (Date.now() > asteroid.nextSpawn) {
          asteroid.active = true;
          asteroid.y = Math.random() * (height * 0.8) + (height * 0.1);
          asteroid.x = -50;
          asteroid.speedX = Math.random() * 1.5 + 0.5;
          asteroid.speedY = (Math.random() - 0.5) * 0.5;
        }
        return;
      }

      ctx.save();
      ctx.translate(asteroid.x, asteroid.y);
      asteroid.rotation += 0.01;
      ctx.rotate(asteroid.rotation);

      // Glow
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, asteroid.size * 2);
      gradient.addColorStop(0, 'rgba(255, 50, 50, 0.4)');
      gradient.addColorStop(1, 'rgba(255, 50, 50, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, asteroid.size * 2, 0, Math.PI * 2);
      ctx.fill();

      // Rock
      ctx.fillStyle = '#3a2020';
      ctx.strokeStyle = '#ff4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      // Irregular shape
      const points = 8;
      for(let i=0; i<points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const r = asteroid.size * (0.8 + Math.random() * 0.4); 
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        if(i===0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();

      asteroid.x += asteroid.speedX;
      asteroid.y += asteroid.speedY;

      if (asteroid.x > width + 100) {
        asteroid.active = false;
        asteroid.nextSpawn = Date.now() + 15000 + Math.random() * 20000;
      }
    };

    const drawRocket = () => {
      if (!rocket.active) {
         if (Date.now() > rocket.nextSpawn) {
           rocket.active = true;
           rocket.x = width + 100;
           rocket.y = Math.random() * (height * 0.8) + (height * 0.1);
         }
         return;
      }

      ctx.save();
      ctx.translate(rocket.x, rocket.y);
      ctx.rotate(-Math.PI / 2); // Point left

      // Flame
      ctx.fillStyle = `rgba(0, 240, 255, ${0.5 + Math.random() * 0.5})`;
      ctx.beginPath();
      ctx.moveTo(-5, 20);
      ctx.lineTo(0, 35 + Math.random() * 10);
      ctx.lineTo(5, 20);
      ctx.fill();

      // Body
      ctx.fillStyle = isDarkMode ? '#ffffff' : '#111827';
      ctx.beginPath();
      ctx.ellipse(0, 0, 10, 25, 0, 0, Math.PI * 2);
      ctx.fill();

      // Window
      ctx.fillStyle = isDarkMode ? '#0B0D17' : '#ffffff';
      ctx.beginPath();
      ctx.arc(0, -5, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      rocket.x -= rocket.speed;
      if (rocket.x < -100) {
        rocket.active = false;
        rocket.nextSpawn = Date.now() + 20000 + Math.random() * 30000;
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      if (isDarkMode) {
        ctx.fillStyle = '#0B0D17'; 
        ctx.fillRect(0, 0, width, height);
        // Draw Stars
        stars.forEach((star) => {
            ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
            star.y -= star.speed;
            if (star.y < 0) {
            star.y = height;
            star.x = Math.random() * width;
            }
        });
        drawAsteroid();
      } else {
        ctx.fillStyle = '#F9FAFB'; 
        ctx.fillRect(0, 0, width, height);
        drawGrid();
      }

      drawRocket();

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      init();
    };

    init();
    animate();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDarkMode]);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />;
};

export default StarField;