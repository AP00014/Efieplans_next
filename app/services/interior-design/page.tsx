"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import "../../../styles/pages/interior-design.css";
import {
  FaPalette,
  FaCouch,
  FaLightbulb,
  FaRulerCombined,
  FaDraftingCompass,
  FaCheckCircle,
} from "react-icons/fa";

const InteriorDesignPage = () => {
  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      {/* Hero Section */}
      <section className="interior-hero relative h-[60vh] flex items-center justify-center text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop"
            alt="Interior Design"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 to-pink-800/80" />
        </div>
        <div className="container-custom relative z-10 text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Transformative <span className="text-pink-300">Interior Design</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl max-w-3xl mx-auto text-gray-100"
          >
            Creating beautiful, functional spaces that reflect your personality and enhance your lifestyle.
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
            Comprehensive Interior Design Services
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            From concept to completion, we craft interiors that inspire. Our holistic approach ensures every detail contributes to a cohesive, stunning environment.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Space Planning",
              desc: "Optimizing layouts for flow, functionality, and aesthetics. We analyze your space to create intelligent floor plans that maximize usability.",
              icon: <FaRulerCombined className="text-4xl text-purple-600 mb-4" />,
            },
            {
              title: "Color Consultation",
              desc: "Expert guidance on color palettes that evoke the right mood and complement your style, creating harmonious visual experiences.",
              icon: <FaPalette className="text-4xl text-pink-500 mb-4" />,
            },
            {
              title: "Furniture Selection",
              desc: "Curating custom and ready-made furniture pieces that blend comfort, style, and durability to suit your unique needs.",
              icon: <FaCouch className="text-4xl text-indigo-500 mb-4" />,
            },
            {
              title: "Lighting Design",
              desc: "Strategic lighting plans combining ambient, task, and accent lighting to enhance ambiance and functionality throughout your space.",
              icon: <FaLightbulb className="text-4xl text-yellow-500 mb-4" />,
            },
            {
              title: "Custom Millwork",
              desc: "Bespoke cabinetry, shelving, and built-ins designed to maximize storage while adding architectural interest and character.",
              icon: <FaDraftingCompass className="text-4xl text-teal-500 mb-4" />,
            },
            {
              title: "Material & Finish Selection",
              desc: "Sourcing premium materials, fabrics, flooring, and finishes that balance beauty, durability, and sustainability.",
              icon: <FaPalette className="text-4xl text-rose-500 mb-4" />,
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="interior-service-card bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all"
            >
              {item.icon}
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                {item.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Our Process Section */}
      <section className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 py-20">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Our Design Process
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              A collaborative journey from initial consultation to final installation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Discovery & Consultation",
                desc: "Understanding your vision, lifestyle, budget, and functional requirements.",
              },
              {
                step: "02",
                title: "Concept Development",
                desc: "Creating mood boards, sketches, and 3D visualizations of proposed designs.",
              },
              {
                step: "03",
                title: "Design Execution",
                desc: "Finalizing materials, coordinating with contractors, and overseeing installation.",
              },
              {
                step: "04",
                title: "Styling & Reveal",
                desc: "Adding finishing touches, accessories, and presenting your completed space.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="interior-process-step relative bg-white dark:bg-gray-800 p-6 rounded-lg border-l-4 border-purple-600"
              >
                <span className="text-5xl font-black text-purple-100 dark:text-purple-900 absolute top-4 right-4 z-0">
                  {item.step}
                </span>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 container-custom">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2">
            <img 
              src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2058&auto=format&fit=crop" 
              alt="Interior Design Project" 
              className="rounded-2xl shadow-2xl"
            />
          </div>
          <div className="md:w-1/2">
            <h3 className="text-2xl font-bold mb-4 text-purple-600">Why Choose Our Design Services?</h3>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
              Personalized Design Excellence
            </h2>
            <ul className="space-y-4">
              {[
                "Tailored designs reflecting your unique style and needs",
                "Access to exclusive trade-only furniture and materials",
                "3D renderings to visualize your space before implementation",
                "Project management ensuring on-time, on-budget delivery",
                "Sustainable and eco-friendly design options"
              ].map((point, i) => (
                <li key={i} className="flex items-start gap-3">
                  <FaCheckCircle className="text-purple-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{point}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Link 
                href="/contact" 
                className="interior-cta-btn inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-8 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
              >
                Schedule a Design Consultation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Space?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-95">
            Let's create an interior that tells your story. Our expert designers are ready to bring your vision to life.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/contact"
              className="bg-white text-purple-600 font-bold py-4 px-10 rounded-full hover:bg-gray-100 transition-colors shadow-lg inline-block"
            >
              Get Started
            </Link>
            <Link
              href="/portfolio"
              className="bg-transparent border-2 border-white text-white font-bold py-4 px-10 rounded-full hover:bg-white/10 transition-colors inline-block"
            >
              View Portfolio
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InteriorDesignPage;
