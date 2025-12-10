import React, { useState } from "react";
import { ResumeData, Experience, Education } from "../types";
import { Plus, Trash2, Wand2, ChevronDown, ChevronUp } from "lucide-react";
import {
  generateResumeSummary,
  enhanceExperienceDescription,
} from "../services/geminiService";

interface ResumeFormProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

export const ResumeForm: React.FC<ResumeFormProps> = ({ data, onChange }) => {
  const [activeSection, setActiveSection] = useState<string | null>("personal");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [loadingEnhancements, setLoadingEnhancements] = useState<
    Record<string, boolean>
  >({});
  const [collapsedEdu, setCollapsedEdu] = useState<Record<string, boolean>>({});

  const [collapsedExp, setCollapsedExp] = useState<Record<string, boolean>>({});
  const toggleExp = (id: string) => {
    setCollapsedExp((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  const [collapsedProj, setCollapsedProj] = useState<Record<string, boolean>>(
    {}
  );
  const toggleProj = (id: string) => {
    setCollapsedProj((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const [newSkill, setNewSkill] = useState("");

  const handleSkillInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // If user types comma, turn the previous text into a skill
    if (value.endsWith(",")) {
      const skill = value.slice(0, -1).trim().toLowerCase();

      if (skill && !data.skills.includes(skill)) {
        onChange({ ...data, skills: [...data.skills, skill] });
      }

      setNewSkill(""); // reset input
    } else {
      setNewSkill(value);
    }
  };

  const removeSkill = (skill: string) => {
    onChange({
      ...data,
      skills: data.skills.filter((s) => s !== skill),
    });
  };

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const updatePersonalInfo = (
    field: keyof ResumeData["personalInfo"],
    value: string
  ) => {
    onChange({
      ...data,
      personalInfo: { ...data.personalInfo, [field]: value },
    });
  };

  const handleGenerateSummary = async () => {
    if (!data.personalInfo.jobTitle) {
      alert("Please enter a job title first.");
      return;
    }
    setIsGeneratingSummary(true);
    try {
      const summary = await generateResumeSummary(
        data.personalInfo.jobTitle,
        data.skills,
        "5+" // Using a default or adding a field for years of experience could be an improvement
      );
      updatePersonalInfo("summary", summary);
    } catch (e) {
      alert("Failed to generate summary. Please check your API Key.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // --- Experience Handlers ---
  const addExperience = () => {
    const newExp: Experience = {
      id: Date.now().toString(),
      company: "",
      role: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      description: "",
    };
    onChange({ ...data, experiences: [...data.experiences, newExp] });
  };

  const updateExperience = (
    id: string,
    field: keyof Experience,
    value: any
  ) => {
    onChange({
      ...data,
      experiences: data.experiences.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    });
  };

  const removeExperience = (id: string) => {
    onChange({
      ...data,
      experiences: data.experiences.filter((exp) => exp.id !== id),
    });
  };

  const handleEnhanceDescription = async (
    id: string,
    role: string,
    text: string
  ) => {
    if (!text || !role) return;
    setLoadingEnhancements((prev) => ({ ...prev, [id]: true }));
    try {
      const enhanced = await enhanceExperienceDescription(role, text);
      updateExperience(id, "description", enhanced);
    } catch (e) {
      alert("Enhancement failed.");
    } finally {
      setLoadingEnhancements((prev) => ({ ...prev, [id]: false }));
    }
  };
  // --- Education Handlers ---

  const addEducation = () => {
    const safeEducation = Array.isArray(data.education) ? data.education : [];

    const newEdu: Education = {
      id: Date.now().toString(),
      graduationYear: "",
      institution: "",
      degree: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      isopen: true,
    };

    onChange({
      ...data,
      education: [...safeEducation, newEdu],
    });
  };
  const toggleEduCollapse = (id: string) => {
    setCollapsedEdu((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const updateEducation = (id: string, field: keyof Education, value: any) => {
    onChange({
      ...data,
      education: data.education.map((edu) =>
        edu.id === id
          ? { ...edu, [field]: value, isopen: edu.isopen ?? true }
          : edu
      ),
    });
  };

  const removeEducation = (id: string) => {
    onChange({
      ...data,
      education: data.education.filter((edu) => edu.id !== id),
    });
  };

  // --- Skills Handler ---
  const updateSkills = (value: string) => {
    const skillsArray = value
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "");
    onChange({ ...data, skills: skillsArray });
  };

  // --- Projects Handlers ---
  const addProject = () => {
    onChange({
      ...data,
      projects: [
        ...data.projects,
        {
          id: Date.now().toString(),
          name: "",
          description: "",
          link: "",
        },
      ],
    });
  };

  const updateProject = (id: string, field: string, value: string) => {
    onChange({
      ...data,
      projects: data.projects.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      ),
    });
  };
  const removeProject = (id: string) => {
    onChange({
      ...data,
      projects: data.projects.filter((p) => p.id !== id),
    });
  };
  return (
    <div className="space-y-4">
      {/* Personal Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection("personal")}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <span className="font-semibold text-gray-700">
            Personal Information
          </span>
          {activeSection === "personal" ? (
            <ChevronUp size={20} />
          ) : (
            <ChevronDown size={20} />
          )}
        </button>

        {activeSection === "personal" && (
          <div className="p-4 space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 personal-info-grid">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                value={data.personalInfo.fullName}
                onChange={(e) => updatePersonalInfo("fullName", e.target.value)}
              />
              <input
                type="text"
                placeholder="Job Title"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                value={data.personalInfo.jobTitle}
                onChange={(e) => updatePersonalInfo("jobTitle", e.target.value)}
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                value={data.personalInfo.email}
                onChange={(e) => updatePersonalInfo("email", e.target.value)}
              />
              <input
                type="tel"
                placeholder="Phone"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                value={data.personalInfo.phone}
                onChange={(e) => updatePersonalInfo("phone", e.target.value)}
              />
              <input
                type="text"
                placeholder="City, Country"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                value={data.personalInfo.location}
                onChange={(e) => updatePersonalInfo("location", e.target.value)}
              />
              <input
                type="text"
                placeholder="LinkedIn (e.g. linkedin.com/in/jdoe)"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                value={data.personalInfo.linkedin}
                onChange={(e) => updatePersonalInfo("linkedin", e.target.value)}
              />
            </div>

            <div className="relative">
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-gray-700">
                  Professional Summary
                </label>
              </div>
              <textarea
                rows={4}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                placeholder="Brief professional summary..."
                value={data.personalInfo.summary}
                onChange={(e) => updatePersonalInfo("summary", e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
      {/* Skills */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection("skills")}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <span className="font-semibold text-gray-700">Skills</span>
          {activeSection === "skills" ? (
            <ChevronUp size={20} />
          ) : (
            <ChevronDown size={20} />
          )}
        </button>

        {activeSection === "skills" && (
          <div className="p-4 space-y-3 animate-fadeIn">
            {/* Pills */}
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={() => removeSkill(skill)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* Input field */}
            <input
              type="text"
              placeholder="Type skill and add comma"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              value={newSkill}
              onChange={handleSkillInput}
            />
          </div>
        )}
      </div>
      {/* Experience */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection("experience")}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <span className="font-semibold text-gray-700">Work Experience</span>
          {activeSection === "experience" ? (
            <ChevronUp size={20} />
          ) : (
            <ChevronDown size={20} />
          )}
        </button>

        {activeSection === "experience" && (
          <div className="p-4 space-y-6 animate-fadeIn">
            {data.experiences.map((exp) => (
              <div
                key={exp.id}
                className="p-4 bg-gray-50 rounded-lg border border-gray-100 relative"
              >
                {/* HEADER ROW — Icon + Title + Toggle + Delete */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700">
                      Experience {data.experiences.indexOf(exp) + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleExp(exp.id)}
                      className="text-gray-600 hover:text-black"
                    >
                      {collapsedExp[exp.id] ? (
                        <ChevronDown size={18} />
                      ) : (
                        <ChevronUp size={18} />
                      )}
                    </button>

                    <button
                      onClick={() => removeExperience(exp.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* COLLAPSIBLE CONTENT */}
                {!collapsedExp[exp.id] && (
                  <div className="space-y-3 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        placeholder="Job Role"
                        className="p-2 border border-gray-300 rounded text-sm"
                        value={exp.role}
                        onChange={(e) =>
                          updateExperience(exp.id, "role", e.target.value)
                        }
                      />
                      <input
                        placeholder="Company Name"
                        className="p-2 border border-gray-300 rounded text-sm"
                        value={exp.company}
                        onChange={(e) =>
                          updateExperience(exp.id, "company", e.target.value)
                        }
                      />
                      <input
                        placeholder="Start Date"
                        className="p-2 border border-gray-300 rounded text-sm"
                        value={exp.startDate}
                        onChange={(e) =>
                          updateExperience(exp.id, "startDate", e.target.value)
                        }
                      />
                      <input
                        placeholder="End Date"
                        className="p-2 border border-gray-300 rounded text-sm"
                        value={exp.endDate}
                        disabled={exp.isCurrent}
                        onChange={(e) =>
                          updateExperience(exp.id, "endDate", e.target.value)
                        }
                      />
                    </div>

                    <textarea
                      rows={4}
                      placeholder="• Responsibilities and achievements"
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                      value={exp.description}
                      onChange={(e) =>
                        updateExperience(exp.id, "description", e.target.value)
                      }
                    ></textarea>
                  </div>
                )}
              </div>
            ))}
            <button
              onClick={addExperience}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Add Work Experience
            </button>
          </div>
        )}
      </div>
      {/* Projects */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection("projects")}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <span className="font-semibold text-gray-700">Projects</span>
          {activeSection === "projects" ? (
            <ChevronUp size={20} />
          ) : (
            <ChevronDown size={20} />
          )}
        </button>

        {activeSection === "projects" && (
          <div className="p-4 space-y-6 animate-fadeIn">
            {data.projects.map((proj, index) => (
              <div
                key={proj.id}
                className="p-4 bg-gray-50 rounded-lg border border-gray-100 relative"
              >
                {/* HEADER */}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-gray-700">
                    Project {index + 1}
                  </span>

                  <div className="flex items-center gap-3">
                    {/* Collapse toggle */}
                    <button
                      onClick={() => toggleProj(proj.id)}
                      className="text-gray-600 hover:text-black"
                    >
                      {collapsedProj[proj.id] ? (
                        <ChevronDown size={18} />
                      ) : (
                        <ChevronUp size={18} />
                      )}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => removeProject(proj.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* COLLAPSIBLE CONTENT */}
                {!collapsedProj[proj.id] && (
                  <div className="space-y-3 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        placeholder="Project Name"
                        className="p-2 border border-gray-300 rounded text-sm"
                        value={proj.name}
                        onChange={(e) =>
                          updateProject(proj.id, "name", e.target.value)
                        }
                      />

                      <input
                        placeholder="Project Link (Optional)"
                        className="p-2 border border-gray-300 rounded text-sm"
                        value={proj.link}
                        onChange={(e) =>
                          updateProject(proj.id, "link", e.target.value)
                        }
                      />
                    </div>

                    <textarea
                      rows={3}
                      placeholder="Brief description"
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                      value={proj.description}
                      onChange={(e) =>
                        updateProject(proj.id, "description", e.target.value)
                      }
                    ></textarea>
                  </div>
                )}
              </div>
            ))}

            {/* Add Project */}
            <button
              onClick={addProject}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg 
        text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors
        flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Add Project
            </button>
          </div>
        )}
      </div>

      {/* Education */}
      {/* Education */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection("education")}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <span className="font-semibold text-gray-700">Education</span>
          {activeSection === "education" ? (
            <ChevronUp size={20} />
          ) : (
            <ChevronDown size={20} />
          )}
        </button>

        {activeSection === "education" && (
          <div className="p-4 space-y-6 animate-fadeIn">
            {data.education.map((edu, index) => (
              <div
                key={edu.id}
                className="p-4 bg-gray-50 rounded-lg border border-gray-100 relative"
              >
                {/* HEADER */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-700">
                      {edu.degree || "Degree"}
                    </span>

                    <span className="text-xs text-gray-600">
                      {edu.institution || "Institution / University"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Collapse toggle */}
                    <button
                      onClick={() => toggleEduCollapse(edu.id)}
                      className="text-gray-600 hover:text-black"
                    >
                      {collapsedEdu[edu.id] ? (
                        <ChevronDown size={18} />
                      ) : (
                        <ChevronUp size={18} />
                      )}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => removeEducation(edu.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* COLLAPSIBLE CONTENT */}
                {!collapsedEdu[edu.id] && (
                  <div className="space-y-3 animate-fadeIn">
                    {/* Degree (Full width) */}
                    <input
                      placeholder="Degree / Certification"
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                      value={edu.degree}
                      onChange={(e) =>
                        updateEducation(edu.id, "degree", e.target.value)
                      }
                    />

                    {/* Institution (Full width) */}
                    <input
                      placeholder="Institution / University"
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                      value={edu.institution}
                      onChange={(e) =>
                        updateEducation(edu.id, "institution", e.target.value)
                      }
                    />

                    {/* Dates (2 columns) */}
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        placeholder="Start Date"
                        className="p-2 border border-gray-300 rounded text-sm"
                        value={edu.startDate}
                        onChange={(e) =>
                          updateEducation(edu.id, "startDate", e.target.value)
                        }
                      />

                      <input
                        placeholder="End Date"
                        className="p-2 border border-gray-300 rounded text-sm"
                        value={edu.endDate}
                        onChange={(e) =>
                          updateEducation(edu.id, "endDate", e.target.value)
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Add Education */}
            <button
              onClick={addEducation}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg 
        text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors
        flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Add Education
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
