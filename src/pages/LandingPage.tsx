import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Sparkles, Compass, ShieldCheck, ArrowRight } from 'lucide-react';


export const LandingPage: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
    },
  };


  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center px-4 py-12 text-center overflow-hidden bg-gradient-to-b from-background via-background/95 to-secondary/30">
      {/* Background Animated Gradient Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          x: [0, 30, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl pointer-events-none"
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center max-w-5xl"
      >
        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
          <Sparkles className="w-4 h-4 animate-spin-slow text-primary" />
          AI-Powered GIS Restaurant Discovery Engine
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground font-heading leading-tight mb-6"
        >
          Intelligent Local Dining Discovery Within{' '}
          <span className="relative inline-block text-primary">
            3 KM
            <motion.span
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="absolute bottom-1 left-0 h-2.5 bg-primary/30 -z-10 rounded-full"
            />
          </span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed font-normal"
        >
          Experience hyper-personalized dining discovery powered by real-time GIS spatial search, custom dietary matching, and open-source AI recommendation algorithms.
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 mb-16 w-full sm:w-auto">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:bg-primary/95 transition-all w-full sm:w-auto text-base"
            >
              <Compass className="w-5 h-5" />
              Explore Interactive Map
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-all border border-border/80 w-full sm:w-auto text-base"
            >
              Sign In to Personalize
            </Link>
          </motion.div>
        </motion.div>

        {/* Animated Feature Grid */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left"
        >
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="p-6 rounded-2xl bg-card/80 backdrop-blur-md border border-border/70 shadow-sm hover:border-primary/40 hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 shadow-inner">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2 font-heading">Precision GIS Radius</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Live browser geolocation & OpenStreetMap interactive spatial search bounded strictly within a configurable 3 km radius.
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="p-6 rounded-2xl bg-card/80 backdrop-blur-md border border-border/70 shadow-sm hover:border-primary/40 hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-4 shadow-inner">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2 font-heading">AI Match Scoring</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Proprietary scoring engine weighing cuisine preference, dietary needs, ratings, distance, and real-time open status.
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="p-6 rounded-2xl bg-card/80 backdrop-blur-md border border-border/70 shadow-sm hover:border-primary/40 hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2 font-heading">100% Open Source</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Built entirely on free open-source technologies: React, FastAPI, PostgreSQL, Leaflet, and standard Hugging Face models.
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

