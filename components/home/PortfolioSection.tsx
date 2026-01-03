import Link from "next/link";
import { FiExternalLink, FiArrowRight } from "react-icons/fi";
import { useShowcaseProjects } from "../../hooks/useShowcaseProjects";
import OptimizedImage from "../OptimizedImage";
import "../../styles/components/PortfolioSection.css";

const PortfolioSection = () => {
  const { projects, loading } = useShowcaseProjects();

  // Get description snippet for overlay
  const getDescriptionSnippet = (description: string) => {
    if (!description) return "Innovative architectural solutions";
    return description.length > 50
      ? description.substring(0, 50) + "..."
      : description;
  };

  if (loading) {
    return (
      <section className="showcase">
        <div className="section-header">
          <h2>Our Showcase</h2>
          <p className="cp">
            Excellence in Architectural Design & Engineering Solutions
          </p>
        </div>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <div className="loading-spinner" style={{ margin: "0 auto" }}></div>
          <p>Loading showcase...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="showcase">
      <div className="section-header">
        <h2>Our Showcase</h2>
        <p className="cp">
          Excellence in Architectural Design & Engineering Solutions
        </p>
      </div>

      {projects.length > 0 ? (
        <div className="showcase_grid">
          <div className="imagesleft">
            {projects[0] && (
              <div className="showcas_img_1">
                <OptimizedImage
                  src={projects[0].image}
                  alt={`${projects[0].title} project showcase`}
                  className="img_1"
                  width={800}
                  height={600}
                  priority={true}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="image-overlay">
                  <h3>{projects[0].title}</h3>
                  <p>{getDescriptionSnippet(projects[0].description)}</p>
                  <Link
                    href={`/projects/${projects[0].id}`}
                    className="view-link"
                  >
                    View Details <FiExternalLink />
                  </Link>
                </div>
              </div>
            )}
            {projects[1] && (
              <div className="showcas_img_2">
                <OptimizedImage
                  src={projects[1].image}
                  alt={`${projects[1].title} project showcase`}
                  className="img_2"
                  width={800}
                  height={600}
                  priority={true}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="image-overlay">
                  <h3>{projects[1].title}</h3>
                  <p>{getDescriptionSnippet(projects[1].description)}</p>
                  <Link
                    href={`/projects/${projects[1].id}`}
                    className="view-link"
                  >
                    View Details <FiExternalLink />
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="imagesright">
            <div className="img_layout1">
              {projects[2] && (
                <div className="showcas_img_3">
                  <OptimizedImage
                    src={projects[2].image}
                    alt={`${projects[2].title} project showcase`}
                    className="img_1"
                    width={600}
                    height={450}
                    priority={false}
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                  <div className="image-overlay">
                    <h3>{projects[2].title}</h3>
                    <p>{getDescriptionSnippet(projects[2].description)}</p>
                    <Link
                      href={`/projects/${projects[2].id}`}
                      className="view-link"
                    >
                      View Details <FiExternalLink />
                    </Link>
                  </div>
                </div>
              )}
              {projects[3] && (
                <div className="showcas_img_4">
                  <OptimizedImage
                    src={projects[3].image}
                    alt={`${projects[3].title} project showcase`}
                    className="img_1"
                    width={600}
                    height={450}
                    priority={false}
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                  <div className="image-overlay">
                    <h3>{projects[3].title}</h3>
                    <p>{getDescriptionSnippet(projects[3].description)}</p>
                    <Link
                      href={`/projects/${projects[3].id}`}
                      className="view-link"
                    >
                      View Details <FiExternalLink />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="img_layout2">
              {projects[4] && (
                <div className="showcas_img_5">
                  <OptimizedImage
                    src={projects[4].image}
                    alt={`${projects[4].title} project showcase`}
                    className="img_1"
                    width={600}
                    height={450}
                    priority={false}
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                  <div className="image-overlay">
                    <h3>{projects[4].title}</h3>
                    <p>{getDescriptionSnippet(projects[4].description)}</p>
                    <Link
                      href={`/projects/${projects[4].id}`}
                      className="view-link"
                    >
                      View Details <FiExternalLink />
                    </Link>
                  </div>
                </div>
              )}
              {projects[5] && (
                <div className="showcas_img_6">
                  <OptimizedImage
                    src={projects[5].image}
                    alt={`${projects[5].title} project showcase`}
                    className="img_1"
                    width={600}
                    height={450}
                    priority={false}
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                  <div className="image-overlay">
                    <h3>{projects[5].title}</h3>
                    <p>{getDescriptionSnippet(projects[5].description)}</p>
                    <Link
                      href={`/projects/${projects[5].id}`}
                      className="view-link"
                    >
                      View Details <FiExternalLink />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p>No projects available at the moment.</p>
        </div>
      )}

      <div className="showcase-button-container">
        <Link href="/projects" className="showcase-button">
          View All Projects <FiArrowRight />
        </Link>
      </div>
    </section>
  );
};

export default PortfolioSection;
