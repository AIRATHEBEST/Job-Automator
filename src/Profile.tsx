import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { useAuth } from './AuthContext';
import { 
  User, Mail, Phone, MapPin, Briefcase, 
  Globe, Save, Camera, Plus, Trash2, Award
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { profile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      toast.success('Profile updated successfully');
      setEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const addSkill = (skill: string) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData({ ...formData, skills: [...formData.skills, skill] });
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-white mb-2">My Professional Profile</h1>
            <p className="text-gray-400 font-medium">Keep your details up to date to attract the best opportunities</p>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className={`px-6 py-2 rounded-xl font-bold transition-all ${
              editing ? 'bg-gray-700 text-white' : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info Section */}
          <div className="bg-gray-800 border border-gray-700 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-8 border-b border-gray-700 bg-gray-800/50 flex items-center gap-6">
              <div className="relative group">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-lg shadow-purple-500/20">
                  {formData.full_name?.charAt(0) || 'U'}
                </div>
                {editing && (
                  <button type="button" className="absolute -bottom-2 -right-2 p-2 bg-gray-900 border border-gray-700 rounded-xl text-gray-400 hover:text-white transition-all shadow-xl">
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-1">{formData.full_name || 'Your Name'}</h2>
                <p className="text-sm text-gray-500 font-medium uppercase tracking-widest">{profile?.email}</p>
              </div>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    disabled={!editing}
                    className="w-full pl-11 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all disabled:opacity-50"
                    placeholder="Full Name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Phone Number</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!editing}
                    className="w-full pl-11 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all disabled:opacity-50"
                    placeholder="+27 12 345 6789"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Location</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    disabled={!editing}
                    className="w-full pl-11 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all disabled:opacity-50"
                    placeholder="City, Country"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Years of Experience</label>
                <div className="relative group">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                  <input
                    type="number"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                    disabled={!editing}
                    className="w-full pl-11 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all disabled:opacity-50"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bio & Skills Section */}
          <div className="bg-gray-800 border border-gray-700 rounded-3xl p-8 shadow-xl space-y-8">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Professional Bio</label>
              <textarea
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                disabled={!editing}
                className="w-full px-6 py-4 bg-gray-900 border border-gray-700 rounded-2xl text-white placeholder-gray-600 focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none disabled:opacity-50"
                placeholder="Briefly describe your professional background and goals..."
              />
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Skills & Expertise</label>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill) => (
                  <span key={skill} className="group flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl text-sm font-bold">
                    {skill}
                    {editing && (
                      <button type="button" onClick={() => removeSkill(skill)} className="text-purple-500/50 group-hover:text-purple-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </span>
                ))}
                {editing && (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Add skill..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkill(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                      className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-purple-500 outline-none w-32 focus:w-48 transition-all"
                    />
                    <Plus className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-gray-800 border border-gray-700 rounded-3xl p-8 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <Globe className="w-5 h-5 text-purple-500" />
              Online Presence
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">LinkedIn</label>
                <input
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  disabled={!editing}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none disabled:opacity-50"
                  placeholder="linkedin.com/in/..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">GitHub</label>
                <input
                  type="url"
                  value={formData.github}
                  onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                  disabled={!editing}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none disabled:opacity-50"
                  placeholder="github.com/..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  disabled={!editing}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none disabled:opacity-50"
                  placeholder="portfolio.com"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          {editing && (
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-10 py-4 bg-purple-600 hover:bg-purple-700 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 active:scale-95"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Saving Changes...' : 'Save Profile'}
              </button>
            </div>
          )}
        </form>
      </div>
    </Layout>
  );
}
