import { FaBuilding, FaPaintRoller, FaBullseye, FaEye } from 'react-icons/fa';
import '../../styles/components/AboutSection.css';

const AboutSection = () => {
  return (
    <div id="about" className="about-container1">
      {/* Company Profile Section */}
      <section className="company-profile-section">
        <h2 className="section-heading">About Us</h2>

        <div className="company-grid-container">
          {/* About Card */}
          <div className="company-card">
            <div className="company-card-header">
              <FaBuilding size={24} className="icon-blue" />
              <h3 className="company-card-title">About Efie Plans</h3>
            </div>
            <p className="company-body-text">
              We transform living spaces into personalized masterpieces, blending contemporary
              design with cultural authenticity. As Africa's premier architectural studio,
              we specialize in creating bespoke homes that tell your unique story through
              intelligent spatial design and meticulous attention to detail.
            </p>
            <div className="service-heading">
              <FaPaintRoller className="icon-blue" />
              <span className="sub-heading">
                Full-service design solutions including:
              </span>
            </div>
            <ul className="feature-list">
              <li>✓ Architectural Design</li>
              <li>✓ Interior Styling</li>
              <li>✓ Landscape Architecture</li>
              <li>✓ Construction Oversight</li>
            </ul>
          </div>

          {/* Mission & Vision Card */}
          <div className="company-card">
            <div className="company-card-header">
              <FaBullseye size={24} className="icon-green" />
              <h3 className="company-card-title">Our Compass</h3>
            </div>
            <div className="mission-item">
              <FaEye className="icon-green" />
              <div>
                <h4 className="sub-heading">Vision</h4>
                <p className="company-body-text">
                  Redefine African luxury living by creating timeless architectural
                  statements that harmonize modern innovation with cultural heritage.
                </p>
              </div>
            </div>
            <div className="mission-item">
              <FaBullseye className="icon-green" />
              <div>
                <h4 className="sub-heading">Mission</h4>
                <p className="company-body-text">
                  Empower homeowners through collaborative design processes that
                  transform personal aspirations into breathtaking living
                  environments exceeding every expectation.
                </p>
              </div>
            </div>
            <div className="quote-box">
              <p className="quote-text">
                "We don't just design houses - we curate living experiences that
                resonate with your soul and stand the test of time."
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutSection;