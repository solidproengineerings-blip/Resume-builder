import React, { useState } from 'react';
import { ResumeData, Experience, Education } from '../types';
import { Plus, Trash2, Wand2, ChevronDown, ChevronUp } from 'lucide-react';
import { generateResumeSummary, enhanceExperienceDescription } from '../services/geminiService';

interface ResumeFormProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

export const ResumeForm: React.FC<ResumeFormProps> = ({ data, onChange }) => {
  const [activeSection, setActiveSection] = useState<string | null>('personal');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [loadingEnhancements, setLoadingEnhancements] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const updatePersonalInfo = (field: keyof ResumeData['personalInfo'], value: string) => {
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
      updatePersonalInfo('summary', summary);
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
      company: '',
      role: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: '',
    };
    onChange({ ...data, experiences: [...data.experiences, newExp] });
  };

  const updateExperience = (id: string, field: keyof Experience, value: any) => {
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

  const handleEnhanceDescription = async (id: string, role: string, text: string) => {
    if (!text || !role) return;
    setLoadingEnhancements(prev => ({ ...prev, [id]: true }));
    try {
      const enhanced = await enhanceExperienceDescription(role, text);
      updateExperience(id, 'description', enhanced);
    } catch (e) {
      alert("Enhancement failed.");
    } finally {
      setLoadingEnhancements(prev => ({ ...prev, [id]: false }));
    }
  };

  // --- Education Handlers ---
  const addEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      institution: '',
      degree: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
    };
    onChange({ ...data, education: [...data.education, newEdu] });
  };

  const updateEducation = (id: string, field: keyof Education, value: any) => {
    onChange({
      ...data,
      education: data.education.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
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
    const skillsArray = value.split(',').map(s => s.trim()).filter(s => s !== '');
    onChange({ ...data, skills: skillsArray });
  };

  // --- Projects Handlers ---
  const addProject = () => {
      onChange({
          ...data,
          projects: [...data.projects, { id: Date.now().toString(), name: '', description: '', link: '' }]
      });
  };

  const updateProject = (id: string, field: string, value: string) => {
      onChange({
          ...data,
          projects: data.projects.map(p => p.id === id ? { ...p, [field]: value } : p)
      });
  };
   const removeProject = (id: string) => {
      onChange({
          ...data,
          projects: data.projects.filter(p => p.id !== id)
      });
  };


  return (
    <div className="space-y-4">
      
      {/* Personal Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection('personal')}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <span className="font-semibold text-gray-700">Personal Information</span>
          {activeSection === 'personal' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        
        {activeSection === 'personal' && (
          <div className="p-4 space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                value={data.personalInfo.fullName}
                onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
              />
              <input
                type="text"
                placeholder="Job Title"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                value={data.personalInfo.jobTitle}
                onChange={(e) => updatePersonalInfo('jobTitle', e.target.value)}
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                value={data.personalInfo.email}
                onChange={(e) => updatePersonalInfo('email', e.target.value)}
              />
              <input
                type="tel"
                placeholder="Phone"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                value={data.personalInfo.phone}
                onChange={(e) => updatePersonalInfo('phone', e.target.value)}
              />
              <input
                type="text"
                placeholder="City, Country"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                value={data.personalInfo.location}
                onChange={(e) => updatePersonalInfo('location', e.target.value)}
              />
               <input
                type="text"
                placeholder="LinkedIn (e.g. linkedin.com/in/jdoe)"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                value={data.personalInfo.linkedin}
                onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
              />
               <input
                type="text"
                placeholder="Portfolio / Website"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                value={data.personalInfo.website}
                onChange={(e) => updatePersonalInfo('website', e.target.value)}
              />
            </div>

            <div className="relative">
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-gray-700">Professional Summary</label>
                <button
                  onClick={handleGenerateSummary}
                  disabled={isGeneratingSummary}
                  className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 disabled:opacity-50"
                >
                   <Wand2 size={12} />
                   {isGeneratingSummary ? 'Writing...' : 'Auto-Write with AI'}
                </button>
              </div>
              <textarea
                rows={4}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                placeholder="Brief professional summary..."
                value={data.personalInfo.summary}
                onChange={(e) => updatePersonalInfo('summary', e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Experience */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection('experience')}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <span className="font-semibold text-gray-700">Experience</span>
          {activeSection === 'experience' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        
        {activeSection === 'experience' && (
          <div className="p-4 space-y-6 animate-fadeIn">
            {data.experiences.map((exp) => (
              <div key={exp.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100 relative group">
                <button
                  onClick={() => removeExperience(exp.id)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1"
                >
                  <Trash2 size={16} />
                </button>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <input
                    placeholder="Job Role"
                    className="p-2 border border-gray-300 rounded text-sm"
                    value={exp.role}
                    onChange={(e) => updateExperience(exp.id, 'role', e.target.value)}
                  />
                  <input
                    placeholder="Company Name"
                    className="p-2 border border-gray-300 rounded text-sm"
                    value={exp.company}
                    onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Start Date (e.g., Jan 2022)"
                    className="p-2 border border-gray-300 rounded text-sm"
                    value={exp.startDate}
                    onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                  />
                  <div className="flex items-center gap-2">
                     <input
                        type="text"
                        placeholder="End Date"
                        className="p-2 border border-gray-300 rounded text-sm flex-1 disabled:bg-gray-200"
                        value={exp.endDate}
                        onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                        disabled={exp.isCurrent}
                      />
                      <label className="flex items-center gap-1 text-xs whitespace-nowrap">
                          <input 
                            type="checkbox" 
                            checked={exp.isCurrent} 
                            onChange={(e) => updateExperience(exp.id, 'isCurrent', e.target.checked)}
                          /> Current
                      </label>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="flex justify-between items-center mb-1">
                     <label className="text-xs font-medium text-gray-500">Description (Bullet points)</label>
                      <button
                        onClick={() => handleEnhanceDescription(exp.id, exp.role, exp.description)}
                        disabled={loadingEnhancements[exp.id]}
                        className="text-xs flex items-center gap-1 text-purple-600 hover:text-purple-800 disabled:opacity-50"
                      >
                         <Wand2 size={12} />
                         {loadingEnhancements[exp.id] ? 'Enhancing...' : 'Enhance with AI'}
                      </button>
                  </div>
                  <textarea
                    rows={4}
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={exp.description}
                    onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                    placeholder="• Achieved X by doing Y..."
                  />
                </div>
              </div>
            ))}
            <button
              onClick={addExperience}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Add Position
            </button>
          </div>
        )}
      </div>

      {/* Education */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection('education')}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <span className="font-semibold text-gray-700">Education</span>
          {activeSection === 'education' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        
        {activeSection === 'education' && (
          <div className="p-4 space-y-6 animate-fadeIn">
            {data.education.map((edu) => (
              <div key={edu.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100 relative">
                <button
                  onClick={() => removeEducation(edu.id)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1"
                >
                  <Trash2 size={16} />
                </button>
                <div className="grid grid-cols-1 gap-3">
                  <input
                    placeholder="Institution / University"
                    className="p-2 border border-gray-300 rounded text-sm"
                    value={edu.institution}
                    onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                  />
                  <input
                    placeholder="Degree / Certification"
                    className="p-2 border border-gray-300 rounded text-sm"
                    value={edu.degree}
                    onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                  />
                   <div className="grid grid-cols-2 gap-3">
                       <input
                        placeholder="Start Date"
                        className="p-2 border border-gray-300 rounded text-sm"
                        value={edu.startDate}
                        onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                      />
                       <input
                        placeholder="End Date"
                        className="p-2 border border-gray-300 rounded text-sm"
                        value={edu.endDate}
                        onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                      />
                   </div>
                </div>
              </div>
            ))}
             <button
              onClick={addEducation}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Add Education
            </button>
          </div>
        )}
      </div>
      
       {/* Projects */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection('projects')}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <span className="font-semibold text-gray-700">Projects</span>
          {activeSection === 'projects' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        
        {activeSection === 'projects' && (
          <div className="p-4 space-y-6 animate-fadeIn">
            {data.projects.map((proj) => (
              <div key={proj.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100 relative">
                 <button
                  onClick={() => removeProject(proj.id)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1"
                >
                  <Trash2 size={16} />
                </button>
                 <div className="grid grid-cols-1 gap-3">
                  <input
                    placeholder="Project Name"
                    className="p-2 border border-gray-300 rounded text-sm"
                    value={proj.name}
                    onChange={(e) => updateProject(proj.id, 'name', e.target.value)}
                  />
                  <input
                    placeholder="Project Link (Optional)"
                    className="p-2 border border-gray-300 rounded text-sm"
                    value={proj.link}
                    onChange={(e) => updateProject(proj.id, 'link', e.target.value)}
                  />
                   <textarea
                    rows={2}
                    placeholder="Brief description"
                    className="p-2 border border-gray-300 rounded text-sm"
                    value={proj.description}
                    onChange={(e) => updateProject(proj.id, 'description', e.target.value)}
                  />
                </div>
              </div>
            ))}
            <button
              onClick={addProject}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Add Project
            </button>
          </div>
        )}
      </div>

      {/* Skills */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection('skills')}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <span className="font-semibold text-gray-700">Skills</span>
          {activeSection === 'skills' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        
        {activeSection === 'skills' && (
          <div className="p-4 animate-fadeIn">
             <label className="text-sm font-medium text-gray-700 mb-2 block">
                Comma separated skills (e.g., React, TypeScript, Node.js)
             </label>
            <textarea
                rows={3}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                value={data.skills.join(', ')}
                onChange={(e) => updateSkills(e.target.value)}
              />
          </div>
        )}
      </div>
    </div>
  );
};