import React, { useState } from 'react';
import { Search, Filter, Download, Plus, Edit2, Trash2, UserCheck, UserX, X, Save, Mail, Phone, Building, Shield, User, Calendar } from 'lucide-react';
import { StatusBadge } from '../components/UI/StatusBadge';
import { useRealData } from '../hooks/useRealData';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

interface AddOfficerFormData {
  name: string;
  mobile: string;
  telegram_id: string;
  email: string;
  department: string;
  rank: string;
  badge_number: string;
  credits_remaining: number;
  total_credits: number;
}

export const Officers: React.FC = () => {
  const { officers, isLoading, createOfficer, deleteOfficer, updateOfficerStatus } = useRealData();
  const { isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<AddOfficerFormData>({
    name: '',
    mobile: '',
    telegram_id: '',
    email: '',
    department: '',
    rank: '',
    badge_number: '',
    credits_remaining: 50,
    total_credits: 50
  });

  const filteredOfficers = officers.filter(officer => {
    const matchesSearch = officer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         officer.mobile.includes(searchTerm) ||
                         (officer.telegram_id && officer.telegram_id.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || officer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'credits_remaining' || name === 'total_credits' ? parseInt(value) || 0 : value
    }));
  };

  const handleAddOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.name.trim() || !formData.mobile.trim()) {
        toast.error('Name and mobile number are required');
        return;
      }

      // Check for duplicate mobile
      if (officers.some(officer => officer.mobile === formData.mobile)) {
        toast.error('An officer with this mobile number already exists');
        return;
      }

      await createOfficer(formData);
      toast.success('Officer added successfully!');
      setShowAddModal(false);
      setFormData({
        name: '',
        mobile: '',
        telegram_id: '',
        email: '',
        department: '',
        rank: '',
        badge_number: '',
        credits_remaining: 50,
        total_credits: 50
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to add officer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = (format: 'csv' | 'json' | 'pdf') => {
    try {
      const dataToExport = filteredOfficers.map(officer => ({
        Name: officer.name,
        Mobile: officer.mobile,
        'Telegram ID': officer.telegram_id || '',
        Status: officer.status,
        'Registered On': officer.registered_on,
        'Last Active': officer.last_active,
        'Credits Remaining': officer.credits_remaining,
        'Total Credits': officer.total_credits,
        'Total Queries': officer.total_queries
      }));

      if (format === 'csv') {
        const headers = Object.keys(dataToExport[0]);
        const csvContent = [
          headers.join(','),
          ...dataToExport.map(row => 
            headers.map(header => `"${row[header as keyof typeof row]}"`).join(',')
          )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `officers_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else if (format === 'json') {
        const jsonContent = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `officers_export_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
      }

      toast.success(`Officers exported as ${format.toUpperCase()}`);
      setShowExportModal(false);
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const handleStatusToggle = async (officerId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
      await updateOfficerStatus(officerId, newStatus);
      toast.success(`Officer ${newStatus.toLowerCase()}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update officer status');
    }
  };

  const handleDeleteOfficer = async (officerId: string, officerName: string) => {
    if (window.confirm(`Are you sure you want to delete ${officerName}? This action cannot be undone.`)) {
      try {
        await deleteOfficer(officerId);
        toast.success('Officer deleted successfully');
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete officer');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-cyber-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 min-h-screen ${isDark ? 'bg-crisp-black' : 'bg-soft-white'}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Officer Management
          </h1>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage law enforcement personnel and their access
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-cyber-gradient text-white px-4 py-2 rounded-lg hover:shadow-cyber transition-all duration-200 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Officer</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`border border-cyber-teal/20 rounded-lg p-6 ${
          isDark ? 'bg-muted-graphite' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Total Officers
              </p>
              <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {officers.length}
              </p>
            </div>
            <UserCheck className="w-8 h-8 text-cyber-teal" />
          </div>
        </div>

        <div className={`border border-cyber-teal/20 rounded-lg p-6 ${
          isDark ? 'bg-muted-graphite' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Active Officers
              </p>
              <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {officers.filter(o => o.status === 'Active').length}
              </p>
            </div>
            <UserCheck className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className={`border border-cyber-teal/20 rounded-lg p-6 ${
          isDark ? 'bg-muted-graphite' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Suspended Officers
              </p>
              <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {officers.filter(o => o.status === 'Suspended').length}
              </p>
            </div>
            <UserX className="w-8 h-8 text-red-400" />
          </div>
        </div>

        <div className={`border border-cyber-teal/20 rounded-lg p-6 ${
          isDark ? 'bg-muted-graphite' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Total Credits
              </p>
              <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {officers.reduce((sum, o) => sum + o.credits_remaining, 0)}
              </p>
            </div>
            <Download className="w-8 h-8 text-electric-blue" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`border border-cyber-teal/20 rounded-lg p-4 ${
        isDark ? 'bg-muted-graphite' : 'bg-white'
      }`}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                placeholder="Search officers by name, mobile, or telegram ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal focus:border-transparent ${
                  isDark 
                    ? 'bg-crisp-black text-white placeholder-gray-500' 
                    : 'bg-white text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
                isDark 
                  ? 'bg-crisp-black text-white' 
                  : 'bg-white text-gray-900'
              }`}
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>
            <button className="px-3 py-2 bg-cyber-teal/20 text-cyber-teal rounded-lg hover:bg-cyber-teal/30 transition-colors flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
            <button 
              onClick={() => setShowExportModal(true)}
              className="px-3 py-2 bg-electric-blue/20 text-electric-blue rounded-lg hover:bg-electric-blue/30 transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Officers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredOfficers.map((officer) => (
          <div key={officer.id} className={`border border-cyber-teal/20 rounded-lg p-6 hover:shadow-cyber transition-all duration-300 ${
            isDark ? 'bg-muted-graphite' : 'bg-white'
          }`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-cyber-gradient rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {officer.name}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {officer.telegram_id || '@' + officer.name.toLowerCase().replace(/\s+/g, '')}
                  </p>
                </div>
              </div>
              <StatusBadge status={officer.status} />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Mobile:</span>
                <span className={isDark ? 'text-white' : 'text-gray-900'}>{officer.mobile}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Registered:</span>
                <span className={isDark ? 'text-white' : 'text-gray-900'}>{officer.registered_on}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Last Active:</span>
                <span className={isDark ? 'text-white' : 'text-gray-900'}>{officer.last_active}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Credits:</span>
                <span className={isDark ? 'text-white' : 'text-gray-900'}>
                  {officer.credits_remaining}/{officer.total_credits}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Total Queries:</span>
                <span className={isDark ? 'text-white' : 'text-gray-900'}>{officer.total_queries}</span>
              </div>
            </div>

            {/* Credit Progress */}
            <div className="mt-4">
              <div className={`flex justify-between text-xs mb-1 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <span>Credit Usage</span>
                <span>{Math.round((officer.credits_remaining / officer.total_credits) * 100)}%</span>
              </div>
              <div className={`w-full rounded-full h-2 ${
                isDark ? 'bg-crisp-black' : 'bg-gray-200'
              }`}>
                <div 
                  className="bg-cyber-gradient h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(officer.credits_remaining / officer.total_credits) * 100}%` }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between mt-4 pt-4 border-t border-cyber-teal/20">
              <div className="flex space-x-2">
                <button className={`p-2 transition-colors ${
                  isDark ? 'text-gray-400 hover:text-cyber-teal' : 'text-gray-600 hover:text-cyber-teal'
                }`}>
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteOfficer(officer.id, officer.name)}
                  className={`p-2 transition-colors ${
                    isDark ? 'text-gray-400 hover:text-red-400' : 'text-gray-600 hover:text-red-400'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleStatusToggle(officer.id, officer.status)}
                  className={`p-2 transition-colors ${
                    officer.status === 'Active'
                      ? isDark ? 'text-gray-400 hover:text-yellow-400' : 'text-gray-600 hover:text-yellow-400'
                      : isDark ? 'text-gray-400 hover:text-green-400' : 'text-gray-600 hover:text-green-400'
                  }`}
                >
                  {officer.status === 'Active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredOfficers.length === 0 && (
        <div className="text-center py-12">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isDark ? 'bg-muted-graphite' : 'bg-gray-100'
          }`}>
            <Search className={`w-8 h-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
          <h3 className={`text-lg font-medium mb-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            No Officers Found
          </h3>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Try adjusting your search criteria or filters.
          </p>
        </div>
      )}

      {/* Add Officer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`max-w-2xl w-full rounded-lg p-6 max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-muted-graphite border border-cyber-teal/20' : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Add New Officer
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className={`p-2 transition-colors ${
                  isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddOfficer} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Inspector John Doe"
                      className={`w-full pl-10 pr-4 py-3 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
                        isDark 
                          ? 'bg-crisp-black text-white placeholder-gray-500' 
                          : 'bg-white text-gray-900 placeholder-gray-400'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Mobile Number *
                  </label>
                  <div className="relative">
                    <Phone className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <input
                      type="tel"
                      name="mobile"
                      required
                      value={formData.mobile}
                      onChange={handleInputChange}
                      placeholder="+91 9791103607"
                      className={`w-full pl-10 pr-4 py-3 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
                        isDark 
                          ? 'bg-crisp-black text-white placeholder-gray-500' 
                          : 'bg-white text-gray-900 placeholder-gray-400'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Telegram ID
                  </label>
                  <input
                    type="text"
                    name="telegram_id"
                    value={formData.telegram_id}
                    onChange={handleInputChange}
                    placeholder="@johndoe"
                    className={`w-full px-4 py-3 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
                      isDark 
                        ? 'bg-crisp-black text-white placeholder-gray-500' 
                        : 'bg-white text-gray-900 placeholder-gray-400'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john.doe@police.gov.in"
                      className={`w-full pl-10 pr-4 py-3 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
                        isDark 
                          ? 'bg-crisp-black text-white placeholder-gray-500' 
                          : 'bg-white text-gray-900 placeholder-gray-400'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Department
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
                      isDark 
                        ? 'bg-crisp-black text-white' 
                        : 'bg-white text-gray-900'
                    }`}
                  >
                    <option value="">Select Department</option>
                    <option value="Cyber Crime">Cyber Crime</option>
                    <option value="Intelligence">Intelligence</option>
                    <option value="Crime Branch">Crime Branch</option>
                    <option value="Traffic">Traffic</option>
                    <option value="Special Branch">Special Branch</option>
                    <option value="Anti-Terrorism">Anti-Terrorism</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Rank
                  </label>
                  <select
                    name="rank"
                    value={formData.rank}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
                      isDark 
                        ? 'bg-crisp-black text-white' 
                        : 'bg-white text-gray-900'
                    }`}
                  >
                    <option value="">Select Rank</option>
                    <option value="Constable">Constable</option>
                    <option value="Head Constable">Head Constable</option>
                    <option value="Assistant Sub Inspector">Assistant Sub Inspector</option>
                    <option value="Sub Inspector">Sub Inspector</option>
                    <option value="Inspector">Inspector</option>
                    <option value="Deputy Superintendent">Deputy Superintendent</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Badge Number
                  </label>
                  <div className="relative">
                    <Shield className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <input
                      type="text"
                      name="badge_number"
                      value={formData.badge_number}
                      onChange={handleInputChange}
                      placeholder="CC001"
                      className={`w-full pl-10 pr-4 py-3 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
                        isDark 
                          ? 'bg-crisp-black text-white placeholder-gray-500' 
                          : 'bg-white text-gray-900 placeholder-gray-400'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Credits Remaining
                  </label>
                  <input
                    type="number"
                    name="credits_remaining"
                    min="0"
                    value={formData.credits_remaining}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
                      isDark 
                        ? 'bg-crisp-black text-white' 
                        : 'bg-white text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Total Credits
                  </label>
                  <input
                    type="number"
                    name="total_credits"
                    min="0"
                    value={formData.total_credits}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
                      isDark 
                        ? 'bg-crisp-black text-white' 
                        : 'bg-white text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={`px-6 py-3 rounded-lg transition-colors ${
                    isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-cyber-gradient text-white rounded-lg hover:shadow-cyber transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Add Officer</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`max-w-md w-full rounded-lg p-6 ${
            isDark ? 'bg-muted-graphite border border-cyber-teal/20' : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Export Officers Data
              </h3>
              <button
                onClick={() => setShowExportModal(false)}
                className={`p-2 transition-colors ${
                  isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Choose the format to export {filteredOfficers.length} officer records:
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => handleExport('csv')}
                  className={`w-full p-4 rounded-lg border transition-all duration-200 text-left ${
                    isDark 
                      ? 'bg-crisp-black border-cyber-teal/20 hover:border-cyber-teal/40 text-white' 
                      : 'bg-gray-50 border-gray-200 hover:border-cyber-teal/40 text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Download className="w-5 h-5 text-cyber-teal" />
                    <div>
                      <p className="font-medium">CSV Format</p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Comma-separated values for spreadsheet applications
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleExport('json')}
                  className={`w-full p-4 rounded-lg border transition-all duration-200 text-left ${
                    isDark 
                      ? 'bg-crisp-black border-cyber-teal/20 hover:border-cyber-teal/40 text-white' 
                      : 'bg-gray-50 border-gray-200 hover:border-cyber-teal/40 text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Download className="w-5 h-5 text-electric-blue" />
                    <div>
                      <p className="font-medium">JSON Format</p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Structured data format for developers
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};