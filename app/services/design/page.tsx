"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import "../../../styles/pages/design.css";
import {
  FaPencilRuler,
  FaLaptopCode,
  FaDraftingCompass,
  FaTree,
  FaLayerGroup,
  FaCube,
} from "react-icons/fa";

const DesignPage = () => {
  const designServices = [
    {
      title: "Conceptual Design",
      description:
        "Translating initial ideas into tangible concepts using sketches, mood boards, and preliminary layouts to set the project direction.",
      icon: <FaPencilRuler className="text-4xl text-primary mb-4" />,
    },
    {
      title: "3D Visualization",
      description:
        "Photorealistic 3D renderings and walkthroughs that allow you to wishfully experience your space before a single brick is laid.",
      icon: <FaCube className="text-4xl text-primary mb-4" />,
    },
    {
      title: "Construction Documentation",
      description:
        "Detailed technical drawings, blueprints, and specifications ensuring precise execution and regulatory compliance.",
      icon: <FaDraftingCompass className="text-4xl text-primary mb-4" />,
    },
    {
      title: "Landscape Architecture",
      description:
        "Integrating nature with built environments to create sustainable, beautiful, and functional outdoor spaces.",
      icon: <FaTree className="text-4xl text-primary mb-4" />,
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2072&auto=format&fit=crop"
            alt="Architectural Design"
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
        </div>
        <div className="container-custom relative z-10 text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Visionary <span className="text-primary">Architectural Design</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl max-w-3xl mx-auto text-gray-200"
          >
            Where art meets engineering. We craft functional, sustainable, and
            aesthetically stunning spaces tailored to your lifestyle.
          </motion.p>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-20 container-custom">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div
            className="lg:w-1/2"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop"
                alt="Modern Architecture"
                className="rounded-xl shadow-2xl"
              />
              <div className="absolute -bottom-8 -right-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-primary hidden md:block max-w-xs">
                <p className="font-bold text-gray-900 dark:text-white text-lg">
                  "Architecture is a visual art, and the buildings speak for themselves."
                </p>
              </div>
            </div>
          </motion.div>
          <motion.div
            className="lg:w-1/2"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h4 className="text-primary font-bold uppercase tracking-wider mb-2">
              Our Philosophy
            </h4>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
              Designing for the Future
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              Great architecture goes beyond aesthetics; it shapes how we live, work,
              and interact. Our design team combines creativity with technical
              expertise to deliver innovative solutions that stand the test of time.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              We leverage the latest technology, including BIM (Building Information
              Modeling) and 3D rendering, to ensure precision and collaboration
              throughout the design process. Whether it's a private residence or a
              corporate headquarters, we bring your vision to life with clarity and
              purpose.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-colors"
            >
              Start Designing
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Our Design Services
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Comprehensive architectural services covering every stage of the design lifecycle.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {designServices.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
              >
                <div className="mb-6">{service.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white h-14">
                  {service.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase / CTA */}
      <section className="py-20 bg-black text-white overflow-hidden relative">
         <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/blueprint.png')]"></div>
         <div className="container-custom relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="md:w-2/3">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Explore Our Architectural Portfolio</h2>
                  <p className="text-gray-300 text-lg mb-0">Browse through our gallery of completed projects, 3D renders, and design concepts to find inspiration for your next venture.</p>
               </div>
               <div className="md:w-1/3 flex justify-end">
                  <Link href="/portfolio" className="bg-primary hover:bg-white hover:text-primary text-white font-bold py-4 px-10 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg">
                     View Projects
                  </Link>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
};

export default DesignPage;
