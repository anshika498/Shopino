import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Bell, 
  Trash2, 
  CheckCircle, 
  Sparkles, 
  ChevronRight, 
  Settings,
  AlertTriangle
} from 'lucide-react';
import { updateProfileSuccess } from '../store/slices/authSlice.js';
import API from '../utils/api.js';

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [alerts, setAlerts] = useState([]);
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profilePassword, setProfilePassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState({ text: '', type: '' });

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/alerts');
      if (data.success) {
        setAlerts(data.alerts);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setAlertMessage({ text: '', type: '' });

    try {
      const payload = { name: profileName, email: profileEmail };
      if (profilePassword) payload.password = profilePassword;

      const { data } = await API.put('/auth/profile', payload);

      if (data.success) {
        dispatch(updateProfileSuccess({ user: data, token: data.token }));
        setAlertMessage({ text: 'Profile updated successfully!', type: 'success' });
        setProfilePassword('');
      }
    } catch (error) {
      console.error(error);
      setAlertMessage({ 
        text: error.response?.data?.message || 'Failed to update profile.', 
        type: 'error' 
      });
    }
  };

  const handleDeleteAlert = async (alertId) => {
    try {
      const { data } = await API.delete(`/alerts/${alertId}`);
      if (data.success) {
        setAlerts(prev => prev.filter(a => a._id !== alertId));
      }
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left space-y-8">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
        <span className="cursor-pointer hover:text-brand-primary" onClick={() => navigate('/')}>Home</span>
        <ChevronRight size={12} />
        <span className="text-slate-650 dark:text-slate-350">User Dashboard</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black font-display text-slate-850 dark:text-slate-100">
          User Dashboard
        </h1>
        <p className="text-xs text-slate-450 font-medium">Welcome back, {user?.name}. Manage your alerts and details here.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT/CENTER COLUMN: Price drop Alerts listings */}
        <section className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border glass-card p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
              <Bell className="text-brand-primary" size={18} />
              Active Price Drop Alerts
            </h3>
            
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((n) => (
                  <div key={n} className="h-16 w-full rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse border dark:border-slate-850" />
                ))}
              </div>
            ) : alerts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 text-[10px] font-black uppercase text-slate-450 tracking-wider">
                      <th className="py-3 px-4">Product</th>
                      <th className="py-3 px-4 text-center">Alert Store</th>
                      <th className="py-3 px-4 text-right">Target Price</th>
                      <th className="py-3 px-4 text-right">Current Lowest</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/30 font-medium text-slate-700 dark:text-slate-300">
                    {alerts.map((alert) => {
                      const prod = alert.productId;
                      if (!prod) return null;
                      
                      // Calculate if triggered (current lowest <= target)
                      const isTriggered = prod.lowestPrice <= alert.targetPrice;
                      
                      return (
                        <tr key={alert._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                          
                          {/* Product link */}
                          <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-150">
                            <Link to={`/product/${prod._id}`} className="hover:text-brand-primary transition-colors flex items-center gap-2">
                              <img src={prod.image} alt={prod.name} className="w-8 h-8 rounded object-cover border bg-slate-100 dark:bg-slate-900" />
                              <span className="truncate max-w-[120px]">{prod.name}</span>
                            </Link>
                          </td>

                          {/* Store Name */}
                          <td className="py-3.5 px-4 text-center">{alert.storeName}</td>

                          {/* Target Price */}
                          <td className="py-3.5 px-4 text-right font-extrabold text-slate-850 dark:text-white">
                            ₹{alert.targetPrice.toLocaleString()}
                          </td>

                          {/* Current Price */}
                          <td className="py-3.5 px-4 text-right font-extrabold text-slate-850 dark:text-white">
                            ₹{prod.lowestPrice?.toLocaleString()}
                          </td>

                          {/* Trigger Status */}
                          <td className="py-3.5 px-4 text-center">
                            {isTriggered ? (
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold">
                                Triggered
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold">
                                Active
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleDeleteAlert(alert._id)}
                              className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                              title="Delete alert"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-450 border border-dashed rounded-2xl">
                No price alerts set. Search for products and set thresholds.
              </div>
            )}

          </div>
        </section>

        {/* RIGHT COLUMN: Profile Settings updater */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="rounded-3xl border glass-card p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-855 text-slate-850 dark:text-slate-100 flex items-center gap-2">
              <Settings className="text-brand-primary" size={18} />
              Profile Details
            </h3>

            {alertMessage.text && (
              <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                alertMessage.type === 'success' 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
              }`}>
                <span>{alertMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-350">
              
              <div>
                <label className="block text-slate-450 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1.5 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-slate-450 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1.5 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-slate-450 mb-1">Update Password (Optional)</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={profilePassword}
                  onChange={(e) => setProfilePassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 text-slate-850 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1.5 focus:ring-brand-primary"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 font-bold text-white bg-gradient-to-r from-brand-primary to-brand-secondary rounded-xl hover:shadow hover:brightness-105 active:scale-98 transition-all cursor-pointer text-center text-xs"
                >
                  Save Changes
                </button>
              </div>

            </form>
          </div>
        </aside>

      </div>

    </div>
  );
};

export default Dashboard;
