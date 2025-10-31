// Parent container variant: fades in + staggers children (no delay)
export const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.25, // faster fade-in
      ease: "easeOut",
      when: "beforeChildren",
      staggerChildren: 0.1, // faster child stagger
    },
  },
};

// Each child item: fade in + slide up
export const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: "easeOut",
    },
  },
};

// Reusable single fade-in-up animation with no delay
export const fadeInUp = () => ({
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: "easeOut",
    },
  },
});
