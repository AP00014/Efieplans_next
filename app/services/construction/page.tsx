"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import "../../../styles/pages/construction.css";
import {
  FaHome,
  FaBuilding,
  FaIndustry,
  FaHardHat,
  FaCheckCircle,
  FaTools,
} from "react-icons/fa";

const ConstructionPage = () => {
  const constructionTypes = [
    {
      title: "Residential Construction",
      description:
        "Building luxury homes, apartments, and residential complexes with a focus on comfort, lifestyle, and lasting quality.",
      icon: <FaHome className="text-4xl text-primary mb-4" />,
      features: [
        "Custom Home Building",
        "Multi-family Residences",
        "Home Additions",
        "Renovations & Remodeling",
      ],
    },
    {
      title: "Commercial Construction",
      description:
        "Delivering state-of-the-art office spaces, retail centers, and commercial facilities optimized for business performance.",
      icon: <FaBuilding className="text-4xl text-primary mb-4" />,
      features: [
        "Office Buildings",
        "Retail Centers",
        "Hospitality Projects",
        "Mixed-use Developments",
      ],
    },
    {
      title: "Industrial Construction",
      description:
        "Constructing robust industrial facilities, warehouses, and factories designed for efficiency, safety, and scalability.",
      icon: <FaIndustry className="text-4xl text-primary mb-4" />,
      features: [
        "Warehouses",
        "Manufacturing Plants",
        "Distribution Centers",
        "Industrial Parks",
      ],
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop"
            alt="Construction Site"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/30" />
        </div>
        <div className="container-custom relative z-10 text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Building Construction <span className="text-primary">Excellence</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl max-w-3xl mx-auto text-gray-200"
          >
            Turning your vision into concrete reality with precision, quality, and
            unmatched expertise.
          </motion.p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-20 container-custom">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="md:w-1/2"
          >
            <h4 className="text-primary font-bold uppercase tracking-wider mb-2">
              Our Expertise
            </h4>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
              We Build Structures That Stand the Test of Time
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              At Efie Plans, construction is more than just pouring concrete and
              erecting steel. It's about creating spaces where life happens, businesses
              thrive, and communities grow. Our team brings decades of combined
              experience to every project, ensuring that every detail is executed to perfection.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              From the initial ground-breaking to the final ribbon-cutting, we oversee
              every aspect of the construction process with rigorous project management,
              strict safety protocols, and a commitment to sustainability.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Start Your Project <FaHardHat />
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="md:w-1/2 relative"
          >
            <div className="relative rounded-lg overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1931&auto=format&fit=crop"
                alt="Expert Construction"
                className="w-full h-auto object-cover"
              />
            </div>
            {/* Float Card */}
            <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl hidden md:block max-w-xs">
              <div className="flex items-center gap-4 mb-2">
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full text-green-600 dark:text-green-400">
                  <FaCheckCircle size={24} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-lg">
                    100% Satisfaction
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Guaranteed Quality
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Construction Sectors
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We deliver specialized construction services across various sectors,
              guaranteeing quality and compliance in every build.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {constructionTypes.map((type, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border-t-4 border-transparent hover:border-primary group"
              >
                <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                  {type.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                  {type.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {type.description}
                </p>
                <ul className="space-y-3">
                  {type.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-600 dark:text-gray-300">
                      <FaTools className="text-primary mr-3 text-sm" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Process */}
      <section className="py-20 container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Our Construction Process
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            A systematic approach ensuring efficiency, transparency, and superior results.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {[
            {
              step: "01",
              title: "Pre-Construction",
              desc: "Site analysis, feasibility studies, permitting, and detailed project scheduling.",
            },
            {
              step: "02",
              title: "Foundation & Structure",
              desc: "Excavation, specialized foundation work, and structural framework framing.",
            },
            {
              step: "03",
              title: "Systems & Finishing",
              desc: "Mechanical, electrical, plumbing installation followed by interior and exterior finishing.",
            },
            {
              step: "04",
              title: "Handover",
              desc: "Final inspections, quality assurance checks, and project handover with full documentation.",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative p-6 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
            >
              <span className="text-5xl font-black text-gray-200 dark:text-gray-700 absolute top-4 right-4 z-0">
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
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Build Your Project?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Let's discuss your construction needs. Our team is ready to deliver
            excellence from the ground up.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/contact"
              className="bg-white text-primary font-bold py-4 px-10 rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              Get a Quote
            </Link>
            <Link
              href="/portfolio"
              className="bg-primary-dark border border-white text-white font-bold py-4 px-10 rounded-lg hover:bg-opacity-90 transition-colors"
            >
              View Portfolio
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ConstructionPage;
