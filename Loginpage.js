import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import {
  Heart,
  User,
  Building,
  DollarSign,
  ArrowRight,
  Menu,
  X,
  Phone,
  Lock,
  Mail,
  CheckCircle,
  Briefcase,
  Target,
  HandHeart,
  Search,
  LogOut,
  Twitter,
  Github,
  Linkedin,
  MapPin,
} from 'lucide-react';

// --- Mock Data ---

const MOCK_TOP_DONORS = [
  {
    name: 'Bill Gates',
    amount: '₹1.5M',
    avatar: 'https://placehold.co/100x100/1a1a1a/ffffff?text=BG',
  },
  {
    name: 'Melinda French Gates',
    amount: '₹1.2M',
    avatar: 'https://placehold.co/100x100/1a1a1a/ffffff?text=MG',
  },
  {
    name: 'Warren Buffett',
    amount: '₹900K',
    avatar: 'https://placehold.co/100x100/1a1a1a/ffffff?text=WB',
  },
];

const MOCK_NGOS = [
  {
    id: 1,
    name: 'GreenFuture India',
    location: 'Mumbai, MH',
    description: 'Focused on planting trees and carbon offsetting.',
    volunteersNeeded: 10,
  },
  {
    id: 2,
    name: 'Code for All Bharat',
    location: 'Bengaluru, KA',
    description: 'Providing tech education to underprivileged youth.',
    volunteersNeeded: 5,
  },
  {
    id: 3,
    name: 'HealthBridge India',
    location: 'Delhi, DL',
    description: 'Mobile clinics for remote areas.',
    volunteersNeeded: 15,
  },
  {
    id: 4,
    name: 'CommunityTable Chennai',
    location: 'Chennai, TN',
    description: 'Rescuing food waste to feed the hungry.',
    volunteersNeeded: 8,
  },
];

const MOCK_RECENT_DONATIONS = [
  { name: 'Alice M.', amount: '₹50', ngo: 'GreenFuture' },
  { name: 'Bob K.', amount: '₹200', ngo: 'Code for All' },
  { name: 'John S.', amount: '₹10', ngo: 'CommunityTable' },
];

const MOCK_USER_PROFILE = {
  name: 'Nithin',
  phone: '6304433782',
  email: 'nithin@example.com',
  volunteerHours: 42,
  donationsMade: 3,
};

// --- Page Components ---

const PageContainer = ({ children }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}
    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
  >
    {children}
  </motion.div>
);

// --- NEW HERO SECTION COMPONENT ---

const HeroSection = ({ setPage }) => {
  const mountRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let scene, camera, renderer, sphere, particles, clock;
    let animationFrameId;

    const init = () => {
      // --- FIX: Initialize scene, clock, camera, and renderer ---
      scene = new THREE.Scene();
      clock = new THREE.Clock();
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;

      camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.z = 5;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);
      mountRef.current.appendChild(renderer.domElement);
      // --- END FIX ---

      // 3D Object (Sun)
      const uniforms = {
        u_time: { value: 0.0 },
      };
      const sphereGeometry = new THREE.SphereGeometry(1.5, 64, 64); // Changed geometry
      const sphereMaterial = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vNormal;
          void main() {
            vUv = uv;
            vNormal = normal;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        // NEW SUN SHADER
        fragmentShader: `
          uniform float u_time;
          varying vec2 vUv;
          varying vec3 vNormal;

          // Simple noise function (Fractal Brownian Motion)
          // Using sin/cos to avoid complex imports
          float fbm(vec2 p) {
              float value = 0.0;
              float amplitude = 0.5;
              float frequency = 2.0;
              for (int i = 0; i < 6; i++) {
                  value += amplitude * (0.5 + 0.5 * sin(frequency * p.x + u_time * 0.1) * sin(frequency * p.y + u_time * 0.1));
                  frequency *= 2.0;
                  amplitude *= 0.5;
              }
              return value;
          }

          void main() {
              float time = u_time * 0.1;
              
              // Create two layers of scrolling noise
              float noise1 = fbm(vUv * 3.0 + vec2(time * 0.5, 0.0));
              float noise2 = fbm(vUv * 6.0 - vec2(0.0, time * 0.3));
              float noise = (noise1 + noise2) * 0.5;

              // Color palette
              vec3 color1 = vec3(1.0, 0.8, 0.0); // Bright Yellow
              vec3 color2 = vec3(1.0, 0.2, 0.0); // Dark Orange
              vec3 color3 = vec3(0.8, 0.0, 0.0); // Red

              // Mix colors based on noise
              vec3 color = mix(color1, color2, smoothstep(0.4, 0.6, noise));
              color = mix(color, color3, smoothstep(0.7, 0.8, noise));
              
              // Add a "hot" core
              color = mix(color, vec3(1.0, 1.0, 0.8), 1.0 - smoothstep(0.3, 0.4, noise));

              // Add rim lighting (fresnel) to make edges glow
              float fresnel = 1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0));
              fresnel = pow(fresnel, 2.0);
              vec3 glowColor = vec3(1.0, 0.5, 0.0);
              color = mix(color, glowColor, fresnel * 0.8);

              gl_FragColor = vec4(color, 1.0);
          }
        `,
      });
      sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      scene.add(sphere);

      // Particle System
      const particleCount = 5000;
      const particlePositions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i++) {
        particlePositions[i * 3 + 0] = (Math.random() - 0.5) * 20;
        particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 20;
        particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      }
      const particleGeometry = new THREE.BufferGeometry();
      particleGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(particlePositions, 3)
      );
      const particleMaterial = new THREE.PointsMaterial({
        color: 0xffaa00, // Changed to orange
        size: 0.04, // Slightly larger
        transparent: true,
        opacity: 0.6, // A bit more opaque
        sizeAttenuation: true,
      });
      particles = new THREE.Points(particleGeometry, particleMaterial);
      scene.add(particles);

      // Event Listeners
      window.addEventListener('resize', handleResize);
      window.addEventListener('mousemove', handleMouseMove);
    };

    const handleResize = () => {
      if (mountRef.current && renderer) {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
    };

    const handleMouseMove = (event) => {
      // Normalize mouse position from -1 to 1
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Animate sphere
      sphere.rotation.y = elapsedTime * 0.1;
      sphere.rotation.x = elapsedTime * 0.05;
      sphere.material.uniforms.u_time.value = elapsedTime;

      // Animate particles
      particles.rotation.y = elapsedTime * 0.03; // Slightly faster swirl
      particles.rotation.x = elapsedTime * 0.01;

      // Parallax mouse movement
      camera.position.x += (mouseRef.current.x * 2 - camera.position.x) * 0.05;
      camera.position.y += (mouseRef.current.y * 2 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    if (mountRef.current) {
      init();
      animate();
    }

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current && renderer.domElement) {
        if (renderer.domElement.parentNode === mountRef.current) {
          mountRef.current.removeChild(renderer.domElement);
        }
      }
      // Dispose of three.js objects
      try {
        scene.traverse((object) => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((material) => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
        if (renderer) renderer.dispose();
      } catch (e) {
        console.error('Error disposing three.js objects:', e);
      }
    };
  }, []);

  return (
    <div className="relative flex items-center justify-center min-h-screen text-center text-white overflow-hidden">
      {/* 3D Background Canvas */}
      <div
        ref={mountRef}
        className="absolute top-0 left-0 w-full h-full z-0"
      />

      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col items-center p-4">
        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tighter"
          style={{
            textShadow:
              '0 2px 10px rgba(255, 255, 255, 0.3), 0 5px 20px rgba(255, 255, 255, 0.2)',
          }}
        >
          NGO Donation and Volunteer Management system
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-6 text-lg md:text-xl text-gray-200 max-w-2xl"
        >
          Connecting those who want to help with those who need it most. Join a
          community of change-makers today.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          <motion.button
            onClick={() => setPage('signup')}
            className="mt-10 px-8 py-3 bg-white text-black font-semibold rounded-lg shadow-lg transition-all duration-300 ease-in-out
                       hover:shadow-[0_0_20px_rgba(255,255,255,0.8),_0_0_30px_rgba(255,255,255,0.6)]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started
            <ArrowRight className="inline-block w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

const LandingPage = ({ setPage }) => {
  return (
    <>
      {/* --- REPLACED HERO SECTION --- */}
      <HeroSection setPage={setPage} />

      {/* --- REST OF LANDING PAGE --- */}
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* NGO Related Content - CHANGED pt-16 to pt-8 */}
          <section className="pt-8 pb-16">
            <h2 className="text-3xl font-bold text-center text-white mb-12">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="p-6 bg-gray-900 rounded-xl shadow-2xl shadow-gray-900/50"
              >
                <div className="flex items-center justify-center w-16 h-16 bg-gray-800 rounded-full mx-auto mb-4">
                  <Building className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  NGOs Register
                </h3>
                <p className="text-gray-400">
                  Verified organizations showcase their projects and needs.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="p-6 bg-gray-900 rounded-xl shadow-2xl shadow-gray-900/50"
              >
                <div className="flex items-center justify-center w-16 h-16 bg-gray-800 rounded-full mx-auto mb-4">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Volunteers Join
                </h3>
                <p className="text-gray-400">
                  Find local opportunities and lend your time and skills.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="p-6 bg-gray-900 rounded-xl shadow-2xl shadow-gray-900/50"
              >
                <div className="flex items-center justify-center w-16 h-16 bg-gray-800 rounded-full mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Donors Give
                </h3>
                <p className="text-gray-400">
                  Securely donate to transparent causes you care about.
                </p>
              </motion.div>
            </div>
          </section>

          {/* Top Donors */}
          <section className="py-16">
            <h2 className="text-3xl font-bold text-center text-white mb-12">
              Our Top Donors
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {MOCK_TOP_DONORS.map((donor, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className="bg-gray-900 rounded-xl p-6 flex flex-col items-center text-center shadow-2xl shadow-gray-900/50"
                >
                  <img
                    src={donor.avatar}
                    alt={donor.name}
                    className="w-24 h-24 rounded-full mb-4 border-2 border-gray-700"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/100x100/1a1a1a/ffffff?text=??';
                    }}
                  />
                  <h3 className="text-xl font-semibold text-white">
                    {donor.name}
                  </h3>
                  <p className="text-gray-400">Contributed</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {donor.amount}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Quotation */}
          <section className="py-20 text-center">
            <motion.blockquote
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.3 }}
              className="max-w-3xl mx-auto"
            >
              <p className="text-3xl italic text-white leading-relaxed">
                "The best way to find yourself is to lose yourself in the service
                of others."
              </p>
              <cite className="block text-xl text-gray-400 mt-6 not-italic">
                — Mahatma Gandhi
              </cite>
            </motion.blockquote>
          </section>
        </div>
      </main>
    </>
  );
};

// --- START: --- RESTORED COMPONENTS ---

const AuthFormContainer = ({ title, children }) => (
  <PageContainer>
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{
          opacity: 1,
          scale: 1,
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'], // Animate background
        }}
        transition={{
          duration: 0.5,
          backgroundPosition: {
            duration: 20, // Slower duration for a subtle effect
            repeat: Infinity,
            ease: 'linear',
          },
        }}
        style={{
          // Subtle animated gradient
          background:
            'linear-gradient(270deg, #0a0a0a, #1a1a2a, #0a0a0a, #2a1a2a)',
          backgroundSize: '400% 400%',
        }}
        // Removed bg-gray-900, added new styles via `style` prop
        className="w-full max-w-md p-8 rounded-2xl shadow-2xl shadow-gray-900/50"
      >
        <h2 className="text-3xl font-bold text-center text-white mb-8">
          {title}
        </h2>
        {children}
      </motion.div>
    </div>
  </PageContainer>
);

const LoginPage = ({ setPage, setIsLoggedIn, setUserType }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (phone === '6304433782' && password === 'Nithin@1028') {
      setIsLoggedIn(true);
      setUserType('volunteer'); // Default to volunteer for this login
      setPage('home');
      setError('');
    } else {
      setError('Invalid phone number or password.');
    }
  };

  return (
    <AuthFormContainer title="Login">
      <form onSubmit={handleLogin} className="space-y-6">
        {error && (
          <p className="text-red-500 text-center bg-red-900/20 p-2 rounded-lg">
            {error}
          </p>
        )}
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-300"
          >
            Phone Number
          </label>
          <div className="mt-1 relative">
            <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="phone"
              name="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
              placeholder=""
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-300"
          >
            Password
          </label>
          <div className="mt-1 relative">
            <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
              placeholder=""
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full py-3 px-4 bg-white text-black font-semibold rounded-lg shadow-lg hover:bg-gray-200 transition-colors duration-300"
        >
          Login
        </button>
        <p className="text-center text-gray-400">
          No account?{' '}
          <button
            onClick={() => setPage('signup')}
            className="font-medium text-white hover:underline"
          >
            Sign up
          </button>
        </p>
      </form>
    </AuthFormContainer>
  );
};

const SignupPage = ({ setPage }) => {
  return (
    <AuthFormContainer title="Join Us">
      <div className="space-y-6">
        <p className="text-center text-gray-300">
          Register as an organization or a volunteer to make a difference.
        </p>
        <button
          onClick={() => setPage('ngoRegister')}
          className="w-full py-3 px-4 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors duration-300 flex items-center justify-center"
        >
          <Building className="w-5 h-5 mr-2" />
          Register as an NGO
        </button>
        <button
          onClick={() => setPage('volunteerRegister')}
          className="w-full py-3 px-4 bg-white text-black font-semibold rounded-lg shadow-lg hover:bg-gray-200 transition-colors duration-300 flex items-center justify-center"
        >
          <User className="w-5 h-5 mr-2" />
          Register as a Volunteer
        </button>
        <p className="text-center text-gray-400 mt-6">
          Already have an account?{' '}
          <button
            onClick={() => setPage('login')}
            className="font-medium text-white hover:underline"
          >
            Log in
          </button>
        </p>
      </div>
    </AuthFormContainer>
  );
};

const FormSuccessMessage = ({ message, setPage }) => (
  <div className="text-center">
    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
    <p className="text-xl text-white mb-6">{message}</p>
    <button
      onClick={() => setPage('login')}
      className="py-2 px-6 bg-white text-black font-semibold rounded-lg shadow-lg hover:bg-gray-200 transition-colors duration-300"
    >
      Proceed to Login
    </button>
  </div>
);

const NgoRegisterPage = ({ setPage }) => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Form data would be collected here
    setSubmitted(true);
  };

  return (
    <AuthFormContainer title="Register Your NGO">
      {submitted ? (
        <FormSuccessMessage
          message="Data collected. We will review your application."
          setPage={setPage}
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="ngoName"
              className="block text-sm font-medium text-gray-300"
            >
              NGO Full Name
            </label>
            <div className="mt-1 relative">
              <Briefcase className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="ngoName"
                type="text"
                required
                className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
                placeholder="e.g., Hope Foundation"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="certificate"
              className="block text-sm font-medium text-gray-300"
            >
              Government Certification ID
            </label>
            <div className="mt-1 relative">
              <CheckCircle className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="certificate"
                type="text"
                required
                className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
                placeholder="Your official ID"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="services"
              className="block text-sm font-medium text-gray-300"
            >
              Services Offered / Mission
            </label>
            <div className="mt-1">
              <textarea
                id="services"
                rows="3"
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
                placeholder="Describe your mission and services..."
              ></textarea>
            </div>
          </div>
          <div>
            <label
              htmlFor="funding"
              className="block text-sm font-medium text-gray-300"
            >
              Expected Funding/Support Needed
            </label>
            <div className="mt-1 relative">
              <Target className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="funding"
                type="text"
                className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
                placeholder="e.g., ₹50,000 for new school"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-white text-black font-semibold rounded-lg shadow-lg hover:bg-gray-200 transition-colors duration-300"
          >
            Submit Application
          </button>
          <p className="text-center text-gray-400">
            <button
              onClick={() => setPage('signup')}
              className="font-medium text-white hover:underline"
            >
              Back to Signup
            </button>
          </p>
        </form>
      )}
    </AuthFormContainer>
  );
};

const VolunteerRegisterPage = ({ setPage }) => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <AuthFormContainer title="Register as a Volunteer">
      {submitted ? (
        <FormSuccessMessage
          message="Registration successful! Please log in."
          setPage={setPage}
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="volName"
              className="block text-sm font-medium text-gray-300"
            >
              Full Name
            </label>
            <div className="mt-1 relative">
              <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="volName"
                type="text"
                required
                className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
                placeholder="e.g., Nithin"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="volEmail"
              className="block text-sm font-medium text-gray-300"
            >
              Email Address
            </label>
            <div className="mt-1 relative">
              <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="volEmail"
                type="email"
                required
                className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="volPhone"
              className="block text-sm font-medium text-gray300"
            >
              Phone Number
            </label>
            <div className="mt-1 relative">
              <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="volPhone"
                type="tel"
                required
                className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
                placeholder="6304433782"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="volPassword"
              className="block text-sm font-medium text-gray-300"
            >
              Create Password
            </label>
            <div className="mt-1 relative">
              <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="volPassword"
                type="password"
                required
                className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
                placeholder="Nithin@1028"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-white text-black font-semibold rounded-lg shadow-lg hover:bg-gray-200 transition-colors duration-300"
          >
            Register
          </button>
          <p className="text-center text-gray-400">
            <button
              onClick={() => setPage('signup')}
              className="font-medium text-white hover:underline"
            >
              Back to Signup
            </button>
          </p>
        </form>
      )}
    </AuthFormContainer>
  );
};

const HomePage = ({ setPage, setSelectedNgo }) => {
  return (
    <PageContainer>
      <h1 className="text-4xl font-bold text-white mb-10">Welcome Back,</h1>

      {/* Our Help Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: 1,
          y: 0,
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 0.5,
          delay: 0.2,
          backgroundPosition: {
            duration: 15,
            repeat: Infinity,
            ease: 'linear',
            delay: 0.5,
          },
        }}
        style={{
          background:
            'linear-gradient(270deg, #1a1a1a, #2c2c2c, #1a1a1a, #3a3a3a)',
          backgroundSize: '400% 400%',
        }}
        className="mb-10 p-8 rounded-2xl shadow-2xl shadow-gray-900/50 overflow-hidden"
      >
        <h2 className="text-3xl font-semibold text-white mb-4">
          Our Company, Our Help
        </h2>
        <p className="text-gray-300 text-lg max-w-3xl">
          We are committed to bridging the gap between generosity and on-the-ground
          impact. Our platform provides the tools for volunteers and NGOs to
          connect seamlessly, ensuring that help is delivered efficiently and
          transparently.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Top NGOs Near You */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-gray-900 p-6 rounded-2xl shadow-2xl shadow-gray-900/50"
        >
          <h2 className="text-2xl font-semibold text-white mb-6">
            Top NGOs Near You
          </h2>
          <div className="space-y-4">
            {MOCK_NGOS.slice(0, 2).map((ngo) => (
              <div
                key={ngo.id}
                className="p-4 bg-gray-800 rounded-lg flex justify-between items-center"
              >
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {ngo.name}
                  </h3>
                  <p className="text-gray-400">{ngo.location}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedNgo(ngo);
                    setPage('donate');
                  }}
                  className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Donate
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => setPage('organisations')}
            className="text-white font-medium mt-6 hover:underline"
          >
            View All Organisations &rarr;
          </button>
        </motion.div>

        {/* Recent Donations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-gray-900 p-6 rounded-2xl shadow-2xl shadow-gray-900/50"
        >
          <h2 className="text-2xl font-semibold text-white mb-6">
            Recent Donations
          </h2>
          <ul className="space-y-4">
            {MOCK_RECENT_DONATIONS.map((donation, index) => (
              <li
                key={index}
                className="flex justify-between items-center p-4 bg-gray-800 rounded-lg"
              >
                <div>
                  <p className="text-white font-medium">
                    {donation.name} donated{' '}
                    <span className="font-bold">{donation.amount}</span>
                  </p>
                  <p className="text-gray-400 text-sm">to {donation.ngo}</p>
                </div>
                <CheckCircle className="w-6 h-6 text-green-500" />
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </PageContainer>
  );
};

const OrganisationsPage = ({ setPage, setSelectedNgo }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredNgos, setFilteredNgos] = useState(MOCK_NGOS);

  useEffect(() => {
    const results = MOCK_NGOS.filter(
      (ngo) =>
        ngo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ngo.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredNgos(results);
  }, [searchTerm]);

  return (
    <PageContainer>
      <h1 className="text-4xl font-bold text-white mb-10">
        Find Organisations
      </h1>

      {/* Search Bar */}
      <div className="mb-8">
        <label htmlFor="search" className="sr-only">
          Search by place or name
        </label>
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            id="search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
            placeholder="Search by place (e.g., Mumbai) or name..."
          />
        </div>
      </div>

      {/* NGO List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNgos.map((ngo) => (
          <motion.div
            key={ngo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-900 rounded-xl shadow-2xl shadow-gray-900/50 overflow-hidden flex flex-col"
          >
            <div className="p-6 flex-grow">
              <h3 className="text-2xl font-semibold text-white mb-2">
                {ngo.name}
              </h3>
              <p className="text-gray-400 mb-4 flex items-center">
                <MapPin className="w-4 h-4 mr-2" /> {ngo.location}
              </p>
              <p className="text-gray-300 mb-4">{ngo.description}</p>
            </div>
            <div className="p-6 bg-gray-800/50 mt-auto">
              <p className="text-white text-lg font-medium mb-4">
                <HandHeart className="w-5 h-5 inline-block mr-2" />
                {ngo.volunteersNeeded} Volunteers Wanted
              </p>
              <button
                onClick={() => {
                  setSelectedNgo(ngo);
                  setPage('donate');
                }}
                className="w-full py-2 px-4 bg-white text-black font-semibold rounded-lg shadow-lg hover:bg-gray-200 transition-colors duration-300"
              >
                Donate Now
              </button>
            </div>
          </motion.div>
        ))}
        {filteredNgos.length === 0 && (
          <p className="text-gray-300 text-center col-span-full">
            No organisations found matching your search.
          </p>
        )}
      </div>
    </PageContainer>
  );
};

// --- NEW SVG ICON COMPONENTS ---

// A simple mock QR code SVG
const MockQRCode = () => (
  <svg
    className="w-full max-w-[250px] h-auto mx-auto rounded-lg"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="100" height="100" fill="white" />
    <rect x="10" y="10" width="30" height="30" fill="black" />
    <rect x="15" y="15" width="20" height="20" fill="white" />
    <rect x="18" y="18" width="14" height="14" fill="black" />
    <rect x="60" y="10" width="30" height="30" fill="black" />
    <rect x="65" y="15" width="20" height="20" fill="white" />
    <rect x="68" y="18" width="14" height="14" fill="black" />
    <rect x="10" y="60" width="30" height="30" fill="black" />
    <rect x="15" y="65" width="20" height="20" fill="white" />
    <rect x="18" y="68" width="14" height="14" fill="black" />
    <rect x="45" y="45" width="10" height="10" fill="black" />
    <rect x="60" y="45" width="5" height="5" fill="black" />
    <rect x="70" y="40" width="5" height="5" fill="black" />
    <rect x="40" y="60" width="5" height="5" fill="black" />
    <rect x="45" y="65" width="10" height="10" fill="black" />
    <rect x="60" y="60" width="10" height="10" fill="black" />
    <rect x="75" y="65" width="5" height="10" fill="black" />
    <rect x="65" y="75" width="10" height="5" fill="black" />
    <rect x="80" y="80" width="10" height="10" fill="black" />
    <rect x="40" y="80" width="15" height="5" fill="black" />
    <rect x="50" y="85" width="5" height="5" fill="black" />
  </svg>
);

// A simple PhonePe logo
const PhonePeLogo = () => (
  <svg
    width="100"
    height="25"
    viewBox="0 0 100 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12.5 0C5.596 0 0 5.596 0 12.5C0 19.404 5.596 25 12.5 25C19.404 25 25 19.404 25 12.5C25 5.596 19.404 0 12.5 0ZM15.82 18.164H13.636V16.036C13.636 15.08 13.568 14.332 13.432 13.792C13.296 13.252 13.06 12.832 12.724 12.532C12.388 12.232 11.972 12.082 11.476 12.082C10.888 12.082 10.384 12.262 9.964 12.622C9.544 12.982 9.244 13.468 9.064 14.08C8.884 14.692 8.794 15.46 8.794 16.384V18.164H6.61V6.836H8.794V9.088C9.28 8.188 9.94 7.564 10.774 7.216C11.608 6.868 12.514 6.694 13.492 6.694C14.194 6.694 14.836 6.79 15.418 6.982C16.0 7.174 16.51 7.468 16.948 7.864C17.386 8.26 17.746 8.746 18.028 9.322C18.31 9.898 18.454 10.534 18.46 11.23H18.448C18.394 10.738 18.28 10.282 18.106 9.862C17.932 9.442 17.686 9.076 17.368 8.764C17.05 8.452 16.672 8.206 16.234 8.026C15.796 7.846 15.304 7.756 14.758 7.756C13.84 7.756 13.048 7.978 12.382 8.422C11.716 8.866 11.194 9.514 10.816 10.366C10.438 11.218 10.249 12.238 10.249 13.426V13.888C10.423 13.468 10.669 13.144 10.987 12.916C11.305 12.688 11.677 12.574 12.103 12.574C12.793 12.574 13.315 12.814 13.669 13.294C14.023 13.774 14.2 14.47 14.2 15.382V18.164H15.82V18.164Z"
      fill="#502E8E"
    />
    <path
      d="M34.792 6.836H39.928V8.264H36.968V11.594H39.622V13.022H36.968V16.736H40.078V18.164H34.792V6.836Z"
      fill="#502E8E"
    />
    <path
      d="M51.103 18.164H48.967L45.871 12.734H43.687V18.164H41.511V6.836H45.871C46.855 6.836 47.665 6.992 48.295 7.304C48.925 7.616 49.387 8.066 49.675 8.654C49.963 9.242 50.107 9.932 50.107 10.724C50.107 11.408 49.993 12.02 49.765 12.56C49.537 13.1 49.195 13.544 48.739 13.892C48.283 14.24 47.725 14.414 47.065 14.414H44.671L46.999 18.164H51.103ZM43.687 11.396H46.723C47.245 11.396 47.623 11.306 47.857 11.126C48.091 10.946 48.208 10.694 48.208 10.37C48.208 10.034 48.094 9.776 47.866 9.596C47.638 9.416 47.278 9.326 46.786 9.326H43.687V11.396Z"
      fill="#502E8E"
    />
    <path
      d="M60.101 18.164H57.965L54.869 12.734H52.685V18.164H50.509V6.836H54.869C55.853 6.836 56.663 6.992 57.293 7.304C57.923 7.616 58.385 8.066 58.673 8.654C58.961 9.242 59.105 9.932 59.105 10.724C59.105 11.408 58.991 12.02 58.763 12.56C58.535 13.1 58.193 13.544 57.737 13.892C57.281 14.24 56.723 14.414 56.063 14.414H53.669L55.997 18.164H60.101ZM52.685 11.396H55.721C56.243 11.396 56.621 11.306 56.855 11.126C57.089 10.946 57.206 10.694 57.206 10.37C57.206 10.034 57.092 9.776 56.864 9.596C56.636 9.416 56.276 9.326 55.784 9.326H52.685V11.396Z"
      fill="#502E8E"
    />
    <path
      d="M64.717 6.836H66.893V18.164H64.717V6.836Z"
      fill="#502E8E"
    />
    <path
      d="M76.911 18.164H74.735V9.47L72.483 18.164H70.731L68.479 9.47V18.164H66.303V6.836H69.453L71.601 15.308L73.749 6.836H76.911V18.164Z"
      fill="#502E8E"
    />
    <path
      d="M86.304 18.164H84.12V6.836H86.304V8.996C86.724 8.12 87.354 7.5 88.194 7.136C89.034 6.772 89.94 6.59 90.912 6.59C92.484 6.59 93.774 7.07 94.782 8.03C95.79 8.99 96.294 10.298 96.294 11.954C96.294 13.61 95.79 14.918 94.782 15.878C93.774 16.838 92.484 17.318 90.912 17.318C89.94 17.318 89.034 17.136 88.194 16.772C87.354 16.408 86.724 15.784 86.304 14.908V18.164ZM90.816 16.034C91.68 16.034 92.364 15.77 92.868 15.242C93.372 14.714 93.624 13.988 93.624 13.064V12.92C93.624 12.02 93.372 11.294 92.868 10.742C92.364 10.19 91.68 9.914 90.816 9.914C89.952 9.914 89.268 10.19 88.764 10.742C88.26 11.294 88.008 12.02 88.008 12.92V13.064C88.008 13.988 88.26 14.714 88.764 15.242C89.268 15.77 89.952 16.034 90.816 16.034Z"
      fill="#502E8E"
    />
  </svg>
);

// A simple Paytm logo
const PaytmLogo = () => (
  <svg
    className="w-auto h-6"
    viewBox="0 0 108 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M80.052 23.447C79.16 23.974 78.07 24.238 76.781 24.238C75.187 24.238 73.9 23.821 72.918 22.986C71.936 22.152 71.445 21.01 71.445 19.56V11.534H74.34V19.252C74.34 20.19 74.569 20.82 75.027 21.142C75.485 21.464 76.103 21.625 76.88 21.625C77.452 21.625 77.96 21.528 78.406 21.334V23.447H80.052Z"
      fill="#002E6E"
    />
    <path
      d="M87.653 11.534H90.81V13.336H87.653V11.534Z"
      fill="#002E6E"
    />
    <path
      d="M87.653 15.111H90.81V24.085H87.653V15.111Z"
      fill="#002E6E"
    />
    <path
      d="M93.313 11.534H96.471V24.085H93.313V11.534Z"
      fill="#002E6E"
    />
    <path
      d="M104.99 19.383C104.99 20.303 104.755 21.03 104.285 21.567C103.815 22.103 103.141 22.371 102.263 22.371C101.405 22.371 100.73 22.11 100.24 21.587C99.749 22.11 99.074 22.371 98.216 22.371C97.338 22.371 96.663 22.103 96.193 21.567C95.723 21.03 95.488 20.303 95.488 19.383V11.534H98.383V19.141C98.383 19.986 98.636 20.409 99.144 20.409C99.652 20.409 99.905 19.986 99.905 19.141V11.534H102.8V19.141C102.8 19.986 103.053 20.409 103.561 20.409C104.07 20.409 104.323 19.986 104.323 19.141V11.534H107.218V24.085H105.326C105.158 23.511 105.009 23.014 104.99 22.593V19.383H104.99Z"
      fill="#002E6E"
    />
    <path
      d="M32.531 24.238C30.658 24.238 29.13 23.821 27.946 22.986C26.762 22.152 26.17 21.01 26.17 19.56V11.534H29.064V19.252C29.064 20.19 29.293 20.82 29.751 21.142C30.209 21.464 30.827 21.625 31.604 21.625C32.381 21.625 32.999 21.464 33.457 21.142C33.915 20.82 34.144 20.19 34.144 19.252V11.534H37.039V24.085H35.481V23.447C34.588 23.974 33.518 24.238 32.531 24.238Z"
      fill="#00B9F1"
    />
    <path
      d="M45.548 24.085H42.39V11.534H45.548V24.085Z"
      fill="#00B9F1"
    />
    <path
      d="M51.209 11.534H54.367V24.085H51.209V11.534Z"
      fill="#00B9F1"
    />
    <path
      d="M62.883 19.383C62.883 20.303 62.648 21.03 62.178 21.567C61.708 22.103 61.033 22.371 60.155 22.371C59.297 22.371 58.623 22.11 58.132 21.587C57.641 22.11 56.966 22.371 56.108 22.371C55.23 22.371 54.555 22.103 54.085 21.567C53.615 21.03 53.38 20.303 53.38 19.383V11.534H56.275V19.141C56.275 19.986 56.528 20.409 57.036 20.409C57.544 20.409 57.797 19.986 57.797 19.141V11.534H60.692V19.141C60.692 19.986 60.945 20.409 61.453 20.409C61.961 20.409 62.215 19.986 62.215 19.141V11.534H65.11V24.085H63.218C63.05 23.511 62.901 23.014 62.883 22.593V19.383H62.883Z"
      fill="#00B9F1"
    />
    <path
      d="M70.088 11.534H73.246V13.336H70.088V11.534Z"
      fill="#00B9F1"
    />
    <path
      d="M70.088 15.111H73.246V24.085H70.088V15.111Z"
      fill="#00B9F1"
    />
    <path
      d="M0 11.534H7.135V13.793H2.889V16.711H6.703V18.97H2.889V21.826H7.135V24.085H0V11.534Z"
      fill="#00B9F1"
    />
    <path
      d="M15.424 11.534H21.439V13.793H18.313V16.711H21.006V18.97H18.313V24.085H15.424V11.534Z"
      fill="#00B9F1"
    />
    <path
      d="M8.225 11.534H11.383V24.085H8.225V11.534Z"
      fill="#00B9F1"
    />
    <path
      d="M38.128 11.534H41.286V24.085H38.128V11.534Z"
      fill="#002E6E"
    />
  </svg>
);

// A simple Google Pay logo
const GooglePayLogo = () => (
  <svg
    className="w-auto h-6"
    viewBox="0 0 54 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9.168 12.016V14.61H14.11C13.913 15.93 12.932 16.897 11.602 16.897C9.97 16.897 8.64 15.54 8.64 13.91C8.64 12.28 9.97 10.923 11.602 10.923C12.44 10.923 13.16 11.233 13.73 11.77L15.65 9.92C14.54 8.92 13.15 8.35 11.6 8.35C8.32 8.35 5.65 10.84 5.65 13.91C5.65 16.98 8.32 19.47 11.6 19.47C14.81 19.47 17.1 17.1 17.1 14.01C17.1 13.56 17.07 13.12 16.99 12.69H11.602V12.016H9.168Z"
      fill="#5F6368"
    />
    <path
      d="M53.13 8.468H50.75V19.368H53.13V8.468Z"
      fill="#5F6368"
    />
    <path
      d="M47.788 8.468L42.668 15.658V8.468H40.288V19.368H42.508L47.978 11.758V19.368H50.198V8.468H47.788Z"
      fill="#5F6368"
    />
    <path
      d="M34.303 16.998C35.913 16.998 37.123 15.798 37.123 14.218C37.123 12.638 35.913 11.438 34.303 11.438C32.693 11.438 31.483 12.638 31.483 14.218C31.483 15.798 32.693 16.998 34.303 16.998ZM34.303 8.468C31.253 8.468 28.983 10.898 28.983 14.218C28.983 17.538 31.253 19.968 34.303 19.968C37.353 19.968 39.623 17.538 39.623 14.218C39.623 10.898 37.353 8.468 34.303 8.468Z"
      fill="#5F6368"
    />
    <path
      d="M21.984 16.998C23.594 16.998 24.804 15.798 24.804 14.218C24.804 12.638 23.594 11.438 21.984 11.438C20.374 11.438 19.164 12.638 19.164 14.218C19.164 15.798 20.374 16.998 21.984 16.998ZM21.984 8.468C18.934 8.468 16.664 10.898 16.664 14.218C16.664 17.538 18.934 19.968 21.984 19.968C25.034 19.968 27.304 17.538 27.304 14.218C27.304 10.898 25.034 8.468 21.984 8.468Z"
      fill="#5F6368"
    />
    <path
      d="M3.56 6.948L0 4.318V17.018L3.56 19.648V6.948Z"
      fill="#FBBC04"
    />
    <path
      d="M7.18 3.518L3.62 0L0 4.318L3.58 7.028L7.18 3.518Z"
      fill="#EA4335"
    />
    <path
      d="M3.58 12.188L0 14.898L3.62 19.218L7.18 15.708L3.58 12.188Z"
      fill="#34A853"
    />
    <path
      d="M0 9.608L3.56 6.948V12.258L0 9.608Z"
      fill="#1967D2"
    />
  </svg>
);

const DonatePage = ({ setPage, selectedNgo }) => {
  const [showScanner, setShowScanner] = useState(false);
  const [amount, setAmount] = useState(50);

  if (!selectedNgo) {
    return (
      <PageContainer>
        <div className="text-center">
          <h2 className="text-2xl text-white mb-4">
            No Organisation Selected
          </h2>
          <p className="text-gray-400 mb-6">
            Please select an organisation to donate to.
          </p>
          <button
            onClick={() => setPage('organisations')}
            className="py-2 px-6 bg-white text-black font-semibold rounded-lg shadow-lg hover:bg-gray-200 transition-colors duration-300"
          >
            View Organisations
          </button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-lg mx-auto bg-gray-900 rounded-2xl shadow-2xl shadow-gray-900/50 p-8">
        {!showScanner ? (
          <>
            <h1 className="text-3xl font-bold text-white mb-2 text-center">
              Donate to
            </h1>
            <h2 className="text-2xl font-semibold text-gray-200 mb-6 text-center">
              {selectedNgo.name}
            </h2>
            <p className="text-gray-400 text-center mb-6">
              {selectedNgo.description}
            </p>
            <div className="mb-6">
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Select Amount (INR)
              </label>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[10, 25, 50, 100, 250, 500].map((val) => (
                  <button
                    key={val}
                    onClick={() => setAmount(val)}
                    className={`py-3 rounded-lg font-medium transition-colors ${
                      amount === val
                        ? 'bg-white text-black'
                        : 'bg-gray-800 text-white hover:bg-gray-700'
                    }`}
                  >
                    ₹{val}
                  </button>
                ))}
              </div>
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
                placeholder="Or enter custom amount"
              />
            </div>
            <button
              onClick={() => setShowScanner(true)}
              className="w-full py-3 px-4 bg-white text-black font-semibold rounded-lg shadow-lg hover:bg-gray-200 transition-colors duration-300 flex items-center justify-center"
            >
              <DollarSign className="w-5 h-5 mr-2" />
              Proceed to Donate ₹{amount}
            </button>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <h2 className="text-2xl font-semibold text-white mb-4">
              Scan to Pay
            </h2>
            <p className="text-gray-300 mb-6">
              You are donating ₹{amount} to {selectedNgo.name}
            </p>

            {/* PhonePe Logo and QR Code Placeholder */}
            <div className="bg-white p-4 rounded-lg max-w-xs mx-auto">
              <div className="flex justify-center items-center mb-4">
                <PhonePeLogo />
              </div>
              <MockQRCode />
            </div>

            {/* --- OR Separator --- */}
            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-gray-700"></div>
              <span className="mx-4 text-gray-500 text-sm">OR</span>
              <div className="flex-grow border-t border-gray-700"></div>
            </div>

            {/* --- Paytm and Google Pay Buttons --- */}
            <div className="grid grid-cols-2 gap-4">
              <button className="w-full py-3 px-4 bg-[#002E6E] text-white font-semibold rounded-lg shadow-lg hover:bg-[#002E6E]/90 transition-colors duration-300 flex items-center justify-center">
                <PaytmLogo />
              </button>
              <button className="w-full py-3 px-4 bg-gray-200 text-black font-semibold rounded-lg shadow-lg hover:bg-gray-300 transition-colors duration-300 flex items-center justify-center">
                <GooglePayLogo />
              </button>
            </div>

            <button
              onClick={() => setShowScanner(false)}
              className="mt-8 text-white font-medium hover:underline"
            >
              Back
            </button>
          </motion.div>
        )}
      </div>
    </PageContainer>
  );
};

const ProfilePage = ({ setPage, setIsLoggedIn, setUserType }) => {
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserType(null);
    setPage('landing');
  };

  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-10">Profile</h1>
        <div className="bg-gray-900 rounded-2xl shadow-2xl shadow-gray-900/50 p-8">
          <div className="flex flex-col sm:flex-row sm:items-center mb-8">
            <img
              src="https://placehold.co/100x100/1a1a1a/ffffff?text=N"
              alt="Profile"
              className="w-24 h-24 rounded-full mb-4 sm:mb-0 sm:mr-6 border-2 border-gray-700"
            />
            <div>
              <h2 className="text-3xl font-semibold text-white">
                {MOCK_USER_PROFILE.name}
              </h2>
              <p className="text-gray-400">Volunteer</p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center p-4 bg-gray-800 rounded-lg">
              <Phone className="w-5 h-5 text-gray-400 mr-4" />
              <span className="text-white">{MOCK_USER_PROFILE.phone}</span>
            </div>
            <div className="flex items-center p-4 bg-gray-800 rounded-lg">
              <Mail className="w-5 h-5 text-gray-400 mr-4" />
              <span className="text-white">{MOCK_USER_PROFILE.email}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8 text-center">
            <div className="bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-400">Volunteer Hours</p>
              <p className="text-2xl font-bold text-white">
                {MOCK_USER_PROFILE.volunteerHours}
              </p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-400">Donations Made</p>
              <p className="text-2xl font-bold text-white">
                {MOCK_USER_PROFILE.donationsMade}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-3 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors duration-300 flex items-center justify-center"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </button>
        </div>
      </div>
    </PageContainer>
  );
};

// --- Navigation & Footer ---

const NavBar = ({ page, isLoggedIn, setPage }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = isLoggedIn
    ? [
        { name: 'Home', page: 'home' },
        { name: 'Organisations', page: 'organisations' },
        { name: 'Donate', page: 'donate' },
        { name: 'Profile', page: 'profile' },
      ]
    : [
        { name: 'Home', page: 'landing' },
        { name: 'About', page: 'landing' }, // Simple link to landing
        { name: 'Contact', page: 'landing' }, // Simple link to landing
      ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-black/70 backdrop-blur-md z-50 shadow-lg shadow-gray-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div
            onClick={() => setPage(isLoggedIn ? 'home' : 'landing')}
            className="flex-shrink-0 flex items-center cursor-pointer"
          >
            <Heart className="w-8 h-8 text-white" />
            <span className="text-white text-xl font-bold ml-2">NGOConnect</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => setPage(item.page)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  page === item.page
                    ? 'text-white bg-gray-800'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                {item.name}
              </button>
            ))}
            {!isLoggedIn && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage('login')}
                  className="px-4 py-2 rounded-md text-sm font-medium text-white bg-gray-800/50 hover:bg-gray-700 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => setPage('signup')}
                  className="px-4 py-2 rounded-md text-sm font-medium text-black bg-white hover:bg-gray-200 transition-colors"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-800 focus:outline-none"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    setPage(item.page);
                    setMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                    page === item.page
                      ? 'text-white bg-gray-800'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  {item.name}
                </button>
              ))}
              {!isLoggedIn && (
                <div className="border-t border-gray-700 pt-3 space-y-2">
                  <button
                    onClick={() => {
                      setPage('login');
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800/50"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setPage('signup');
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-black bg-white hover:bg-gray-200"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Footer = () => {
  return (
    <footer className="bg-gray-900/80 w-full z-10 relative border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Heart className="w-8 h-8 text-white" />
              <span className="text-white text-xl font-bold ml-2">
                NGOConnect
              </span>
            </div>
            <p className="text-gray-400">
              Connecting change-makers. Empowering communities.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-white"
                aria-label="Twitter"
              >
                <Twitter className="w-6 h-6" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white"
                aria-label="GitHub"
              >
                <Github className="w-6 h-6" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-500">
            &copy; {new Date().getFullYear()} NGOConnect. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

// --- END: --- RESTORED COMPONENTS ---

// --- Main App Component ---

export default function App() {
  const [page, setPage] = useState('landing'); // landing, login, signup, ngoRegister, volunteerRegister, home, organisations, donate, profile
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null); // 'ngo' or 'volunteer'
  const [selectedNgo, setSelectedNgo] = useState(null);

  const renderPage = () => {
    switch (page) {
      case 'landing':
        // LandingPage now renders its own Hero + <main>
        return <LandingPage key="landing" setPage={setPage} />;

      // All other pages are wrapped in <main> with padding-top
      // to offset the fixed navbar
      case 'login':
        return (
          <main className="pt-20">
            <LoginPage
              key="login"
              setPage={setPage}
              setIsLoggedIn={setIsLoggedIn}
              setUserType={setUserType}
            />
          </main>
        );
      case 'signup':
        return (
          <main className="pt-20">
            <SignupPage key="signup" setPage={setPage} />
          </main>
        );
      case 'ngoRegister':
        return (
          <main className="pt-20">
            <NgoRegisterPage key="ngoRegister" setPage={setPage} />
          </main>
        );
      case 'volunteerRegister':
        return (
          <main className="pt-20">
            <VolunteerRegisterPage key="volunteerRegister" setPage={setPage} />
          </main>
        );
      case 'home':
        return (
          <main className="pt-20">
            <HomePage
              key="home"
              setPage={setPage}
              setSelectedNgo={setSelectedNgo}
            />
          </main>
        );
      case 'organisations':
        return (
          <main className="pt-20">
            <OrganisationsPage
              key="organisations"
              setPage={setPage}
              setSelectedNgo={setSelectedNgo}
            />
          </main>
        );
      case 'donate':
        return (
          <main className="pt-20">
            <DonatePage
              key="donate"
              setPage={setPage}
              selectedNgo={selectedNgo}
            />
          </main>
        );
      case 'profile':
        return (
          <main className="pt-20">
            <ProfilePage
              key="profile"
              setPage={setPage}
              setIsLoggedIn={setIsLoggedIn}
              setUserType={setUserType}
            />
          </main>
        );
      default:
        return <LandingPage key="default" setPage={setPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 font-sans relative overflow-x-hidden">
      {/* Simple Gradient Background */}
      <motion.div
        className="absolute inset-0 z-0 opacity-50"
        style={{
          background:
            'linear-gradient(270deg, #000000, #1a1a1a, #0a0a0a, #000000)',
          backgroundSize: '400% 400%',
          position: 'fixed', // Ensure it covers the screen
        }}
        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      />

      {/* Main Content */}
      <div className="relative z-10">
        <NavBar page={page} isLoggedIn={isLoggedIn} setPage={setPage} />

        {/* Page content is rendered here. */}
        <AnimatePresence mode="wait">{renderPage()}</AnimatePresence>

        {/* Footer is rendered at the bottom. */}
        <Footer />
      </div>
    </div>
  );
}
