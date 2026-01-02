import { motion } from "framer-motion";
import {
  FaHome,
  FaBuilding,
  FaIndustry,
  FaPaintRoller,
  FaRulerCombined,
  FaHardHat,
  FaTree,
} from "react-icons/fa";
import Link from "next/link";

const Services = () => {
  const services = [
    {
      id: 1,
      icon: <FaHome className="text-4xl text-primary" />,
      title: "Residential Construction",
      description:
        "Custom homes, apartments, and residential complexes built to the highest standards of quality and comfort.",
      features: [
        "Custom home design and construction",
        "Apartment and multi-family housing",
        "Luxury residential developments",
        "Energy-efficient home solutions",
      ],
    },
    {
      id: 2,
      icon: <FaBuilding className="text-4xl text-primary" />,
      title: "Commercial Construction",
      description:
        "Office buildings, retail spaces, and commercial facilities designed for functionality, aesthetics, and business success.",
      features: [
        "Office buildings and corporate headquarters",
        "Retail and shopping centers",
        "Hotels and hospitality facilities",
        "Educational and healthcare facilities",
      ],
    },
    {
      id: 3,
      icon: <FaIndustry className="text-4xl text-primary" />,
      title: "Industrial Construction",
      description:
        "Factories, warehouses, and industrial facilities built with a focus on efficiency, safety, and operational excellence.",
      features: [
        "Manufacturing plants and factories",
        "Warehouses and distribution centers",
        "Industrial processing facilities",
        "Specialized industrial installations",
      ],
    },
    {
      id: 5,
      icon: <FaPaintRoller className="text-4xl text-primary" />,
      title: "Interior Finishing",
      description:
        "Expert interior finishing services that add beauty, functionality, and value to your spaces.",
      features: [
        "Custom cabinetry and millwork",
        "Flooring installation",
        "Painting and wall treatments",
        "Lighting and electrical fixtures",
      ],
    },
    {
      id: 6,
      icon: <FaRulerCombined className="text-4xl text-primary" />,
      title: "Architectural Design",
      description:
        "Innovative architectural design services that balance aesthetics, functionality, and sustainability.",
      features: [
        "Conceptual design development",
        "3D modeling and visualization",
        "Construction documentation",
        "Sustainable design solutions",
      ],
    },
    {
      id: 7,
      icon: <FaHardHat className="text-4xl text-primary" />,
      title: "Project Management",
      description:
        "Comprehensive project management services ensuring your construction project is completed on time and within budget.",
      features: [
        "Schedule and budget management",
        "Quality control and assurance",
        "Subcontractor coordination",
        "Regulatory compliance",
      ],
    },
    {
      id: 8,
      icon: <FaTree className="text-4xl text-primary" />,
      title: "Sustainable Building",
      description:
        "Environmentally responsible construction practices and sustainable building solutions for a greener future.",
      features: [
        "Energy-efficient building design",
        "Renewable energy integration",
        "Sustainable material selection",
        "Green building certification",
      ],
    },
  ];

  return (
    <div className="py-16 bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="container-custom mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            Our <span className="text-primary">Services</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Comprehensive construction solutions tailored to your specific needs
            and vision.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="mb-4">{service.icon}</div>
                <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                  {service.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {service.description}
                </p>
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-primary mr-2 mt-1">✓</span>
                      <span className="text-gray-600 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/projects`}
                  className="inline-block bg-primary text-white font-medium py-2 px-4 rounded hover:bg-primary-dark transition-colors duration-300"
                >
                  Learn More
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Process Section */}
      <section className="bg-primary bg-opacity-10 dark:bg-gray-800 py-16">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Our Process
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We follow a systematic approach to ensure the success of every
              project.
            </p>
          </motion.div>

          <div className="relative">
            {/* Process Timeline */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-primary"></div>

            <div className="space-y-12">
              {[
                {
                  number: "01",
                  title: "Consultation & Planning",
                  description:
                    "We begin with a thorough consultation to understand your vision, requirements, and budget. Our team works closely with you to develop a comprehensive plan that aligns with your goals.",
                },
                {
                  number: "02",
                  title: "Design & Engineering",
                  description:
                    "Our architects and engineers create detailed designs and plans, incorporating your feedback at every stage. We ensure all technical specifications and regulatory requirements are met.",
                },
                {
                  number: "03",
                  title: "Material Selection",
                  description:
                    "We help you select the best materials for your project, balancing quality, aesthetics, durability, and cost-effectiveness. We source materials from trusted suppliers to ensure the highest standards.",
                },
                {
                  number: "04",
                  title: "Construction",
                  description:
                    "Our skilled construction team brings the plans to life with precision and attention to detail. We maintain strict quality control throughout the construction process.",
                },
                {
                  number: "05",
                  title: "Quality Assurance",
                  description:
                    "We conduct thorough inspections at key stages to ensure everything meets our high standards. Any issues are promptly addressed to maintain project integrity.",
                },
                {
                  number: "06",
                  title: "Project Completion",
                  description:
                    "Once construction is complete, we conduct a final walkthrough with you to ensure your complete satisfaction before handing over the finished project.",
                },
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`flex flex-col md:flex-row items-center ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  <div
                    className={`md:w-1/2 ${
                      index % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"
                    }`}
                  >
                    <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg">
                      <div className="flex items-center mb-4 justify-center md:justify-start">
                        <span className="bg-primary text-white text-xl font-bold w-12 h-12 rounded-full flex items-center justify-center mr-4">
                          {step.number}
                        </span>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  <div className="hidden md:flex w-12 h-12 rounded-full bg-primary text-white items-center justify-center font-bold text-xl relative z-10 my-4 md:my-0">
                    {step.number}
                  </div>
                  <div className="md:w-1/2"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="container-custom py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Why Choose Stone-Edge
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            What sets us apart from other construction companies.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "International Experience",
              description:
                "Our experience in Japan and other international markets brings a unique perspective and approach to our projects in Ghana.",
            },
            {
              title: "Quality Craftsmanship",
              description:
                "We take pride in our attention to detail and commitment to excellence in every aspect of our work.",
            },
            {
              title: "Innovative Solutions",
              description:
                "We stay at the forefront of construction technology and techniques to deliver innovative solutions.",
            },
            {
              title: "Transparent Communication",
              description:
                "We maintain open and honest communication throughout the project, keeping you informed at every stage.",
            },
            {
              title: "Timely Delivery",
              description:
                "We understand the importance of deadlines and work diligently to complete projects on schedule.",
            },
            {
              title: "Cost-Effective Approach",
              description:
                "We optimize resources and processes to provide the best value without compromising on quality.",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
            >
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                {item.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Ready to Start Your Project?
            </h2>
            <p className="text-xl text-white opacity-90 max-w-3xl mx-auto mb-8">
              Contact us today for a free consultation and quote. Let's bring
              your vision to life.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                href="/contact"
                className="bg-white text-primary font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors duration-300"
              >
                Contact Us
              </Link>
              <Link
                href="/projects"
                className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors duration-300"
              >
                View Our Work
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Services;
