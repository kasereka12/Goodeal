import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Search,
  User,
  Shield,
  Ban,
  Loader2,
  Check,
  X,
  Phone,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  Plus
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';

interface User {
  user_id: string;
  email: string;
  username: string;
  phone?: string;
  role: 'admin' | 'authenticated';
  status: 'active' | 'banned';
  is_seller: boolean;
  seller_approved: boolean;
  seller_status: 'approved' | 'pending' | 'none';
  created_at: Date;
  banned_until?: Date;
  last_sign_in_at?: Date;
}

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  // États
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; details?: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    sellerStatus: 'all'
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'created_at',
    direction: 'desc' as 'asc' | 'desc'
  });
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    username: '',
    phone: '',
    role: 'authenticated' as 'admin' | 'authenticated',
    is_seller: false
  });
  const [addingUser, setAddingUser] = useState(false);

  // Vérification des permissions admin
  useEffect(() => {
    if (currentUser?.user_metadata?.role !== 'admin') {
      navigate('/unauthorized', { replace: true });
    } else {
      fetchUsers();
    }
  }, [currentUser, navigate]);

  // Récupération des utilisateurs
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc('get_admin_users');

      if (error) throw error;

      const formattedUsers = data.map((user: any) => ({
        ...user,
        created_at: new Date(user.created_at),
        banned_until: user.banned_until ? new Date(user.banned_until) : undefined,
        last_sign_in_at: user.last_sign_in_at ? new Date(user.last_sign_in_at) : undefined,
        status: user.banned_until && new Date(user.banned_until) > new Date() ? 'banned' : 'active',
        seller_status: user.is_seller
          ? (user.seller_approved ? 'approved' : 'pending')
          : 'none'
      }));

      setUsers(formattedUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError({
        message: 'Failed to load users',
        details: err instanceof Error ? err.message : undefined
      });
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  // Création d'un utilisateur
  const createUser = useCallback(async () => {
    try {
      setAddingUser(true);

      // 1. Créer l'utilisateur d'authentification
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newUser.email,
        password: newUser.password,
        email_confirm: true,
        user_metadata: {
          role: newUser.role,
          username: newUser.username
        }
      });

      if (authError) throw authError;

      // 2. Mettre à jour le profil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          username: newUser.username,
          phone: newUser.phone,
          is_seller: newUser.is_seller,
          seller_approved: newUser.is_seller, // Auto-approve si admin crée
          show_phone: !!newUser.phone
        })
        .eq('user_id', authData.user.id);

      if (profileError) throw profileError;

      toast.success('User created successfully');
      setShowAddUserModal(false);
      setNewUser({
        email: '',
        password: '',
        username: '',
        phone: '',
        role: 'authenticated',
        is_seller: false
      });

      // 3. Rafraîchir la liste
      await fetchUsers();
    } catch (err) {
      console.error('Error creating user:', err);
      toast.error(`Failed to create user: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setAddingUser(false);
    }
  }, [newUser, fetchUsers]);

  // Mise à jour du statut utilisateur
  const updateUserStatus = useCallback(async (action: 'ban' | 'role' | 'seller', userId: string, value: any) => {
    try {
      if (!userId) throw new Error('Invalid user ID');

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
        default:
          throw new Error('Invalid action');
      }

      if (error) throw error;

      // Mise à jour optimiste
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
              seller_status: value ? 'approved' : 'pending',
              seller_approved: value
            })
          };
        }
        return user;
      }));

      toast.success(`User ${action} updated successfully`);
    } catch (err) {
      console.error(`Error updating ${action}:`, err);
      toast.error(`Failed to update user: ${err instanceof Error ? err.message : 'Unknown error'}`);
      await fetchUsers();
    }
  }, [fetchUsers]);

  // Tri des utilisateurs
  const requestSort = useCallback((key: keyof User) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // Filtrage et tri
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
        (filters.sellerStatus === 'approved' && user.seller_status === 'approved') ||
        (filters.sellerStatus === 'pending' && user.seller_status === 'pending');

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

  // Gestion des filtres
  const updateFilter = useCallback((filterName: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  }, []);

  // Gestion des changements du formulaire
  const handleNewUserChange = useCallback((field: keyof typeof newUser, value: any) => {
    setNewUser(prev => ({ ...prev, [field]: value }));
  }, []);

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <h3 className="font-medium">Error Loading Users</h3>
          </div>
          <p className="mt-1 text-sm">{error.message}</p>
          {error.details && (
            <p className="mt-1 text-xs opacity-75">{error.details}</p>
          )}
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header et filtres */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                {filteredAndSortedUsers.length} {filteredAndSortedUsers.length === 1 ? 'user' : 'users'} found
              </p>
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <button
                onClick={() => setShowAddUserModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </button>
            </div>
          </div>

          {/* Filtres */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md sm:text-sm"
              value={filters.role}
              onChange={(e) => updateFilter('role', e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins</option>
              <option value="authenticated">Users</option>
            </select>

            <select
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md sm:text-sm"
              value={filters.status}
              onChange={(e) => updateFilter('status', e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
            </select>

            <select
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md sm:text-sm"
              value={filters.sellerStatus}
              onChange={(e) => updateFilter('sellerStatus', e.target.value)}
            >
              <option value="all">All Seller Types</option>
              <option value="seller">Sellers</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Tableau des utilisateurs */}
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
                />
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seller
                </th>
                <TableHeader
                  label="Joined"
                  sortKey="created_at"
                  sortConfig={sortConfig}
                  onClick={requestSort}
                />
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedUsers.map((user) => (
                <UserRow
                  key={user.user_id}
                  user={user}
                  onUpdateStatus={updateUserStatus}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal d'ajout d'utilisateur */}
      <AddUserModal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        newUser={newUser}
        onChange={handleNewUserChange}
        onSubmit={createUser}
        isLoading={addingUser}
      />
    </div>
  );
};

// Composant TableHeader pour gérer le tri
const TableHeader: React.FC<{
  label: string;
  sortKey: keyof User;
  sortConfig: { key: string; direction: 'asc' | 'desc' };
  onClick: (key: keyof User) => void;
}> = ({ label, sortKey, sortConfig, onClick }) => (
  <th
    scope="col"
    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
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

// Composant UserRow pour afficher une ligne d'utilisateur
const UserRow: React.FC<{
  user: User;
  onUpdateStatus: (action: 'ban' | 'role' | 'seller', userId: string, value: any) => void;
}> = ({ user, onUpdateStatus }) => (
  <tr key={user.user_id} className="hover:bg-gray-50">
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center">
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
          <User className="h-6 w-6 text-gray-400" />
        </div>
        <div className="ml-4">
          <div className="text-sm font-medium text-gray-900">
            {user.username || 'No username'}
          </div>
          <div className="text-sm text-gray-500">
            {user.user_id.slice(0, 8)}...
          </div>
        </div>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="text-sm text-gray-900">{user.email}</div>
      {user.phone && (
        <div className="flex items-center text-sm text-gray-500 mt-1">
          <Phone className="h-4 w-4 mr-1" />
          {user.phone}
        </div>
      )}
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
        }`}>
        {user.role === 'admin' ? 'Admin' : 'User'}
      </span>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
        {user.status === 'active' ? 'Active' : 'Banned'}
      </span>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.seller_status === 'approved' ? 'bg-green-100 text-green-800' :
          user.seller_status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
        }`}>
        {user.seller_status === 'approved' ? 'Approved' :
          user.seller_status === 'pending' ? 'Pending' : 'Not seller'}
      </span>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      {user.created_at.toLocaleDateString()}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-1">
      {user.role !== 'admin' && (
        <button
          onClick={() => onUpdateStatus('role', user.user_id, 'admin')}
          className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
          title="Make admin"
        >
          <Shield className="h-4 w-4" />
        </button>
      )}

      <button
        onClick={() => onUpdateStatus('ban', user.user_id, user.status !== 'banned')}
        className={`p-1 rounded ${user.status === 'banned'
            ? 'text-green-600 hover:text-green-900 hover:bg-green-50'
            : 'text-red-600 hover:text-red-900 hover:bg-red-50'
          }`}
        title={user.status === 'banned' ? 'Unban' : 'Ban'}
      >
        <Ban className="h-4 w-4" />
      </button>

      {user.is_seller && !user.seller_approved && (
        <button
          onClick={() => onUpdateStatus('seller', user.user_id, true)}
          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
          title="Approve seller"
        >
          <Check className="h-4 w-4" />
        </button>
      )}

      {user.is_seller && user.seller_approved && (
        <button
          onClick={() => onUpdateStatus('seller', user.user_id, false)}
          className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50"
          title="Revoke approval"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </td>
  </tr>
);

// Composant AddUserModal
const AddUserModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  newUser: {
    email: string;
    password: string;
    username: string;
    phone: string;
    role: 'admin' | 'authenticated';
    is_seller: boolean;
  };
  onChange: (field: string, value: any) => void;
  onSubmit: () => void;
  isLoading: boolean;
}> = ({ isOpen, onClose, newUser, onChange, onSubmit, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Add New User</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email*</label>
            <input
              type="email"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={newUser.email}
              onChange={(e) => onChange('email', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password*</label>
            <input
              type="password"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={newUser.password}
              onChange={(e) => onChange('password', e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Username*</label>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={newUser.username}
              onChange={(e) => onChange('username', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={newUser.phone}
              onChange={(e) => onChange('phone', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={newUser.role}
              onChange={(e) => onChange('role', e.target.value as 'admin' | 'authenticated')}
            >
              <option value="authenticated">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              id="is_seller"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={newUser.is_seller}
              onChange={(e) => onChange('is_seller', e.target.checked)}
            />
            <label htmlFor="is_seller" className="ml-2 block text-sm text-gray-700">
              Is Seller
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            onClick={onSubmit}
            disabled={isLoading || !newUser.email || !newUser.password || !newUser.username}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2 inline" />
                Adding...
              </>
            ) : 'Add User'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;