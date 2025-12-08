import { forwardRef } from "react";
import { ResumeData } from "@/types/resume";


interface ResumePreviewProps {
  data: ResumeData;
}

export const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(
  ({ data }, ref) => {
    const { personalInfo, summary, skills, workExperience, projects, education } = data;

    return (
      <div
        ref={ref}
        className="resume-document bg-white shadow-elevated rounded-xl overflow-hidden relative"
        style={{
          width: "595px",
          minHeight: "842px",
          fontFamily: "'Open Sans', sans-serif"
        }}
      >
        {/* Watermark - Centered within resume container, appears on all pages */}
        <div
          className="watermark-container"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 0,
            pointerEvents: 'none',
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <img
            src="/solidpro.svg"
            alt="SOLiDPRO Watermark"
            style={{
              width: '60%',
              height: 'auto',
              maxWidth: '400px',
              opacity: 0.05,
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 0
            }}
          />
        </div>

        {/* SVG Header - Appears at the top of the first page */}
        <div
          className="svg-header-container"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1,
            pointerEvents: 'none',
            width: '100%',
            height: '120px',
            overflow: 'hidden'
          }}
        >
          {/* SVG for Web View */}
          <svg
            className="web-svg"
            width="100%"
            height="120"
            viewBox="0 0 227 183"
            fill="none"
            preserveAspectRatio="xMinYMin meet"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '120px'
            }}
          >
            <path d="M167.459 0H0V141.347C6.2389 41.2263 114.168 4.67516 167.459 0Z" fill="#16469D" />
            <path d="M227 0C58.8136 7.81475 6.44886 124.095 0 181.259V157.38V132.417C18.0568 33.6469 113.5 3.25615 159.932 0H227Z" fill="#ED1B2F" />
          </svg>

          {/* SVG for PDF - Using data URL for better PDF compatibility */}
          <img
            className="pdf-svg"
            src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMjAiIHZpZXdCb3g9IjAgMCAyMjcgMTIwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxwYXRoIGQ9Ik0wLDBIMjI3VjEyMEgwVjBaIiBmaWxsPSIjMTY0NjlEIi8+CiAgPHBhdGggZD0iTTIyNywwVjEyMEgwQzAsODAgNzUsMjAgMTgwLDBIMjI3WiIgZmlsbD0iI0VEMUIyRiIvPgo8L3N2Zz4="
            alt=""
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '120px',
              opacity: 0,
              visibility: 'hidden'
            }}
          />
        </div>

        {/* Content */}
        <div className="px-10 pt-6 pb-6 relative" style={{ wordWrap: "break-word", overflowWrap: "break-word", zIndex: 2 }}>
          {/* Personal Info */}
          <div className="mb-4" style={{ maxWidth: "100%", paddingTop: "40px" }}>
            <h1 className="text-2xl font-bold text-gray-900 break-words" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              {personalInfo.fullName || ""}
            </h1>
            <div className="space-y-0.5 mt-1">
              {personalInfo.email && (
                <p className="text-sm text-gray-700 break-words">
                  <span className="font-semibold">Email Id:</span> {personalInfo.email}
                </p>
              )}
              {education.degree && (
                <p className="text-sm text-gray-700 break-words">
                  <span className="font-semibold">Education:</span> {education.degree}
                  {education.institution && ` from ${education.institution}`}
                </p>
              )}
              {personalInfo.phone && (
                <p className="text-sm text-gray-700 break-words">
                  <span className="font-semibold">Phone:</span> {personalInfo.phone}
                </p>
              )}
              {personalInfo.linkedin && (
                <p className="text-sm text-gray-700 break-words">
                  <span className="font-semibold">LinkedIn:</span> {personalInfo.linkedin}
                </p>
              )}
              {personalInfo.location && (
                <p className="text-sm text-gray-700 break-words">
                  <span className="font-semibold">Location:</span> {personalInfo.location}
                </p>
              )}
            </div>
          </div>

          {/* Summary */}
          {summary && (
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900 mb-2 tracking-wide" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                SUMMARY
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed text-justify break-words" style={{ textIndent: "2rem" }}>
                {summary}
              </p>
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900 mb-3 tracking-wide" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                SKILLS
              </h2>
              <ul className="space-y-1.5 list-none">
                {skills.map((skill, index) => (
                  <li key={index} className="text-sm text-gray-700 flex break-inside-avoid">
                    <span className="mr-2 flex-shrink-0">•</span>
                    <span className="break-words">{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Work Experience */}
          {workExperience.length > 0 && (
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900 mb-3 tracking-wide" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                WORK EXPERIENCE
              </h2>
              <div className="space-y-4">
                {workExperience.map((exp) => (
                  <div key={exp.id} className="break-inside-avoid-page">
                    <h3 className="font-bold text-sm text-gray-900 break-words">
                      {exp.companyName.toUpperCase()} — {exp.jobTitle} | {exp.startYear}–{exp.endYear}
                    </h3>
                    {exp.responsibilities.length > 0 && (
                      <ul className="mt-1 space-y-1">
                        {exp.responsibilities
                          .filter(resp => resp.trim() !== '')
                          .map((resp, idx) => {
                            const cleanResp = resp.replace(/^[\s•\-*–—◦▪⁃∙●➤➢➣]+/, '').trim();

                            if (!cleanResp) return null;

                            return (
                              <li key={idx} className="text-sm text-gray-700 flex break-inside-avoid">
                                <span className="mr-2 flex-shrink-0">•</span>
                                <span className="break-words">{cleanResp}</span>
                              </li>
                            );
                          })
                        }
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <div className="mb-4">
              <h2
                className="text-lg font-bold text-gray-900 mb-3 tracking-wide"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                PROJECTS
              </h2>

              <div className="space-y-4">
                {projects.map((project) => {
                  // Split description into bullet points
                  const descriptionPoints = project.description
                    ?.split(/[•\n-]+/)     // split by •, newline, or -
                    .map(item => item.trim())
                    .filter(Boolean);

                  return (
                    <div key={project.id} className="break-inside-avoid">
                      <h3 className="font-bold text-sm text-gray-900 break-words">
                        {project.name}
                      </h3>

                      <p className="text-sm text-gray-700 mt-1 font-medium">
                        Description:
                      </p>

                      <ul className="mt-1 space-y-1">
                        {descriptionPoints.map((point, index) => (
                          <li key={index} className="text-sm text-gray-700 flex break-inside-avoid">
                            <span className="mr-2 flex-shrink-0">•</span>
                            <span className="break-words">{point}</span>
                          </li>
                        ))}
                      </ul>

                      <p className="text-sm text-gray-700 break-words">
                        <span className="font-medium">Tech Stack:</span> {project.technologies}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Certifications */}
          {data.certifications && data.certifications.length > 0 && (
            <div className="mb-4">
              <h2
                className="text-lg font-bold text-gray-900 mb-3 tracking-wide"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                CERTIFICATIONS
              </h2>
              <div className="space-y-3">
                {data.certifications.map((cert) => (
                  <div className="break-inside-avoid">
                    <div>
                      <h3 className="font-bold text-sm text-gray-900 break-words">
                        {cert.name}
                      </h3>
                      <p className="text-sm text-gray-700">
                        {cert.issuer} - {cert.year}
                      </p>
                    </div>
                    {cert.link && (
                      <a
                        href={cert.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 break-all block mt-1"
                      >
                        View Credential
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
        <style>
          {`
            @media print {
              @page {
                margin-top: 40px !important;
              }
              @page :first {
            margin-top: 30px !important;
              }
              .break-inside-avoid {
                break-inside: avoid;
              }
              .break-inside-avoid-page {
                break-inside: avoid-page;
              }
              
              /* Ensure watermark appears on all pages */
              .watermark-container {
                position: absolute !important;
                width: 100% !important;
                height: 100% !important;
                top: 0 !important;
                left: 0 !important;
                transform: none !important;
              }
              
              .watermark-container img {
                position: absolute !important;
                top: 50% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) !important;
                opacity: 0.05 !important;
                z-index: 0 !important;
                width: 60% !important;
                max-width: 400px !important;
              }
              
              /* SVG header styling for print */
              .svg-header-container {
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: 120px !important;
                overflow: hidden !important;
              }
              
              /* Hide web SVG in print */
              .svg-header-container .web-svg {
                display: none !important;
              }
              
              /* Show PDF SVG in print */
              .svg-header-container .pdf-svg {
                opacity: 1 !important;
                visibility: visible !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              
              /* Ensure content has proper z-index */
              .resume-document > div {
                position: relative;
                z-index: 2;
              }
              
              /* Ensure proper printing of background colors */
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
          `}
        </style>
      </div>
    );
  }
);

ResumePreview.displayName = "ResumePreview";
