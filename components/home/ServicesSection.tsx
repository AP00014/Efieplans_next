import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  FaDraftingCompass,
  FaPaintBrush,
  FaHammer,
  FaArrowRight,
  FaCheckCircle
} from 'react-icons/fa';
import '../../styles/components/ServicesSection.css';

const ServicesSection = () => {
  const services = [
    {
      id: 1,
      icon: <FaDraftingCompass />,
      title: 'Architectural Design',
      description: 'Transform your vision into reality with our expert architectural design services. We create innovative, functional, and aesthetically pleasing designs that reflect your unique style and needs.',
      features: [
        'Custom home design',
        'Commercial building design',
        '3D visualization',
        'Permit assistance'
      ],
      link: '/architectural-design',
      gradient: 'linear-gradient(135deg, #FF8C00 0%, #FF6B35 100%)',
      delay: 0.1
    },
    {
      id: 2,
      icon: <FaPaintBrush />,
      title: 'Interior Design',
      description: 'Create stunning interior spaces that blend functionality with beauty. Our interior design experts help you curate spaces that tell your story and enhance your lifestyle.',
      features: [
        'Space planning',
        'Color consultation',
        'Furniture selection',
        'Lighting design',
        'Material sourcing'
      ],
      link: '/interior-design',
      gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      delay: 0.2
    },
    {
      id: 3,
      icon: <FaHammer />,
      title: 'Construction',
      description: 'Expert construction services bringing your architectural designs to life. Our skilled team ensures quality workmanship, timely delivery, and adherence to all safety standards.',
      features: [
        'Project management',
        'Quality construction',
        'Timeline adherence',
        'Budget control',
        'Safety compliance'
      ],
      link: '/construction',
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
      delay: 0.3
    }
  ];

  return (
    <section id="services" className="services-section">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="services-header"
        >
          <h2 className="services-title">
            Our <span className="services-title-highlight">Services</span>
          </h2>
          <p className="services-description">
            Comprehensive design and construction solutions tailored to bring your architectural dreams to life.
            From concept to completion, we provide end-to-end services with excellence and precision.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="services-grid">
          {services.map((service) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: service.delay,
                type: "spring",
                stiffness: 100
              }}
              viewport={{ once: true }}
              className="service-card"
            >
              {/* Card Background */}
              <div
                className="service-card-bg"
                style={{ background: service.gradient }}
              ></div>

              {/* Card Content */}
              <div className="service-card-content">
                {/* Icon */}
                <div className="service-icon">
                  {service.icon}
                </div>

                {/* Title */}
                <h3 className="service-title">{service.title}</h3>

                {/* Description */}
                <p className="service-description">{service.description}</p>

                {/* Features */}
                <ul className="service-features">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="service-feature-item">
                      <FaCheckCircle className="service-feature-icon" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Link
                  href={service.link}
                  className="service-cta-button"
                >
                  <span>Learn More</span>
                  <FaArrowRight className="service-cta-icon" />
                </Link>
              </div>

              {/* Hover Overlay */}
              <div className="service-card-overlay"></div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ServicesSection;