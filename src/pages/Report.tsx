import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { DatePicker, Button, Select, Table, Card, Statistic, message, Tag } from 'antd';
import { Download, FileText, Users, ShoppingBag, Calendar, UserPlus } from 'lucide-react';
import { CSVLink } from 'react-csv';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import type { RangePickerProps } from 'antd/es/date-picker';
import { toast } from 'react-toastify';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface ReportData {
    users?: any[];
    listings?: any[];
    stats?: {
        totalUsers?: number;
        newUsers?: number;
        activeListings?: number;
    };
}

const ReportPage = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState<ReportData>({});
    const [reportType, setReportType] = useState('users');
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
        dayjs().subtract(30, 'days'),
        dayjs(),
    ]);
    const [error, setError] = useState<{ message: string; details?: string } | null>(null);

    const disabledDate: RangePickerProps['disabledDate'] = (current) => {
        return current && current > dayjs().endOf('day');
    };

    const fetchUsers = useCallback(async (start: string, end: string) => {
        try {
            const { data, error: fetchError } = await supabase.rpc('get_admin_users');

            if (fetchError) throw fetchError;

            // Filtrer par date si nécessaire
            const filteredUsers = data.filter((user: any) => {
                const createdAt = new Date(user.created_at);
                return createdAt >= new Date(start) && createdAt <= new Date(end);
            });

            const formattedUsers = filteredUsers.map((user: any) => ({
                ...user,
                created_at: new Date(user.created_at),
                banned_until: user.banned_until ? new Date(user.banned_until) : undefined,
                last_sign_in_at: user.last_sign_in_at ? new Date(user.last_sign_in_at) : undefined,
                status: user.banned_until && new Date(user.banned_until) > new Date() ? 'banned' : 'active',
                seller_status: user.is_seller
                    ? (user.seller_approved ? 'approved' : 'pending')
                    : 'none'
            }));

            return formattedUsers;
        } catch (err) {
            console.error('Error fetching users:', err);
            throw err;
        }
    }, []);

    const fetchListings = useCallback(async (start: string, end: string) => {
        try {
            const { data, error: fetchError } = await supabase
                .from('listings')
                .select('*')
                .gte('created_at', start)
                .lte('created_at', end)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            // Récupérer les informations utilisateur pour chaque annonce
            const userIds = [...new Set(data.map((listing: any) => listing.user_id))];
            const { data: usersData, error: usersError } = await supabase
                .from('profiles')
                .select('user_id, username')
                .in('user_id', userIds);

            if (usersError) throw usersError;

            const listingsWithUsers = data.map((listing: any) => {
                const user = usersData.find((u: any) => u.user_id === listing.user_id);
                return {
                    ...listing,
                    username: user?.username || 'Unknown',
                    created_at: new Date(listing.created_at),
                    updated_at: new Date(listing.updated_at),
                };
            });

            return listingsWithUsers;
        } catch (err) {
            console.error('Error fetching listings:', err);
            throw err;
        }
    }, []);

    const fetchReportData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [startDate, endDate] = dateRange;
            const start = startDate.format('YYYY-MM-DD');
            const end = endDate.format('YYYY-MM-DD');

            let data: ReportData = {};

            // Fetch statistics
            const [
                { count: totalUsers },
                { count: newUsers },
                { count: activeListings },
            ] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('profiles').select('*', { count: 'exact', head: true })
                    .gte('created_at', start)
                    .lte('created_at', end),
                supabase.from('listings').select('*', { count: 'exact', head: true })
                    .eq('status', 'active'),
            ]);

            data.stats = {
                totalUsers: totalUsers || 0,
                newUsers: newUsers || 0,
                activeListings: activeListings || 0,
            };

            // Fetch detailed data based on report type
            if (reportType === 'users') {
                data.users = await fetchUsers(start, end);
            } else if (reportType === 'listings') {
                data.listings = await fetchListings(start, end);
            }

            setReportData(data);

        } catch (err) {
            console.error('Error fetching report data:', err);
            setError({
                message: 'Failed to load data',
                details: err instanceof Error ? err.message : undefined
            });
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReportData();
    }, [reportType, dateRange, fetchUsers, fetchListings]);

    const columns = {
        users: [
            {
                title: 'Username',
                dataIndex: 'username',
                key: 'username',
            },
            {
                title: 'Email',
                dataIndex: 'email',
                key: 'email',
            },
            {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: (status: string) => (
                    <Tag color={status === 'banned' ? 'red' : 'green'}>
                        {status === 'banned' ? 'Banned' : 'Active'}
                    </Tag>
                ),
            },
            {
                title: 'Seller Status',
                dataIndex: 'seller_status',
                key: 'seller_status',
                render: (status: string) => {
                    let color = 'default';
                    if (status === 'approved') color = 'green';
                    if (status === 'pending') color = 'orange';
                    return <Tag color={color}>{status}</Tag>;
                },
            },
            {
                title: 'Registration Date',
                dataIndex: 'created_at',
                key: 'created_at',
                render: (date: Date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
            },
        ],
        listings: [
            {
                title: 'Title',
                dataIndex: 'title',
                key: 'title',
            },
            {
                title: 'User',
                dataIndex: 'username',
                key: 'username',
            },
            {
                title: 'Price',
                dataIndex: 'price',
                key: 'price',
                render: (price: number) => `${price} €`,
            },
            {
                title: 'Category',
                dataIndex: 'category',
                key: 'category',
            },
            {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: (status: string) => (
                    <Tag color={status === 'active' ? 'green' : 'red'}>
                        {status}
                    </Tag>
                ),
            },
            {
                title: 'Creation Date',
                dataIndex: 'created_at',
                key: 'created_at',
                render: (date: Date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
            },
        ],
    };

    const getCSVData = () => {
        if (!reportData) return [];

        switch (reportType) {
            case 'users':
                return reportData.users?.map(user => ({
                    Username: user.username,
                    Email: user.email,
                    Status: user.status,
                    'Seller Status': user.seller_status,
                    'Registration Date': dayjs(user.created_at).format('DD/MM/YYYY HH:mm'),
                    'Last Sign In': user.last_sign_in_at ? dayjs(user.last_sign_in_at).format('DD/MM/YYYY HH:mm') : 'Never',
                    'Banned Until': user.banned_until ? dayjs(user.banned_until).format('DD/MM/YYYY HH:mm') : 'Not banned',
                })) || [];

            case 'listings':
                return reportData.listings?.map(listing => ({
                    Title: listing.title,
                    User: listing.username,
                    Price: listing.price,
                    Category: listing.category,
                    Subcategory: listing.subcategory,
                    Status: listing.status,
                    'Creation Date': dayjs(listing.created_at).format('DD/MM/YYYY HH:mm'),
                    City: listing.city,
                    Region: listing.region,
                })) || [];

            default:
                return [];
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <FileText className="text-blue-500" /> Admin Reports
                </h1>
                <div className="flex items-center gap-4">
                    <Select
                        value={reportType}
                        onChange={setReportType}
                        className="w-40"
                    >
                        <Option value="users">
                            <div className="flex items-center gap-2">
                                <Users size={16} /> Users
                            </div>
                        </Option>
                        <Option value="listings">
                            <div className="flex items-center gap-2">
                                <ShoppingBag size={16} /> Listings
                            </div>
                        </Option>
                    </Select>

                    <RangePicker
                        value={dateRange}
                        onChange={(dates) => dates && setDateRange(dates)}
                        disabledDate={disabledDate}
                        className="w-64"
                        presets={[
                            { label: 'Last 7 days', value: [dayjs().subtract(7, 'days'), dayjs()] },
                            { label: 'Last 30 days', value: [dayjs().subtract(30, 'days'), dayjs()] },
                            { label: 'This month', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
                            { label: 'Last month', value: [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')] },
                        ]}
                        suffixIcon={<Calendar size={16} />}
                    />

                    <CSVLink
                        data={getCSVData()}
                        filename={`admin-report-${reportType}-${dayjs().format('YYYY-MM-DD')}.csv`}
                    >
                        <Button type="primary" icon={<Download size={16} />}>
                            Export CSV
                        </Button>
                    </CSVLink>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
                    <p className="font-semibold">{error.message}</p>
                    {error.details && <p className="text-sm">{error.details}</p>}
                    <Button className="mt-2" onClick={fetchReportData}>Retry</Button>
                </div>
            )}

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                    <Statistic
                        title="Total Users"
                        value={reportData.stats?.totalUsers || 0}
                        prefix={<Users className="text-blue-500" />}
                    />
                </Card>
                <Card>
                    <Statistic
                        title="New Users"
                        value={reportData.stats?.newUsers || 0}
                        prefix={<UserPlus className="text-green-500" />}
                    />
                </Card>
                <Card>
                    <Statistic
                        title="Active Listings"
                        value={reportData.stats?.activeListings || 0}
                        prefix={<ShoppingBag className="text-orange-500" />}
                    />
                </Card>
            </div>

            {/* Data Table */}
            <Card
                loading={loading}
                title={`Recent ${reportType === 'users' ? 'Users' : 'Listings'}`}
            >
                <Table
                    columns={columns[reportType as keyof typeof columns]}
                    dataSource={reportType === 'users' ? reportData.users : reportData.listings}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: true }}
                    locale={{ emptyText: 'No data available' }}
                />
            </Card>
        </div>
    );
};

export default ReportPage;