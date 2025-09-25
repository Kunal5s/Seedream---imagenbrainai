import React, { useRef, useEffect } from 'react';

// Public domain simplex noise implementation
const SimplexNoise = (() => {
  const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
  const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
  const F3 = 1.0 / 3.0;
  const G3 = 1.0 / 6.0;

  const grad3 = [
    [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
    [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
    [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
  ];

  let p: number[] = [];
  let perm: number[] = [];
  let permMod12: number[] = [];

  const dot = (g: number[], x: number, y: number, z: number) => g[0] * x + g[1] * y + g[2] * z;

  const buildPermutationTable = (seed: number) => {
    const random = (() => {
      let s = seed;
      return () => {
        s = Math.sin(s) * 10000;
        return s - Math.floor(s);
      };
    })();

    p = new Array(256);
    perm = new Array(512);
    permMod12 = new Array(512);
    for (let i = 0; i < 256; i++) {
      p[i] = Math.floor(random() * 256);
    }
    for (let i = 0; i < 512; i++) {
      perm[i] = p[i & 255];
      permMod12[i] = perm[i] % 12;
    }
  };

  buildPermutationTable(Math.random());

  return function() {
    this.noise3D = (xin: number, yin: number, zin: number) => {
      let n0, n1, n2, n3;
      const s = (xin + yin + zin) * F3;
      const i = Math.floor(xin + s);
      const j = Math.floor(yin + s);
      const k = Math.floor(zin + s);
      const t = (i + j + k) * G3;
      const X0 = i - t;
      const Y0 = j - t;
      const Z0 = k - t;
      const x0 = xin - X0;
      const y0 = yin - Y0;
      const z0 = zin - Z0;

      let i1, j1, k1;
      let i2, j2, k2;

      if (x0 >= y0) {
        if (y0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
        else if (x0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1; }
        else { i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1; }
      } else {
        if (y0 < z0) { i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1; }
        else if (x0 < z0) { i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1; }
        else { i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
      }

      const x1 = x0 - i1 + G3;
      const y1 = y0 - j1 + G3;
      const z1 = z0 - k1 + G3;
      const x2 = x0 - i2 + 2.0 * G3;
      const y2 = y0 - j2 + 2.0 * G3;
      const z2 = z0 - k2 + 2.0 * G3;
      const x3 = x0 - 1.0 + 3.0 * G3;
      const y3 = y0 - 1.0 + 3.0 * G3;
      const z3 = z0 - 1.0 + 3.0 * G3;

      const ii = i & 255;
      const jj = j & 255;
      const kk = k & 255;

      let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
      if (t0 < 0) n0 = 0.0;
      else {
        t0 *= t0;
        n0 = t0 * t0 * dot(grad3[permMod12[ii + perm[jj + perm[kk]]]], x0, y0, z0);
      }

      let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
      if (t1 < 0) n1 = 0.0;
      else {
        t1 *= t1;
        n1 = t1 * t1 * dot(grad3[permMod12[ii + i1 + perm[jj + j1 + perm[kk + k1]]]], x1, y1, z1);
      }

      let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
      if (t2 < 0) n2 = 0.0;
      else {
        t2 *= t2;
        n2 = t2 * t2 * dot(grad3[permMod12[ii + i2 + perm[jj + j2 + perm[kk + k2]]]], x2, y2, z2);
      }

      let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
      if (t3 < 0) n3 = 0.0;
      else {
        t3 *= t3;
        n3 = t3 * t3 * dot(grad3[permMod12[ii + 1 + perm[jj + 1 + perm[kk + 1]]]], x3, y3, z3);
      }
      return 32.0 * (n0 + n1 + n2 + n3);
    };
  };
})();


const HeroBackgroundAnimation: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const noise = new (SimplexNoise as any)();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];
        let time = Math.random() * 100;

        const resizeCanvas = () => {
            const container = canvas.parentElement;
            if (container) {
                canvas.width = container.clientWidth;
                canvas.height = container.clientHeight;
            }
        };
        
        class Particle {
            x: number;
            y: number;
            history: { x: number; y: number }[];
            life: number;

            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.history = [{ x: this.x, y: this.y }];
                this.life = 0;
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.history = [{ x: this.x, y: this.y }];
                this.life = 0;
            }

            update() {
                const angle = noise.noise3D(this.x / 400, this.y / 400, time) * Math.PI * 2;
                const speed = 0.8;
                this.x += Math.cos(angle) * speed;
                this.y += Math.sin(angle) * speed;
                this.life++;
                
                if (this.x > canvas.width + 5 || this.x < -5 || this.y > canvas.height + 5 || this.y < -5 || this.life > 300) {
                   this.reset();
                }

                this.history.push({ x: this.x, y: this.y });
                if (this.history.length > 30) {
                    this.history.shift();
                }
            }

            draw() {
              if(!ctx) return;
                ctx.beginPath();
                ctx.moveTo(this.history[0].x, this.history[0].y);
                for (let i = 1; i < this.history.length; i++) {
                    const opacity = i / this.history.length;
                    ctx.lineTo(this.history[i].x, this.history[i].y);
                }
                ctx.strokeStyle = `rgba(110, 231, 183, 0.2)`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
        
        const init = () => {
            resizeCanvas();
            particles = [];
            const particleCount = Math.floor((canvas.width * canvas.height) / 10000);
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };
        
        const animate = () => {
            if(!ctx) return;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            
            time += 0.0015;
            animationFrameId = requestAnimationFrame(animate);
        };
        
        init();
        animate();
        window.addEventListener('resize', init);
        
        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', init);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0 opacity-70" />;
};

export default HeroBackgroundAnimation;
