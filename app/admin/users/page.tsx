import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Order from '@/models/Order';

export default async function AdminUsersPage() {
    await connectDB();

    const users = await User.find().sort({ createdAt: -1 }).lean();
    const orders = await Order.find().lean();

    // Calculate stats for each user
    const usersWithStats = users.map(user => {
        const userOrders = orders.filter(order => order.userId === user._id.toString());
        const totalSpent = userOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        return {
            ...user,
            totalOrders: userOrders.length,
            totalSpent,
        };
    });

    return (
        <div>
            <h1 style={{ marginBottom: '2rem' }}>Users Management</h1>

            {/* Stats */}
            <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
                <div className="glass-card">
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        Total Users
                    </p>
                    <h2 style={{ fontSize: '2rem' }} className="text-gradient">
                        {users.length}
                    </h2>
                </div>
                <div className="glass-card">
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        Admin Users
                    </p>
                    <h2 style={{ fontSize: '2rem' }} className="text-gradient">
                        {users.filter(u => u.role === 'admin').length}
                    </h2>
                </div>
                <div className="glass-card">
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        Regular Users
                    </p>
                    <h2 style={{ fontSize: '2rem' }} className="text-gradient">
                        {users.filter(u => u.role === 'user').length}
                    </h2>
                </div>
            </div>

            {/* Users Table */}
            <div className="glass-card">
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <th style={{
                                    padding: '1rem',
                                    textAlign: 'left',
                                    color: 'var(--text-secondary)',
                                    fontWeight: 600,
                                }}>User</th>
                                <th style={{
                                    padding: '1rem',
                                    textAlign: 'left',
                                    color: 'var(--text-secondary)',
                                    fontWeight: 600,
                                }}>Email</th>
                                <th style={{
                                    padding: '1rem',
                                    textAlign: 'left',
                                    color: 'var(--text-secondary)',
                                    fontWeight: 600,
                                }}>Role</th>
                                <th style={{
                                    padding: '1rem',
                                    textAlign: 'left',
                                    color: 'var(--text-secondary)',
                                    fontWeight: 600,
                                }}>Total Orders</th>
                                <th style={{
                                    padding: '1rem',
                                    textAlign: 'left',
                                    color: 'var(--text-secondary)',
                                    fontWeight: 600,
                                }}>Total Spent</th>
                                <th style={{
                                    padding: '1rem',
                                    textAlign: 'left',
                                    color: 'var(--text-secondary)',
                                    fontWeight: 600,
                                }}>Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usersWithStats.map((user: any) => (
                                <tr key={user._id.toString()} style={{
                                    borderBottom: '1px solid var(--glass-border)',
                                }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            {user.image && (
                                                <img
                                                    src={user.image}
                                                    alt={user.name}
                                                    style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '50%',
                                                        border: '2px solid var(--primary-start)',
                                                    }}
                                                />
                                            )}
                                            <span style={{ fontWeight: 600 }}>{user.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                                        {user.email}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span className={`badge ${user.role === 'admin' ? 'badge-warning' : 'badge-success'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', fontWeight: 600 }}>
                                        {user.totalOrders}
                                    </td>
                                    <td style={{ padding: '1rem', fontWeight: 600 }}>
                                        ₹{user.totalSpent.toLocaleString()}
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
