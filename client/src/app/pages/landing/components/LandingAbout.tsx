import { motion } from "framer-motion";
import { BookHeart, Target, Users, Heart } from "lucide-react";
import { useState } from "react";
import { colors } from "@/lib/designSystem";

/**
 * About Us / Our Story section
 * - Glass morphism containers with floating animation
 * - Responsive layout (desktop: left/right, mobile: stacked)
 * - Hover effects with cursor glow
 * - Dark mode support
 */

interface StoryCard {
  icon: React.ElementType;
  title: string;
  text: string;
  color?: string;
}

const smallCards: StoryCard[] = [
  {
    icon: Target,
    title: "Mission",
    text: "To simplify self-discipline by turning everyday goals into habits that feel natural and rewarding.",
    color: colors.features.calendar // Green
  },
  {
    icon: Users,
    title: "Unity",
    text: "We grow better together — Displini connects people through shared routines, motivation, and encouragement.",
    color: colors.features.reminders // Pink
  },
  {
    icon: Heart,
    title: "Care",
    text: "Designed with mindfulness at its core, every feature supports your mental clarity, rest, and personal rhythm.",
    color: colors.features.ai // Yellow
  }
];

export function LandingAbout() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, cardId: string) => {
    if (hoveredCard === cardId) {
      const rect = e.currentTarget.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  return (
    <>
      {/* Desktop Version - Single Section */}
      <section 
        data-section="about"
        className="hidden lg:flex relative py-20 px-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-300 items-center justify-center"
        style={{ scrollSnapAlign: 'center', minHeight: '100vh' }}
      >
        <div className="container mx-auto max-w-7xl">
          {/* Desktop Layout: Left (Our Story) + Right (3 cards stacked) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch mx-auto">
          {/* Left Side - Our Story (Large Card) */}
          <motion.div
            className="relative h-full"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            onMouseEnter={() => setHoveredCard('story')}
            onMouseLeave={() => setHoveredCard(null)}
            onMouseMove={(e) => handleMouseMove(e, 'story')}
          >
            <motion.div
              className="relative bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden h-full flex items-center"
              animate={{
                y: [0, -10, 0],
                scale: hoveredCard === 'story' ? 1.02 : 1,
                boxShadow: hoveredCard === 'story' 
                  ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' 
                  : '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
              }}
              transition={{ 
                y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                scale: { duration: 0.3 },
                boxShadow: { duration: 0.3 }
              }}
            >
              {/* Cursor Glow Effect */}
              {hoveredCard === 'story' && (
                <motion.div
                  className="absolute pointer-events-none rounded-full blur-3xl opacity-30"
                  style={{
                    width: '300px',
                    height: '300px',
                    background: `radial-gradient(circle, ${colors.features.todo}66 0%, transparent 70%)`,
                    left: mousePosition.x - 150,
                    top: mousePosition.y - 150,
                  }}
                  animate={{
                    left: mousePosition.x - 150,
                    top: mousePosition.y - 150,
                  }}
                  transition={{ type: "spring", damping: 30, stiffness: 200 }}
                />
              )}

              <div className="relative z-10 flex flex-col items-center text-center">
                {/* Icon */}
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
                  style={{ backgroundColor: `${colors.features.todo}20` }}
                >
                  <BookHeart className="w-8 h-8" style={{ color: colors.features.todo }} />
                </div>

                {/* Title */}
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                  Our Story
                </h3>

                {/* Text */}
                <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                  Displini was born from the idea that structure brings freedom. We built a space where focus, balance, and wellbeing work together — helping you stay consistent without losing calm.
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Three Small Cards Stacked */}
          <div className="flex flex-col gap-8">
            {smallCards.map((card, index) => {
              const Icon = card.icon;
              const cardId = card.title.toLowerCase();
              
              return (
                <motion.div
                  key={cardId}
                  className="relative"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  onMouseEnter={() => setHoveredCard(cardId)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onMouseMove={(e) => handleMouseMove(e, cardId)}
                >
                  <motion.div
                    className="relative bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 rounded-2xl p-6 md:p-8 shadow-xl overflow-hidden"
                    animate={{
                      y: [0, -8, 0],
                      scale: hoveredCard === cardId ? 1.02 : 1,
                      boxShadow: hoveredCard === cardId 
                        ? '0 20px 40px -10px rgba(0, 0, 0, 0.25)' 
                        : '0 10px 20px -5px rgba(0, 0, 0, 0.1)'
                    }}
                    transition={{ 
                      y: { duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: index * 0.3 },
                      scale: { duration: 0.3 },
                      boxShadow: { duration: 0.3 }
                    }}
                  >
                    {/* Cursor Glow Effect */}
                    {hoveredCard === cardId && (
                      <motion.div
                        className="absolute pointer-events-none rounded-full blur-3xl opacity-30"
                        style={{
                          width: '250px',
                          height: '250px',
                          background: `radial-gradient(circle, ${card.color}66 0%, transparent 70%)`,
                          left: mousePosition.x - 125,
                          top: mousePosition.y - 125,
                        }}
                        animate={{
                          left: mousePosition.x - 125,
                          top: mousePosition.y - 125,
                        }}
                        transition={{ type: "spring", damping: 30, stiffness: 200 }}
                      />
                    )}

                    <div className="relative z-10 flex flex-col items-center text-center">
                      {/* Icon */}
                      <div 
                        className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                        style={{ backgroundColor: `${card.color}20` }}
                      >
                        <Icon className="w-7 h-7" style={{ color: card.color }} />
                      </div>

                      {/* Title */}
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                        {card.title}
                      </h3>

                      {/* Text */}
                      <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                        {card.text}
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
          </div>
        </div>
      </section>

      {/* Mobile Version - Split into Two Sections */}
      
      {/* Section 1: Our Story */}
      <section
        data-section="about-story"
        className="lg:hidden relative py-20 px-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-300 flex items-center justify-center"
        style={{ scrollSnapAlign: 'center', minHeight: '100vh' }}
      >
        <div className="container mx-auto max-w-md">
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            onMouseEnter={() => setHoveredCard('story-mobile')}
            onMouseLeave={() => setHoveredCard(null)}
            onMouseMove={(e) => handleMouseMove(e, 'story-mobile')}
          >
            <motion.div
              className="relative bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 rounded-3xl p-8 shadow-2xl overflow-hidden"
              animate={{
                y: [0, -10, 0],
                scale: hoveredCard === 'story-mobile' ? 1.02 : 1,
                boxShadow: hoveredCard === 'story-mobile' 
                  ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' 
                  : '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
              }}
              transition={{ 
                y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                scale: { duration: 0.3 },
                boxShadow: { duration: 0.3 }
              }}
            >
              {/* Cursor Glow Effect */}
              {hoveredCard === 'story-mobile' && (
                <motion.div
                  className="absolute pointer-events-none rounded-full blur-3xl opacity-30"
                  style={{
                    width: '300px',
                    height: '300px',
                    background: `radial-gradient(circle, ${colors.features.todo}66 0%, transparent 70%)`,
                    left: mousePosition.x - 150,
                    top: mousePosition.y - 150,
                  }}
                  animate={{
                    left: mousePosition.x - 150,
                    top: mousePosition.y - 150,
                  }}
                  transition={{ type: "spring", damping: 30, stiffness: 200 }}
                />
              )}

              <div className="relative z-10 flex flex-col items-center text-center">
                {/* Icon */}
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
                  style={{ backgroundColor: `${colors.features.todo}20` }}
                >
                  <BookHeart className="w-8 h-8" style={{ color: colors.features.todo }} />
                </div>

                {/* Title */}
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  Our Story
                </h3>

                {/* Text */}
                <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                  Displini was born from the idea that structure brings freedom. We built a space where focus, balance, and wellbeing work together — helping you stay consistent without losing calm.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Section 2: Mission, Unity, Care */}
      <section
        data-section="about-values"
        className="lg:hidden relative py-20 px-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-300 flex items-center justify-center"
        style={{ scrollSnapAlign: 'center', minHeight: '100vh' }}
      >
        <div className="container mx-auto max-w-md">
          <div className="flex flex-col gap-8">
            {smallCards.map((card, index) => {
              const Icon = card.icon;
              const cardId = `${card.title.toLowerCase()}-mobile`;
              
              return (
                <motion.div
                  key={cardId}
                  className="relative"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  onMouseEnter={() => setHoveredCard(cardId)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onMouseMove={(e) => handleMouseMove(e, cardId)}
                >
                  <motion.div
                    className="relative bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 rounded-2xl p-6 shadow-xl overflow-hidden"
                    animate={{
                      y: [0, -8, 0],
                      scale: hoveredCard === cardId ? 1.02 : 1,
                      boxShadow: hoveredCard === cardId 
                        ? '0 20px 40px -10px rgba(0, 0, 0, 0.25)' 
                        : '0 10px 20px -5px rgba(0, 0, 0, 0.1)'
                    }}
                    transition={{ 
                      y: { duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: index * 0.3 },
                      scale: { duration: 0.3 },
                      boxShadow: { duration: 0.3 }
                    }}
                  >
                    {/* Cursor Glow Effect */}
                    {hoveredCard === cardId && (
                      <motion.div
                        className="absolute pointer-events-none rounded-full blur-3xl opacity-30"
                        style={{
                          width: '250px',
                          height: '250px',
                          background: `radial-gradient(circle, ${card.color}66 0%, transparent 70%)`,
                          left: mousePosition.x - 125,
                          top: mousePosition.y - 125,
                        }}
                        animate={{
                          left: mousePosition.x - 125,
                          top: mousePosition.y - 125,
                        }}
                        transition={{ type: "spring", damping: 30, stiffness: 200 }}
                      />
                    )}

                    <div className="relative z-10 flex flex-col items-center text-center">
                      {/* Icon */}
                      <div 
                        className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                        style={{ backgroundColor: `${card.color}20` }}
                      >
                        <Icon className="w-7 h-7" style={{ color: card.color }} />
                      </div>

                      {/* Title */}
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                        {card.title}
                      </h3>

                      {/* Text */}
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {card.text}
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
