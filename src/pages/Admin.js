import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function Admin({ user }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [members, setMembers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [inbodyResults, setInbodyResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalMembers: 0, activeMembers: 0, totalRevenue: 0, classesCount: 0 });
  const [revenueChart, setRevenueChart] = useState([]);
  // eslint-disable-next-line no-unused-vars
const [upcomingBirthdays, setUpcomingBirthdays] = useState([]);

  const [newClass, setNewClass] = useState({ name: '', instructor: '', schedule: '', total_spots: 20, class_type: '', duration_minutes: 60, location: 'Main Hall' });
  const [newPayment, setNewPayment] = useState({ user_id: '', amount: '', payment_method: 'Vodafone Cash', notes: '', status: 'confirmed' });
  const [newInbody, setNewInbody] = useState({ user_id: '', test_date: '', weight: '', muscle_mass: '', body_fat: '', bmi: '', notes: '' });
  const [editMember, setEditMember] = useState(null);

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAll = async () => {
    setLoading(true);

    const { data: membersData } = await supabase.from('profiles').select('*').order('full_name');
    setMembers(membersData || []);

    const { data: classesData } = await supabase.from('classes').select('*').order('schedule');
    setClasses(classesData || []);

    const { data: paymentsData } = await supabase.from('payments').select('*, profiles(full_name, email)').order('payment_date', { ascending: false });
    setPayments(paymentsData || []);

    const { data: inbodyData } = await supabase.from('inbody_results').select('*, profiles(full_name)').order('test_date', { ascending: false });
    setInbodyResults(inbodyData || []);

    const totalRevenue = (paymentsData || []).filter(p => p.status === 'confirmed').reduce((sum, p) => sum + (p.amount || 0), 0);
    const activeMembers = (membersData || []).filter(m => m.subscription_end && new Date(m.subscription_end) > new Date()).length;

    setStats({
      totalMembers: (membersData || []).length,
      activeMembers,
      totalRevenue,
      classesCount: (classesData || []).length
    });

    // Build monthly revenue chart
    const monthlyRevenue = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    ;(paymentsData || []).filter(p => p.status === 'confirmed').forEach(p => {
      const month = months[new Date(p.payment_date).getMonth()];
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (p.amount || 0);
    });
    const chartData = months.filter(m => monthlyRevenue[m]).map(m => ({ month: m, Revenue: monthlyRevenue[m] }));
    setRevenueChart(chartData);

    setLoading(false);
  };

  const addClass = async (e) => {
    e.preventDefault();
    await supabase.from('classes').insert({ ...newClass, booked_spots: 0 });
    setNewClass({ name: '', instructor: '', schedule: '', total_spots: 20, class_type: '', duration_minutes: 60, location: 'Main Hall' });
    fetchAll();
    alert('Class added!');
  };

  const deleteClass = async (id) => {
    if (!window.confirm('Delete this class?')) return;
    await supabase.from('classes').delete().eq('id', id);
    fetchAll();
  };

  const addPayment = async (e) => {
    e.preventDefault();
    await supabase.from('payments').insert({ ...newPayment, amount: parseFloat(newPayment.amount) });
    setNewPayment({ user_id: '', amount: '', payment_method: 'Vodafone Cash', notes: '', status: 'confirmed' });
    fetchAll();
    alert('Payment recorded!');
  };

  const addInbody = async (e) => {
    e.preventDefault();
    await supabase.from('inbody_results').insert({
      ...newInbody,
      weight: parseFloat(newInbody.weight),
      muscle_mass: parseFloat(newInbody.muscle_mass),
      body_fat: parseFloat(newInbody.body_fat),
      bmi: parseFloat(newInbody.bmi),
    });
    setNewInbody({ user_id: '', test_date: '', weight: '', muscle_mass: '', body_fat: '', bmi: '', notes: '' });
    fetchAll();
    alert('InBody result added!');
  };

  const updateMember = async (e) => {
    e.preventDefault();
    await supabase.from('profiles').update({
      full_name: editMember.full_name,
      subscription_type: editMember.subscription_type,
      subscription_end: editMember.subscription_end,
      phone: editMember.phone,
    }).eq('id', editMember.id);
    setEditMember(null);
    fetchAll();
    alert('Member updated!');
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'members', label: 'Members' },
    { id: 'classes', label: 'Classes' },
    { id: 'payments', label: 'Payments' },
    { id: 'inbody', label: 'InBody Input' },
  ];

  const inputClass = "bg-gray-700 text-white px-4 py-2.5 rounded outline-none border border-gray-600 focus:border-red-500 text-sm w-full";
  const labelClass = "text-gray-400 text-xs font-medium mb-1 block";
  const btnRed = "bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded text-sm font-bold transition";
  const btnGray = "bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm font-bold transition";

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <p className="text-white text-xl">Loading admin panel...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-8 py-4 border-b border-gray-800 bg-gray-950">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black text-red-500 tracking-widest">IRON GYM</h1>
          <span className="bg-yellow-500 text-black text-xs px-2 py-0.5 rounded font-bold">ADMIN</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => window.location.href = '/dashboard'} className={btnGray}>Member View</button>
          <button onClick={() => { supabase.auth.signOut(); window.location.href = '/'; }} className="border border-gray-600 text-gray-300 px-4 py-2 rounded hover:border-red-500 hover:text-red-400 transition text-sm">Logout</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* TABS */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-5 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition ${activeTab === t.id ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-black">Admin Dashboard</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Members', value: stats.totalMembers, color: 'text-blue-400' },
                { label: 'Active Members', value: stats.activeMembers, color: 'text-green-400' },
                { label: 'Total Revenue', value: `${stats.totalRevenue} EGP`, color: 'text-yellow-400' },
                { label: 'Total Classes', value: stats.classesCount, color: 'text-red-400' },
              ].map((s, i) => (
                <div key={i} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <p className="text-gray-400 text-sm mb-1">{s.label}</p>
                  <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Revenue Chart */}
            {revenueChart.length > 0 && (
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="font-bold text-lg mb-6 text-yellow-400">Monthly Revenue (EGP)</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={revenueChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#F9FAFB' }} formatter={(value) => [`${value} EGP`, 'Revenue']} />
                    <Bar dataKey="Revenue" fill="#E53E3E" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Recent Payments */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="font-bold text-lg mb-4">Recent Payments</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-700">
                      <th className="text-left py-2 pr-4">Member</th>
                      <th className="text-left py-2 pr-4">Amount</th>
                      <th className="text-left py-2 pr-4">Method</th>
                      <th className="text-left py-2 pr-4">Status</th>
                      <th className="text-left py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.slice(0, 5).map((p, i) => (
                      <tr key={i} className="border-b border-gray-700 hover:bg-gray-700 transition">
                        <td className="py-3 pr-4 text-gray-300">{p.profiles?.full_name || 'Unknown'}</td>
                        <td className="py-3 pr-4 text-yellow-400 font-bold">{p.amount} EGP</td>
                        <td className="py-3 pr-4 text-gray-300">{p.payment_method}</td>
                        <td className="py-3 pr-4">
                          <span className={`text-xs px-2 py-1 rounded-full font-bold ${p.status === 'confirmed' ? 'bg-green-900 text-green-400' : 'bg-yellow-900 text-yellow-400'}`}>{p.status}</span>
                        </td>
                        <td className="py-3 text-gray-400">{new Date(p.payment_date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Expiring Subscriptions */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="font-bold text-lg mb-4 text-yellow-400">Expiring Soon (next 7 days)</h3>
              <div className="flex flex-col gap-2">
                {members.filter(m => {
                  if (!m.subscription_end) return false;
                  const days = Math.ceil((new Date(m.subscription_end) - new Date()) / (1000 * 60 * 60 * 24));
                  return days >= 0 && days <= 7;
                }).map((m, i) => {
                  const days = Math.ceil((new Date(m.subscription_end) - new Date()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={i} className="flex justify-between items-center bg-yellow-900 bg-opacity-20 border border-yellow-700 rounded-lg px-4 py-3">
                      <p className="font-semibold">{m.full_name}</p>
                      <span className="text-yellow-400 text-sm font-bold">{days} days left</span>
                    </div>
                  );
                })}
                {members.filter(m => {
                  if (!m.subscription_end) return false;
                  const days = Math.ceil((new Date(m.subscription_end) - new Date()) / (1000 * 60 * 60 * 24));
                  return days >= 0 && days <= 7;
                }).length === 0 && <p className="text-gray-400">No subscriptions expiring soon</p>}
              </div>
            </div>
          </div>
        )}

        {/* MEMBERS TAB */}
        {activeTab === 'members' && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-black">Members Management</h2>

            {editMember && (
              <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md border border-gray-700">
                  <h3 className="font-bold text-lg mb-6">Edit Member — {editMember.full_name}</h3>
                  <form onSubmit={updateMember} className="flex flex-col gap-4">
                    <div><label className={labelClass}>Full Name</label><input className={inputClass} value={editMember.full_name || ''} onChange={e => setEditMember({...editMember, full_name: e.target.value})} /></div>
                    <div><label className={labelClass}>Phone</label><input className={inputClass} value={editMember.phone || ''} onChange={e => setEditMember({...editMember, phone: e.target.value})} /></div>
                    <div>
                      <label className={labelClass}>Subscription Type</label>
                      <select className={inputClass} value={editMember.subscription_type || ''} onChange={e => setEditMember({...editMember, subscription_type: e.target.value})}>
                        <option value="Basic">Basic</option>
                        <option value="Pro">Pro</option>
                        <option value="Elite">Elite</option>
                      </select>
                    </div>
                    <div><label className={labelClass}>Subscription End Date</label><input type="date" className={inputClass} value={editMember.subscription_end || ''} onChange={e => setEditMember({...editMember, subscription_end: e.target.value})} /></div>
                    <div className="flex gap-3 mt-2">
                      <button type="submit" className={`${btnRed} flex-1`}>Save Changes</button>
                      <button type="button" onClick={() => setEditMember(null)} className={`${btnGray} flex-1`}>Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-700">
                      <th className="text-left py-3 px-4">Name</th>
                      <th className="text-left py-3 px-4">Phone</th>
                      <th className="text-left py-3 px-4">Plan</th>
                      <th className="text-left py-3 px-4">Expires</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m, i) => {
                      const daysLeft = m.subscription_end ? Math.ceil((new Date(m.subscription_end) - new Date()) / (1000 * 60 * 60 * 24)) : 0;
                      const isActive = daysLeft > 0;
                      return (
                        <tr key={i} className="border-b border-gray-700 hover:bg-gray-700 transition">
                          <td className="py-3 px-4 font-semibold">{m.full_name || 'No name'}</td>
                          <td className="py-3 px-4 text-gray-400">{m.phone || '—'}</td>
                          <td className="py-3 px-4">
                            <span className={`text-xs px-2 py-1 rounded-full font-bold ${m.subscription_type === 'Elite' ? 'bg-yellow-900 text-yellow-400' : m.subscription_type === 'Pro' ? 'bg-red-900 text-red-400' : 'bg-gray-700 text-gray-300'}`}>
                              {m.subscription_type || 'None'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-300">{m.subscription_end || '—'}</td>
                          <td className="py-3 px-4">
                            <span className={`text-xs px-2 py-1 rounded-full font-bold ${isActive ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                              {isActive ? `${daysLeft}d left` : 'Expired'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <button onClick={() => setEditMember(m)} className="text-blue-400 hover:text-blue-300 text-xs font-bold">Edit</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CLASSES TAB */}
        {activeTab === 'classes' && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-black">Classes Management</h2>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="font-bold text-lg mb-4 text-red-400">Add New Class</h3>
              <form onSubmit={addClass} className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div><label className={labelClass}>Class Name *</label><input required className={inputClass} placeholder="e.g. HIIT Blast" value={newClass.name} onChange={e => setNewClass({...newClass, name: e.target.value})} /></div>
                <div><label className={labelClass}>Instructor *</label><input required className={inputClass} placeholder="Coach Name" value={newClass.instructor} onChange={e => setNewClass({...newClass, instructor: e.target.value})} /></div>
                <div><label className={labelClass}>Class Type *</label><input required className={inputClass} placeholder="e.g. HIIT, Yoga" value={newClass.class_type} onChange={e => setNewClass({...newClass, class_type: e.target.value})} /></div>
                <div><label className={labelClass}>Schedule *</label><input required type="datetime-local" className={inputClass} value={newClass.schedule} onChange={e => setNewClass({...newClass, schedule: e.target.value})} /></div>
                <div><label className={labelClass}>Total Spots</label><input type="number" className={inputClass} value={newClass.total_spots} onChange={e => setNewClass({...newClass, total_spots: parseInt(e.target.value)})} /></div>
                <div><label className={labelClass}>Duration (minutes)</label><input type="number" className={inputClass} value={newClass.duration_minutes} onChange={e => setNewClass({...newClass, duration_minutes: parseInt(e.target.value)})} /></div>
                <div><label className={labelClass}>Location</label><input className={inputClass} value={newClass.location} onChange={e => setNewClass({...newClass, location: e.target.value})} /></div>
                <div className="flex items-end"><button type="submit" className={`${btnRed} w-full`}>Add Class</button></div>
              </form>
            </div>
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-700">
                      <th className="text-left py-3 px-4">Class</th>
                      <th className="text-left py-3 px-4">Instructor</th>
                      <th className="text-left py-3 px-4">Schedule</th>
                      <th className="text-left py-3 px-4">Spots</th>
                      <th className="text-left py-3 px-4">Location</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map((c, i) => (
                      <tr key={i} className="border-b border-gray-700 hover:bg-gray-700 transition">
                        <td className="py-3 px-4 font-semibold">{c.name}</td>
                        <td className="py-3 px-4 text-gray-400">{c.instructor}</td>
                        <td className="py-3 px-4 text-gray-300">{new Date(c.schedule).toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded-full font-bold ${c.booked_spots >= c.total_spots ? 'bg-red-900 text-red-400' : 'bg-green-900 text-green-400'}`}>
                            {c.booked_spots}/{c.total_spots}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-400">{c.location}</td>
                        <td className="py-3 px-4">
                          <button onClick={() => deleteClass(c.id)} className="text-red-400 hover:text-red-300 text-xs font-bold">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PAYMENTS TAB */}
        {activeTab === 'payments' && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-black">Payments</h2>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="font-bold text-lg mb-4 text-red-400">Record New Payment</h3>
              <form onSubmit={addPayment} className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Member *</label>
                  <select required className={inputClass} value={newPayment.user_id} onChange={e => setNewPayment({...newPayment, user_id: e.target.value})}>
                    <option value="">Select member</option>
                    {members.map((m, i) => <option key={i} value={m.id}>{m.full_name || m.email}</option>)}
                  </select>
                </div>
                <div><label className={labelClass}>Amount (EGP) *</label><input required type="number" className={inputClass} placeholder="e.g. 999" value={newPayment.amount} onChange={e => setNewPayment({...newPayment, amount: e.target.value})} /></div>
                <div>
                  <label className={labelClass}>Payment Method</label>
                  <select className={inputClass} value={newPayment.payment_method} onChange={e => setNewPayment({...newPayment, payment_method: e.target.value})}>
                    <option>Vodafone Cash</option>
                    <option>Instapay</option>
                    <option>Cash</option>
                    <option>Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Status</label>
                  <select className={inputClass} value={newPayment.status} onChange={e => setNewPayment({...newPayment, status: e.target.value})}>
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div><label className={labelClass}>Notes</label><input className={inputClass} placeholder="Optional notes" value={newPayment.notes} onChange={e => setNewPayment({...newPayment, notes: e.target.value})} /></div>
                <div className="flex items-end"><button type="submit" className={`${btnRed} w-full`}>Record Payment</button></div>
              </form>
            </div>
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-700">
                      <th className="text-left py-3 px-4">Member</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Method</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p, i) => (
                      <tr key={i} className="border-b border-gray-700 hover:bg-gray-700 transition">
                        <td className="py-3 px-4 font-semibold">{p.profiles?.full_name || 'Unknown'}</td>
                        <td className="py-3 px-4 text-yellow-400 font-bold">{p.amount} EGP</td>
                        <td className="py-3 px-4 text-gray-300">{p.payment_method}</td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded-full font-bold ${p.status === 'confirmed' ? 'bg-green-900 text-green-400' : 'bg-yellow-900 text-yellow-400'}`}>{p.status}</span>
                        </td>
                        <td className="py-3 px-4 text-gray-400">{new Date(p.payment_date).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-gray-400">{p.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* INBODY INPUT TAB */}
        {activeTab === 'inbody' && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-black">InBody Results Input</h2>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="font-bold text-lg mb-4 text-red-400">Add InBody Result for Member</h3>
              <form onSubmit={addInbody} className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Member *</label>
                  <select required className={inputClass} value={newInbody.user_id} onChange={e => setNewInbody({...newInbody, user_id: e.target.value})}>
                    <option value="">Select member</option>
                    {members.map((m, i) => <option key={i} value={m.id}>{m.full_name || m.email}</option>)}
                  </select>
                </div>
                <div><label className={labelClass}>Test Date *</label><input required type="date" className={inputClass} value={newInbody.test_date} onChange={e => setNewInbody({...newInbody, test_date: e.target.value})} /></div>
                <div><label className={labelClass}>Weight (kg) *</label><input required type="number" step="0.1" className={inputClass} placeholder="e.g. 75.5" value={newInbody.weight} onChange={e => setNewInbody({...newInbody, weight: e.target.value})} /></div>
                <div><label className={labelClass}>Muscle Mass (kg) *</label><input required type="number" step="0.1" className={inputClass} placeholder="e.g. 35.2" value={newInbody.muscle_mass} onChange={e => setNewInbody({...newInbody, muscle_mass: e.target.value})} /></div>
                <div><label className={labelClass}>Body Fat (%) *</label><input required type="number" step="0.1" className={inputClass} placeholder="e.g. 18.5" value={newInbody.body_fat} onChange={e => setNewInbody({...newInbody, body_fat: e.target.value})} /></div>
                <div><label className={labelClass}>BMI *</label><input required type="number" step="0.1" className={inputClass} placeholder="e.g. 24.5" value={newInbody.bmi} onChange={e => setNewInbody({...newInbody, bmi: e.target.value})} /></div>
                <div><label className={labelClass}>Notes</label><input className={inputClass} placeholder="e.g. Good progress!" value={newInbody.notes} onChange={e => setNewInbody({...newInbody, notes: e.target.value})} /></div>
                <div className="flex items-end"><button type="submit" className={`${btnRed} w-full`}>Add Result</button></div>
              </form>
            </div>
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-700">
                <h3 className="font-bold">All InBody Results</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-700">
                      <th className="text-left py-3 px-4">Member</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Weight</th>
                      <th className="text-left py-3 px-4">Muscle</th>
                      <th className="text-left py-3 px-4">Body Fat</th>
                      <th className="text-left py-3 px-4">BMI</th>
                      <th className="text-left py-3 px-4">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inbodyResults.map((r, i) => (
                      <tr key={i} className="border-b border-gray-700 hover:bg-gray-700 transition">
                        <td className="py-3 px-4 font-semibold">{r.profiles?.full_name || 'Unknown'}</td>
                        <td className="py-3 px-4 text-gray-300">{r.test_date}</td>
                        <td className="py-3 px-4 text-yellow-400 font-bold">{r.weight} kg</td>
                        <td className="py-3 px-4 text-green-400 font-bold">{r.muscle_mass} kg</td>
                        <td className="py-3 px-4 text-red-400 font-bold">{r.body_fat}%</td>
                        <td className="py-3 px-4 text-blue-400 font-bold">{r.bmi}</td>
                        <td className="py-3 px-4 text-gray-400">{r.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Admin;