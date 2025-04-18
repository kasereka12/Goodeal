import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Search, User, Shield, Ban, Loader2, Check, X, Phone,
  ChevronUp, ChevronDown, AlertCircle, Plus, Mail, Key, Trash2, Crown
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';
import { SellerType } from '../../lib/auth';

interface SignUpParams {
  email: string;
  password: string;
  username: string;
  wantsToSell?: boolean;
  sellerType?: SellerType;
  phone?: string;
  whatsapp?: string;
  companyName?: string;
  is_super_admin?: boolean;
}

async function signUp({
  email,
  password,
  username,
  wantsToSell = false,
  sellerType = 'particular',
  phone = '',
  whatsapp = '',
  companyName = '',
  is_super_admin = false
}: SignUpParams) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          is_seller: wantsToSell,
          seller_type: wantsToSell ? sellerType : null,
          phone: wantsToSell ? phone : null,
          whatsapp: wantsToSell ? whatsapp : null,
          company_name: wantsToSell && sellerType === 'professional' ? companyName : null,
          seller_approved: false,
          email,
          last_sign_in_at: new Date().toISOString(),
          banned_until: null,
          is_super_admin
        }
      }
    });

    if (error) throw error;
    return {
      user: data.user,
      session: data.session,
      isSeller: wantsToSell,
      needsApproval: wantsToSell
    };
  } catch (error: any) {
    throw new Error(error.message || 'Registration failed');
  }
}

interface UserProfile {
  user_id: string;
  email: string;
  username: string;
  phone?: string;
  role: 'admin' | 'authenticated';
  status: 'active' | 'banned';
  is_seller: boolean;
  seller_approved: boolean;
  created_at: Date;
  banned_until?: Date;
  last_sign_in_at?: Date;
  company_name?: string;
  raw_user_meta_data?: {
    is_super_admin?: boolean;
  };
}

const UserRow = ({
  user,
  updateUserStatus,
  onDeleteClick,
  currentUser
}: {
  user: UserProfile,
  updateUserStatus: (action: 'ban' | 'role' | 'seller', userId: string, value: any) => void,
  onDeleteClick: (userId: string) => void,
  currentUser: any
}) => {
  const navigate = useNavigate();
  const isSuperAdmin = user.raw_user_meta_data?.is_super_admin;
  const isCurrentUserSuperAdmin = currentUser?.user_metadata?.is_super_admin;

  const handleRowClick = (e: React.MouseEvent, userId: string) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    navigate(`/admin/profils/${userId}`);
  };

  return (
    <tr
      key={user.user_id}
      className={`hover:bg-gray-50 cursor-pointer ${isSuperAdmin ? 'bg-blue-50' : ''}`}
      onClick={(e) => handleRowClick(e, user.user_id)}
    >
      <td className="px-3 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
            {isSuperAdmin ? (
              <Crown className="h-4 w-4 text-yellow-500 fill-yellow-300" />
            ) : (
              <User className="h-4 w-4 text-gray-400" />
            )}
          </div>
          <div className="ml-2">
            <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
              {user.username || 'No username'}
              {isSuperAdmin && (
                <span className="ml-1 text-yellow-600" title="Super Admin">★</span>
              )}
            </div>
            <div className="text-xs text-gray-500 truncate max-w-[120px]">
              {user.user_id.slice(0, 8)}...
            </div>
          </div>
        </div>
      </td>
      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell truncate max-w-[180px]">
        {user.email}
      </td>
      <td className="px-3 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ?
          (isSuperAdmin ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800')
          : 'bg-gray-100 text-gray-800'
          }`}>
          {isSuperAdmin ? 'Super Admin' : user.role === 'admin' ? 'Admin' : 'User'}
        </span>
      </td>
      <td className="px-3 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
          {user.status === 'active' ? 'Active' : 'Banned'}
        </span>
      </td>
      <td className="px-3 py-4 whitespace-nowrap hidden lg:table-cell">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_seller
          ? (user.seller_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800')
          : 'bg-gray-100 text-gray-800'
          }`}>
          {user.is_seller
            ? (user.seller_approved ? 'Approved' : 'Pending')
            : 'None'}
        </span>
      </td>
      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 hidden xl:table-cell">
        {user.created_at.toLocaleDateString()}
      </td>
      <td
        className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium space-x-1"
        onClick={(e) => e.stopPropagation()}
      >
        {!isSuperAdmin ? (
          <>
            {user.role !== 'admin' ? (
              <button
                onClick={() => updateUserStatus('role', user.user_id, 'admin')}
                className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                title="Make admin"
              >
                <Shield className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => updateUserStatus('role', user.user_id, 'authenticated')}
                className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50"
                title="Remove admin"
              >
                <User className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => updateUserStatus('ban', user.user_id, user.status !== 'banned')}
              className={`p-1 rounded ${user.status === 'banned'
                ? 'text-green-600 hover:text-green-900 hover:bg-green-50'
                : 'text-red-600 hover:text-red-900 hover:bg-red-50'
                }`}
              title={user.status === 'banned' ? 'Unban' : 'Ban'}
            >
              <Ban className="h-4 w-4" />
            </button>
            {user.is_seller && (
              <button
                onClick={() => updateUserStatus('seller', user.user_id, !user.seller_approved)}
                className={`p-1 rounded ${user.seller_approved
                  ? 'text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50'
                  : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                  }`}
                title={user.seller_approved ? 'Revoke approval' : 'Approve seller'}
              >
                {user.seller_approved ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteClick(user.user_id);
              }}
              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
              title="Delete user"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </>
        ) : (
          <span className="text-xs text-blue-600" title="Super Admin - Protected account">
            <Crown className="h-4 w-4 inline mr-1 text-yellow-500" />
            Protected
          </span>
        )}
      </td>
    </tr>
  );
};

const TableHeader: React.FC<{
  label: string;
  sortKey: keyof UserProfile;
  sortConfig: { key: string; direction: 'asc' | 'desc' };
  onClick: (key: keyof UserProfile) => void;
  className?: string;
}> = ({ label, sortKey, sortConfig, onClick, className }) => (
  <th
    scope="col"
    className={`px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 ${className || ''}`}
    onClick={() => onClick(sortKey)}
  >
    <div className="flex items-center">
      {label}
      {sortConfig.key === sortKey ? (
        sortConfig.direction === 'asc' ? (
          <ChevronUp className="ml-1 h-4 w-4" />
        ) : (
          <ChevronDown className="ml-1 h-4 w-4" />
        )
      ) : (
        <span className="ml-1 text-gray-300">
          <ChevronUp className="h-4 w-4" />
        </span>
      )}
    </div>
  </th>
);

const DeleteConfirmationModal = ({
  username,
  onConfirm,
  onCancel
}: {
  username: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-md w-full">
      <h3 className="text-lg font-medium mb-4">Confirm Deletion</h3>
      <p className="mb-6">
        Are you sure you want to delete {username || 'this user'}? This action cannot be undone.
      </p>
      <div className="flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    sellerStatus: 'all'
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'created_at' as keyof UserProfile,
    direction: 'desc' as 'asc' | 'desc'
  });
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    username: '',
    phone: '',
    role: 'authenticated' as 'admin' | 'authenticated',
    is_seller: false,
    companyName: '',
    is_super_admin: false
  });
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    userId: null as string | null,
    username: null as string | null
  });

  useEffect(() => {
    if (currentUser?.user_metadata?.role !== 'admin' && !currentUser?.user_metadata?.is_super_admin) {
      navigate('/unauthorized', { replace: true });
    } else {
      fetchUsers();
    }
  }, [currentUser, navigate]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc('get_admin_users');

      const filteredData = data.filter((user: any) => user.user_id !== currentUser.id);
      console.log('Filtered Data:', filteredData);


      if (error) throw error;

      const formattedUsers = filteredData.map((user: any) => ({
        ...user,
        created_at: new Date(user.created_at),
        banned_until: user.banned_until ? new Date(user.banned_until) : undefined,
        last_sign_in_at: user.last_sign_in_at ? new Date(user.last_sign_in_at) : undefined,
        status: user.banned_until && new Date(user.banned_until) > new Date() ? 'banned' : 'active'
      }));

      setUsers(formattedUsers);
    } catch (err) {
      setError('Failed to load users. Please try again.');
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async () => {
    try {
      if (newUser.is_super_admin && !currentUser?.user_metadata?.is_super_admin) {
        toast.error('Only Super Admin can create another Super Admin');
        return;
      }

      const { user, session, isSeller, needsApproval } = await signUp({
        email: newUser.email,
        password: newUser.password,
        username: newUser.username,
        wantsToSell: newUser.is_seller,
        sellerType: 'particular',
        phone: newUser.phone,
        whatsapp: '',
        companyName: newUser.companyName,
        is_super_admin: newUser.is_super_admin
      });

      toast.success('User created successfully');
      setShowAddUserModal(false);
      setNewUser({
        email: '',
        password: '',
        username: '',
        phone: '',
        role: 'authenticated',
        is_seller: false,
        companyName: '',
        is_super_admin: false
      });

      await fetchUsers();
    } catch (err) {
      console.error('Error creating user:', err);
      toast.error(`Failed to create user: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [newUser, fetchUsers, currentUser]);

  const updateUserStatus = useCallback(async (action: 'ban' | 'role' | 'seller', userId: string, value: any) => {
    try {
      const targetUser = users.find(u => u.user_id === userId);
      if (targetUser?.raw_user_meta_data?.is_super_admin) {
        toast.error('Cannot modify Super Admin account');
        return;
      }

      let error;

      switch (action) {
        case 'ban':
          ({ error } = await supabase.rpc('update_user_ban_status', {
            user_id: userId,
            is_banned: value
          }));
          break;
        case 'role':
          ({ error } = await supabase.rpc('update_user_role', {
            user_id: userId,
            new_role: value
          }));
          break;
        case 'seller':
          ({ error } = await supabase.rpc('update_seller_status', {
            p_user_id: userId,
            p_is_approved: value
          }));
          break;
      }

      if (error) throw error;

      setUsers(prev => prev.map(user => {
        if (user.user_id === userId) {
          return {
            ...user,
            ...(action === 'ban' && {
              status: value ? 'banned' : 'active',
              banned_until: value ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined
            }),
            ...(action === 'role' && { role: value }),
            ...(action === 'seller' && {
              seller_approved: value
            })
          };
        }
        return user;
      }));

      toast.success(`User updated successfully`);
    } catch (err) {
      console.error(`Error updating user:`, err);
      toast.error(`Failed to update user: ${err instanceof Error ? err.message : 'Unknown error'}`);
      fetchUsers();
    }
  }, [fetchUsers, users]);

  const deleteUser = useCallback(async (userId: string) => {
    try {
      const targetUser = users.find(u => u.user_id === userId);
      if (targetUser?.raw_user_meta_data?.is_super_admin) {
        toast.error('Cannot delete Super Admin account');
        return;
      }

      const { error } = await supabase.rpc('delete_user_account', {
        p_user_id: userId
      });

      if (error) throw error;

      setUsers(prev => prev.filter(user => user.user_id !== userId));
      toast.success('User deleted successfully');
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error(`Failed to delete user: ${err instanceof Error ? err.message : 'Unknown error'}`);
      fetchUsers();
    } finally {
      setDeleteModal({ show: false, userId: null, username: null });
    }
  }, [fetchUsers, users]);

  const handleDeleteClick = (userId: string) => {
    const user = users.find(u => u.user_id === userId);
    setDeleteModal({
      show: true,
      userId,
      username: user?.username || null
    });
  };

  const requestSort = useCallback((key: keyof UserProfile) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const filteredAndSortedUsers = useMemo(() => {
    const filtered = users.filter(user => {
      const matchesSearch =
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole =
        filters.role === 'all' || user.role === filters.role;

      const matchesStatus =
        filters.status === 'all' || user.status === filters.status;

      const matchesSellerStatus =
        filters.sellerStatus === 'all' ||
        (filters.sellerStatus === 'seller' && user.is_seller) ||
        (filters.sellerStatus === 'approved' && user.seller_approved) ||
        (filters.sellerStatus === 'pending' && user.is_seller && !user.seller_approved);

      return matchesSearch && matchesRole && matchesStatus && matchesSellerStatus;
    });

    return [...filtered].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue instanceof Date && bValue instanceof Date) {
        return sortConfig.direction === 'asc'
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });
  }, [users, searchTerm, filters, sortConfig]);

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <h3 className="font-medium">Error Loading Users</h3>
          </div>
          <p className="mt-1 text-sm">{error}</p>
          <button
            onClick={fetchUsers}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 lg:px-8 py-4">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">User Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                {filteredAndSortedUsers.length} {filteredAndSortedUsers.length === 1 ? 'user' : 'users'} found
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {currentUser?.user_metadata?.is_super_admin && (
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                  <span>Add User</span>
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              className="block w-full pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins</option>
              <option value="authenticated">Users</option>
            </select>

            <select
              className="block w-full pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
            </select>

            <select
              className="block w-full pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={filters.sellerStatus}
              onChange={(e) => setFilters({ ...filters, sellerStatus: e.target.value })}
            >
              <option value="all">All Seller Types</option>
              <option value="seller">Sellers</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <TableHeader
                  label="User"
                  sortKey="username"
                  sortConfig={sortConfig}
                  onClick={requestSort}
                />
                <TableHeader
                  label="Email"
                  sortKey="email"
                  sortConfig={sortConfig}
                  onClick={requestSort}
                  className="hidden md:table-cell"
                />
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Seller
                </th>
                <TableHeader
                  label="Joined"
                  sortKey="created_at"
                  sortConfig={sortConfig}
                  onClick={requestSort}
                  className="hidden xl:table-cell"
                />
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedUsers.map((user) => (
                <UserRow
                  key={user.user_id}
                  user={user}
                  updateUserStatus={updateUserStatus}
                  onDeleteClick={handleDeleteClick}
                  currentUser={currentUser}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddUserModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Add New User</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={newUser.phone}
                      onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    />
                  </div>
                </div>

                {currentUser?.user_metadata?.is_super_admin && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_super_admin"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={newUser.is_super_admin}
                      onChange={(e) => setNewUser({ ...newUser, is_super_admin: e.target.checked })}
                    />
                    <label htmlFor="is_super_admin" className="text-sm text-gray-700">
                      Super Admin
                    </label>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-end">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={newUser.is_seller}
                        onChange={(e) => setNewUser({ ...newUser, is_seller: e.target.checked })}
                      />
                      <span className="text-sm text-gray-700">Is Seller</span>
                    </label>
                  </div>
                </div>
                {newUser.is_seller && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <input
                      type="text"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={newUser.companyName}
                      onChange={(e) => setNewUser({ ...newUser, companyName: e.target.value })}
                    />
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => setShowAddUserModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  onClick={createUser}
                  disabled={!newUser.email || !newUser.password || !newUser.username}
                >
                  Add User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteModal.show && (
        <DeleteConfirmationModal
          username={deleteModal.username || 'this user'}
          onConfirm={() => deleteModal.userId && deleteUser(deleteModal.userId)}
          onCancel={() => setDeleteModal({ show: false, userId: null, username: null })}
        />
      )}
    </div>
  );
};

export default UserManagement;