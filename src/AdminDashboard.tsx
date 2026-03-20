import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from './Layout';
import sql from './db';
import { 
  Users, Briefcase, FileText, TrendingUp, 
  Shield, UserCheck, UserMinus, Search, Filter, MoreVertical
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalApplications: 0,
    activeRecruiters: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [userList, jobCount, appCount, recruiterCount] = await Promise.all([
        sql`SELECT id, email, full_name, role, is_admin, created_at FROM profiles ORDER BY created_at DESC`,
        sql`SELECT count(*) FROM job_postings`,
        sql`SELECT count(*) FROM applications`,
        sql`SELECT count(*) FROM recruiters`
      ]);

      setUsers(userList);
      setStats({
        totalUsers: userList.length,
        totalJobs: parseInt(jobCount[0].count) || 0,
        totalApplications: parseInt(appCount[0].count) || 0,
        activeRecruiters: parseInt(recruiterCount[0].count) || 0
      });
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      await sql`UPDATE profiles SET role = ${newRole}, updated_at = NOW() WHERE id = ${userId}`;
      toast.success(`User role updated to ${newRole}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const toggleAdmin = async (userId: string, currentStatus: boolean) => {
    try {
      await sql`UPDATE profiles SET is_admin = ${!currentStatus}, updated_at = NOW() WHERE id = ${userId}`;
      toast.success(`Admin status ${!currentStatus ? 'granted' : 'revoked'}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update admin status');
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.full_name && u.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Control Center</h1>
            <p className="text-gray-400">Manage platform users, roles, and system health</p>
          </div>
          <Link
            to="/analytics"
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
          >
            <TrendingUp className="w-5 h-5" />
            <span>View Detailed Analytics</span>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="purple" />
          <StatCard icon={Shield} label="Recruiters" value={stats.activeRecruiters} color="blue" />
          <StatCard icon={Briefcase} label="Platform Jobs" value={stats.totalJobs} color="green" />
          <StatCard icon={FileText} label="Applications" value={stats.totalApplications} color="yellow" />
        </div>

        {/* User Management Table */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-white">User Management</h2>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search users..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-900/50 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Admin</th>
                  <th className="px-6 py-4 font-semibold">Joined</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">No users found matching your search</td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-xs font-bold text-purple-400">
                            {(u.full_name || u.email).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-white font-medium text-sm">{u.full_name || 'N/A'}</div>
                            <div className="text-gray-500 text-xs">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          value={u.role}
                          onChange={(e) => updateUserRole(u.id, e.target.value)}
                          className="bg-gray-900 border border-gray-700 text-gray-300 text-xs rounded px-2 py-1 outline-none focus:ring-1 focus:ring-purple-500"
                        >
                          <option value="job_seeker">Job Seeker</option>
                          <option value="recruiter">Recruiter</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => toggleAdmin(u.id, u.is_admin)}
                          className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tighter ${
                            u.is_admin ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-700 text-gray-500'
                          }`}
                        >
                          {u.is_admin ? 'Yes' : 'No'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-gray-500 hover:text-white transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
  const colors: any = {
    purple: 'bg-purple-500/10 text-purple-500',
    blue: 'bg-blue-500/10 text-blue-500',
    green: 'bg-green-500/10 text-green-500',
    yellow: 'bg-yellow-500/10 text-yellow-500',
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
      <div className={`w-12 h-12 ${colors[color]} rounded-xl flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
      <p className="text-gray-400 text-sm">{label}</p>
    </div>
  );
}
