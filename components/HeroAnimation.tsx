import React, { useRef, useEffect } from 'react';

const HeroAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const points: { x: number; y: number; z: number }[] = [];
    const numPoints = 250;
    const radius = 150;
    let angleX = 0;
    let angleY = 0;

    const resizeCanvas = () => {
        const container = canvas.parentElement;
        if(container) {
            canvas.width = container.clientWidth;
            canvas.height = 300; // Fixed height for the hero animation area
        }
    };
    
    // Create points on a sphere
    for (let i = 0; i < numPoints; i++) {
      const phi = Math.acos(-1 + (2 * i) / numPoints);
      const theta = Math.sqrt(numPoints * Math.PI) * phi;

      points.push({
        x: radius * Math.cos(theta) * Math.sin(phi),
        y: radius * Math.sin(theta) * Math.sin(phi),
        z: radius * Math.cos(phi),
      });
    }

    const project = (point: { x: number; y: number; z: number }) => {
      // Rotate around Y axis
      const rotY_x = point.x * Math.cos(angleY) - point.z * Math.sin(angleY);
      const rotY_z = point.x * Math.sin(angleY) + point.z * Math.cos(angleY);

      // Rotate around X axis
      const rotX_y = point.y * Math.cos(angleX) - rotY_z * Math.sin(angleX);
      const rotX_z = point.y * Math.sin(angleX) + rotY_z * Math.cos(angleX);

      const perspective = 300 / (300 + rotX_z);
      
      return {
        x: rotY_x * perspective + canvas.width / 2,
        y: rotX_y * perspective + canvas.height / 2,
        alpha: (rotX_z + radius) / (2 * radius), // for opacity
      };
    };

    const draw = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const projectedPoints = points.map(project);

      // Draw lines between points
      for (let i = 0; i < projectedPoints.length; i++) {
        for (let j = i + 1; j < projectedPoints.length; j++) {
          const p1 = points[i];
          const p2 = points[j];
          const dist = Math.sqrt(
            Math.pow(p1.x - p2.x, 2) +
            Math.pow(p1.y - p2.y, 2) +
            Math.pow(p1.z - p2.z, 2)
          );

          if (dist < 80) {
            const proj1 = projectedPoints[i];
            const proj2 = projectedPoints[j];
            const alpha = Math.max(0, 1 - dist / 80);
            ctx.beginPath();
            ctx.moveTo(proj1.x, proj1.y);
            ctx.lineTo(proj2.x, proj2.y);
            ctx.strokeStyle = `rgba(110, 231, 183, ${alpha * 0.5})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      
      // Draw points
      projectedPoints.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(110, 231, 183, ${p.alpha * 0.8})`;
        ctx.fill();
      });

      angleY += 0.003;
      angleX += 0.001;
      
      animationFrameId = requestAnimationFrame(draw);
    };

    resizeCanvas();
    draw();
    
    window.addEventListener('resize', resizeCanvas);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-[300px]" />;
};

export default HeroAnimation;
