import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { useAuth } from './AuthContext';
import {
  User, Mail, Phone, MapPin, Briefcase,
  Globe, Save, Camera, Plus, Trash2, Award,
  Linkedin, Github, CheckCircle, AlertCircle, Edit3,
  FileText, ChevronRight, ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

function ProfileCompleteness({ fields }: { fields: { label: string; done: boolean }[] }) {
  const done = fields.filter(f => f.done).length;
  const pct = Math.round((done / fields.length) * 100);
  const remaining = fields.filter(f => !f.done);
  const color = pct >= 80 ? 'from-green-500 to-emerald-500' : pct >= 50 ? 'from-yellow-500 to-orange-400' : 'from-red-500 to-orange-500';

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-sm font-black text-white`}>
            {pct}%
          </div>
          <div>
            <h3 className="text-white font-bold">Profile Strength</h3>
            <p className="text-gray-500 text-xs">{done}/{fields.length} fields complete</p>
          </div>
        </div>
        {pct === 100 && <span className="text-xs text-green-400 font-bold flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Complete!</span>}
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {remaining.length > 0 && (
        <div>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Still needed:</p>
          <div className="flex flex-wrap gap-1.5">
            {remaining.slice(0, 4).map(f => (
              <span key={f.label} className="px-2.5 py-1 bg-gray-900/60 border border-gray-700 text-gray-400 rounded-lg text-[10px] font-bold">
                {f.label}
              </span>
            ))}
            {remaining.length > 4 && (
              <span className="px-2.5 py-1 bg-gray-900/60 border border-gray-700 text-gray-500 rounded-lg text-[10px] font-bold">
                +{remaining.length - 4} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Profile() {
  const { profile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    location: '',
    bio: '',
    skills: [] as string[],
    experience_years: 0,
    website: '',
    github: '',
    linkedin: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: (profile as any).phone || '',
        location: (profile as any).location || '',
        bio: (profile as any).bio || '',
        skills: profile.skills || [],
        experience_years: profile.experience_years || 0,
        website: (profile as any).website || '',
        github: (profile as any).github || '',
        linkedin: (profile as any).linkedin || ''
      });
    }
  }, [profile]);

  const profileFields = [
    { label: 'Full Name', done: !!formData.full_name },
    { label: 'Phone', done: !!formData.phone },
    { label: 'Location', done: !!formData.location },
    { label: 'Bio', done: formData.bio.length > 20 },
    { label: 'Skills (3+)', done: formData.skills.length >= 3 },
    { label: 'Experience', done: formData.experience_years > 0 },
    { label: 'LinkedIn', done: !!formData.linkedin },
    { label: 'GitHub', done: !!formData.github },
    { label: 'Website', done: !!formData.website },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch {
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = () => {
    const skill = newSkill.trim();
    if (skill && !formData.skills.includes(skill)) {
      setFormData({ ...formData, skills: [...formData.skills, skill] });
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  const experienceLevels = [
    { value: 0, label: 'Student / No experience' },
    { value: 1, label: '1 year' },
    { value: 2, label: '2 years' },
    { value: 3, label: '3 years' },
    { value: 5, label: '5 years' },
    { value: 8, label: '8 years' },
    { value: 10, label: '10+ years' },
  ];

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white mb-1 flex items-center gap-3">
              <User className="w-8 h-8 text-purple-500" />
              My Profile
            </h1>
            <p className="text-gray-400 text-sm">Keep your profile up to date to attract the best opportunities</p>
          </div>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-purple-500/20"
            >
              <Edit3 className="w-4 h-4" /> Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => { setEditing(false); }}
                className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold text-sm transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Profile card + completeness */}
          <div className="lg:col-span-1 space-y-5">
            {/* Avatar Card */}
            <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 text-center shadow-xl">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-3xl flex items-center justify-center text-4xl font-black text-white shadow-lg shadow-purple-500/20 mx-auto">
                  {formData.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                {editing && (
                  <button className="absolute -bottom-2 -right-2 p-2 bg-gray-700 border border-gray-600 rounded-xl text-gray-300 hover:text-white transition-all shadow-lg">
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>
              <h2 className="text-xl font-black text-white mb-1">{formData.full_name || 'Your Name'}</h2>
              <p className="text-gray-500 text-xs font-medium mb-3">{profile?.email}</p>
              {formData.location && (
                <div className="flex items-center justify-center gap-1.5 text-gray-400 text-sm mb-2">
                  <MapPin className="w-3.5 h-3.5 text-purple-500" />
                  {formData.location}
                </div>
              )}
              {formData.experience_years > 0 && (
                <div className="flex items-center justify-center gap-1.5 text-gray-400 text-sm">
                  <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                  {formData.experience_years} year{formData.experience_years !== 1 ? 's' : ''} experience
                </div>
              )}

              {/* Social Links Display */}
              {(formData.linkedin || formData.github || formData.website) && (
                <div className="flex justify-center gap-2 mt-4">
                  {formData.linkedin && (
                    <a href={formData.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500/20 transition-all border border-blue-500/20">
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {formData.github && (
                    <a href={formData.github} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 transition-all border border-gray-600">
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {formData.website && (
                    <a href={formData.website} target="_blank" rel="noopener noreferrer" className="p-2 bg-purple-500/10 text-purple-400 rounded-xl hover:bg-purple-500/20 transition-all border border-purple-500/20">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Profile Completeness */}
            <ProfileCompleteness fields={profileFields} />

            {/* Skills Display */}
            {formData.skills.length > 0 && (
              <div className="bg-gray-800 border border-gray-700 rounded-3xl p-5 shadow-xl">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-500" /> Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map(skill => (
                    <span key={skill} className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl text-xs font-bold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Edit Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5">
            {/* Basic Info */}
            <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 shadow-xl space-y-5">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <User className="w-5 h-5 text-purple-500" />
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Full Name" icon={User} iconColor="text-purple-400">
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    disabled={!editing}
                    className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all disabled:opacity-60 placeholder-gray-600 hover:border-gray-600"
                    placeholder="Jane Smith"
                  />
                </FormField>

                <FormField label="Phone Number" icon={Phone} iconColor="text-blue-400">
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!editing}
                    className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all disabled:opacity-60 placeholder-gray-600 hover:border-gray-600"
                    placeholder="+1 (555) 000-0000"
                  />
                </FormField>

                <FormField label="Location" icon={MapPin} iconColor="text-pink-400">
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    disabled={!editing}
                    className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all disabled:opacity-60 placeholder-gray-600 hover:border-gray-600"
                    placeholder="City, Country"
                  />
                </FormField>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Years of Experience</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400" />
                    <select
                      value={formData.experience_years}
                      onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) })}
                      disabled={!editing}
                      className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all disabled:opacity-60 appearance-none hover:border-gray-600"
                    >
                      {experienceLevels.map(l => (
                        <option key={l.value} value={l.value}>{l.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Professional Bio
                </label>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  disabled={!editing}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-600 focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none disabled:opacity-60 hover:border-gray-600"
                  placeholder="Describe your professional background, key achievements, and what you're looking for in your next role..."
                />
                <p className="text-right text-[10px] text-gray-600">{formData.bio.length} characters</p>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 shadow-xl space-y-4">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Skills & Expertise
              </h2>
              <div className="flex flex-wrap gap-2 min-h-[40px]">
                {formData.skills.map(skill => (
                  <span key={skill} className="group flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl text-xs font-bold">
                    {skill}
                    {editing && (
                      <button type="button" onClick={() => removeSkill(skill)} className="text-purple-500/40 hover:text-red-400 transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
                {formData.skills.length === 0 && !editing && (
                  <p className="text-gray-600 text-sm italic">No skills added yet</p>
                )}
              </div>
              {editing && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                    placeholder="Type a skill and press Enter or click Add"
                    className="flex-1 px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-600 focus:ring-2 focus:ring-purple-500 outline-none hover:border-gray-600 transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm transition-all"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
              )}
              {editing && (
                <div className="flex flex-wrap gap-1.5">
                  {['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'TypeScript', 'AWS', 'Docker', 'Java', 'C#', 'Go', 'Rust'].map(suggestion => (
                    !formData.skills.includes(suggestion) && (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => setFormData({ ...formData, skills: [...formData.skills, suggestion] })}
                        className="px-2.5 py-1 text-[10px] font-bold text-gray-500 bg-gray-900/60 border border-gray-700 rounded-lg hover:border-purple-500/30 hover:text-purple-400 transition-all"
                      >
                        + {suggestion}
                      </button>
                    )
                  ))}
                </div>
              )}
            </div>

            {/* Social Links */}
            <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 shadow-xl space-y-4">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-green-500" />
                Online Presence
              </h2>
              <div className="space-y-3">
                <FormField label="LinkedIn URL" icon={Linkedin} iconColor="text-blue-400">
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    disabled={!editing}
                    className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all disabled:opacity-60 placeholder-gray-600 hover:border-gray-600"
                    placeholder="https://linkedin.com/in/yourname"
                  />
                </FormField>
                <FormField label="GitHub URL" icon={Github} iconColor="text-gray-400">
                  <input
                    type="url"
                    value={formData.github}
                    onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                    disabled={!editing}
                    className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all disabled:opacity-60 placeholder-gray-600 hover:border-gray-600"
                    placeholder="https://github.com/yourname"
                  />
                </FormField>
                <FormField label="Portfolio / Website" icon={Globe} iconColor="text-green-400">
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    disabled={!editing}
                    className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all disabled:opacity-60 placeholder-gray-600 hover:border-gray-600"
                    placeholder="https://yourportfolio.com"
                  />
                </FormField>
              </div>
            </div>

            {editing && (
              <div className="flex justify-end gap-3 pb-4">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-2xl font-bold text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 text-sm uppercase tracking-widest"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </Layout>
  );
}

function FormField({ label, icon: Icon, iconColor, children }: {
  label: string; icon: any; iconColor: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">{label}</label>
      <div className="relative group">
        <Icon className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${iconColor}`} />
        {children}
      </div>
    </div>
  );
}
