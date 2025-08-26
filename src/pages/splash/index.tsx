import React, { useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button"; // Assuming shadcn path
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Assuming shadcn path
import { BookMarked, BarChart3, TestTube2, Cpu } from "lucide-react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, getIdTokenResult } from "firebase/auth";
// A helper component for scroll-triggered animations
const AnimatedSection = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.7], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 0.7], [50, 0]);

  return (
    <motion.div ref={ref} style={{ opacity, y }} className="py-12 md:py-20">
      {children}
    </motion.div>
  );
};

const Splash = () => {
  const navigate = useNavigate();
  const featuresRef = useRef<HTMLDivElement>(null);

  const handleSignIn = () => {
    navigate("/signup");
  };

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const tokenResult = await getIdTokenResult(user);
          const claims = tokenResult.claims;

          if (claims.teacher === true) {
            navigate("/teacher/home", { replace: true });
          } else {
            // defaulting to student if not explicitly teacher
            navigate("/home", { replace: true });
          }
        } catch (err) {
          console.error("Error fetching custom claims:", err);
        }
      }
    });

    return () => unsub();
  }, [navigate]);

  // Variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  const features = [
    {
      icon: <BookMarked className="h-8 w-8 text-primary" />,
      title: "Digital Logbooks",
      description:
        "Ditch paper. Students record observations, calculations, and results directly into a secure, cloud-based platform.",
    },
    {
      icon: <Cpu className="h-8 w-8 text-primary" />,
      title: "AI-Powered Viva Voce",
      description:
        "Our system generates dynamic viva questions based on the experiment data, ensuring conceptual clarity.",
    },
    {
      icon: <TestTube2 className="h-8 w-8 text-primary" />,
      title: "Dynamic Experiments",
      description:
        "Faculty can create and customize experiment templates, setting parameters and evaluation rubrics with ease.",
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-primary" />,
      title: "Instant Analytics",
      description:
        "Generate performance reports, identify common student errors, and visualize data trends across batches in real-time.",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-background text-foreground overflow-x-hidden">
      {/* Background Grid with Parallax */}
      <motion.div
        className="fixed inset-0 z-0 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:36px_36px]"
        style={{ y: useTransform(useScroll().scrollY, [0, 1000], [0, -200]) }}
      />

      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 px-8 bg-background/50 backdrop-blur-sm"
      >
        <div className="flex items-center gap-2">
          <TestTube2 className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold tracking-tighter">RSETLABS</h1>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a
            onClick={scrollToFeatures}
            className="cursor-pointer hover:text-primary transition-colors"
          >
            Features
          </a>
          <a
            href="#"
            className="cursor-pointer hover:text-primary transition-colors"
          >
            About
          </a>
        </nav>
        <Button onClick={handleSignIn}>Sign In / Get Started</Button>
      </motion.header>

      <main className="relative z-10">
        {/* Hero Section */}
        <div className="container mx-auto flex h-screen min-h-[700px] flex-col items-center justify-center text-center px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1
              variants={itemVariants}
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter"
            >
              The Future of Physics Labs is Here.
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground"
            >
              An initiative by{" "}
              <span className="font-semibold text-primary">
                Rajagiri School of Engineering and Technology
              </span>{" "}
              to digitize the recording and evaluation of physics lab
              experiments.
            </motion.p>
            <motion.div
              variants={itemVariants}
              className="mt-8 flex justify-center gap-4"
            >
              <Button size="lg" onClick={handleSignIn}>
                Start Experimenting
              </Button>
              <Button size="lg" variant="outline" onClick={scrollToFeatures}>
                Learn More
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Features Section */}
        <div ref={featuresRef}>
          <AnimatedSection>
            <div className="container mx-auto px-4">
              <h2 className="text-3xl md:text-4xl font-bold text-center">
                Why RSETLABS?
              </h2>
              <p className="mt-2 text-center text-muted-foreground max-w-xl mx-auto">
                From tedious paperwork to seamless digital workflows. We empower
                both students and faculty.
              </p>
              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature) => (
                  <motion.div
                    key={feature.title}
                    whileHover={{ y: -8, scale: 1.03 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Card className="h-full bg-background/50 backdrop-blur-sm border-border/50">
                      <CardHeader className="flex flex-col items-center text-center">
                        {feature.icon}
                        <CardTitle className="mt-4">{feature.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="text-center text-muted-foreground">
                        {feature.description}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>

        {/* How It Works Section */}
        <AnimatedSection>
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold">
              Simple, Powerful, Effective.
            </h2>
            <p className="mt-2 text-muted-foreground">
              A three-step process to a smarter lab.
            </p>
            <div className="mt-12 flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
              <div className="flex flex-col items-center">
                <div className="rounded-full bg-primary/10 p-4 border-2 border-primary">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="mt-4 text-xl font-semibold">Assign</h3>
                <p className="mt-1 text-muted-foreground max-w-xs">
                  Faculty create and publish lab experiments in minutes.
                </p>
              </div>
              <div className="text-primary/30 text-2xl font-bold">→</div>
              <div className="flex flex-col items-center">
                <div className="rounded-full bg-primary/10 p-4 border-2 border-primary">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="mt-4 text-xl font-semibold">Perform & Record</h3>
                <p className="mt-1 text-muted-foreground max-w-xs">
                  Students perform experiments and log data on any device.
                </p>
              </div>
              <div className="text-primary/30 text-2xl font-bold">→</div>
              <div className="flex flex-col items-center">
                <div className="rounded-full bg-primary/10 p-4 border-2 border-primary">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="mt-4 text-xl font-semibold">Evaluate</h3>
                <p className="mt-1 text-muted-foreground max-w-xs">
                  Get instant feedback, automated grades, and deep insights.
                </p>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t mt-20">
        <div className="container mx-auto text-center p-6 text-sm text-muted-foreground">
          © {new Date().getFullYear()} RSETLABS. An Initiative of the Department
          of Physics, RSET.
        </div>
      </footer>
    </div>
  );
};

export default Splash;
