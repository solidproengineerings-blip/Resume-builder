import React from 'react';
import { ResumeData } from '../../types/resume';

interface ResumeTemplateProps {
  resume: ResumeData;
}

export const ResumeTemplate: React.FC<ResumeTemplateProps> = ({ resume }) => {
  const { personalInfo, education, workExperience, skills, projects, summary } = resume;

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto my-8 shadow-lg">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold">{personalInfo?.fullName || 'Your Name'}</h1>
        <div className="flex justify-center gap-4 mt-2 text-sm text-gray-500">
          {personalInfo?.email && <span>{personalInfo.email}</span>}
          {personalInfo?.phone && <span>• {personalInfo.phone}</span>}
          {personalInfo?.location && <span>• {personalInfo.location}</span>}
        </div>
      </header>

      {/* Summary */}
      {summary && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold border-b-2 border-gray-200 pb-1 mb-3">Summary</h2>
          <p className="text-gray-700">{summary}</p>
        </section>
      )}

      {/* Experience */}
      {workExperience && workExperience.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold border-b-2 border-gray-200 pb-1 mb-3">Experience</h2>
          <div className="space-y-4">
            {workExperience.map((exp, index) => (
              <div key={exp.id || index} className="mb-4">
                <div className="flex justify-between">
                  <h3 className="font-bold">{exp.jobTitle}</h3>
                  <p className="text-gray-600">
                    {exp.startYear} - {exp.endYear || 'Present'}
                  </p>
                </div>
                <p className="text-gray-700">
                  {exp.companyName}
                </p>
                <ul className="list-disc pl-5 mt-2 text-gray-700">
                  {exp.responsibilities?.map((resp, i) => (
                    <li key={i}>{resp}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold border-b-2 border-gray-200 pb-1 mb-3">Education</h2>
          <div className="mb-4">
            <h3 className="font-bold">{education.degree}</h3>
            <p className="text-gray-600">
              {education.institution} • {education.graduationYear}
            </p>
          </div>
        </section>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold border-b-2 border-gray-200 pb-1 mb-3">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold border-b-2 border-gray-200 pb-1 mb-3">Projects</h2>
          <div className="space-y-4">
            {projects.map((project, index) => (
              <div key={index} className="mb-4">
                <h3 className="font-bold">{project.name}</h3>
                <p className="text-gray-700 mb-2">{project.description}</p>
                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 text-xs">
                    {project.technologies.map((tech, i) => (
                      <span
                        key={i}
                        className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ResumeTemplate;
