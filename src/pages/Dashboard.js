import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function Dashboard({ user }) {
  
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState(null);
  const [classes, setClasses] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [inbodyResults, setInbodyResults] = useState([]);
  const [attendance, setAttendance] = useState([]); // eslint-disable-line no-unused-vars
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    setLoading(true);

    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (!profileData) {
      await supabase.from('profiles').insert({
        id: user.id,
        full_name: user.user_metadata?.full_name || 'Member',
        subscription_type: 'Pro',
        subscription_start: new Date().toISOString().split('T')[0],
        subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      const { data: newProfile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(newProfile);
    } else {
      setProfile(profileData);
    }

    const { data: classesData } = await supabase.from('classes').select('*').order('schedule', { ascending: true });
    if (!classesData || classesData.length === 0) {
      await supabase.from('classes').insert([
        { name: 'HIIT Blast', instructor: 'Coach Ahmed', schedule: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), total_spots: 20, booked_spots: 12, class_type: 'HIIT' },
        { name: 'Yoga Flow', instructor: 'Coach Sara', schedule: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 7200000).toISOString(), total_spots: 15, booked_spots: 8, class_type: 'Yoga' },
        { name: 'Spinning', instructor: 'Coach Omar', schedule: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), total_spots: 18, booked_spots: 18, class_type: 'Cardio' },
        { name: 'Zumba', instructor: 'Coach Nour', schedule: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 3600000).toISOString(), total_spots: 25, booked_spots: 10, class_type: 'Dance' },
        { name: 'Boxing', instructor: 'Coach Karim', schedule: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), total_spots: 12, booked_spots: 5, class_type: 'Combat' },
        { name: 'Pilates', instructor: 'Coach Mona', schedule: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 5400000).toISOString(), total_spots: 15, booked_spots: 3, class_type: 'Flexibility' },
      ]);
      const { data: newClasses } = await supabase.from('classes').select('*').order('schedule', { ascending: true });
      setClasses(newClasses || []);
    } else {
      setClasses(classesData);
    }

    const { data: bookingsData } = await supabase.from('class_bookings').select('*, classes(*)').eq('user_id', user.id);
    setMyBookings(bookingsData || []);

    const { data: inbodyData } = await supabase.from('inbody_results').select('*').eq('user_id', user.id).order('test_date', { ascending: true });
    if (!inbodyData || inbodyData.length === 0) {
      await supabase.from('inbody_results').insert([
        { user_id: user.id, test_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], weight: 85, muscle_mass: 38, body_fat: 22, bmi: 27.5, notes: 'Starting point' },
        { user_id: user.id, test_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], weight: 82, muscle_mass: 39.5, body_fat: 19, bmi: 26.8, notes: 'Good progress' },
        { user_id: user.id, test_date: new Date().toISOString().split('T')[0], weight: 79, muscle_mass: 41, body_fat: 16, bmi: 25.9, notes: 'Excellent improvement!' },
      ]);
      const { data: newInbody } = await supabase.from('inbody_results').select('*').eq('user_id', user.id).order('test_date', { ascending: true });
      setInbodyResults(newInbody || []);
    } else {
      setInbodyResults(inbodyData);
    }

    // Fetch attendance
    const { data: attendanceData } = await supabase.from('attendance').select('*').eq('user_id', user.id).order('date', { ascending: false });
    if (!attendanceData || attendanceData.length === 0) {
      // Add sample attendance for last 7 days
      const days = [0, 1, 2, 4, 5];
      for (const d of days) {
        const date = new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        await supabase.from('attendance').insert({ user_id: user.id, date });
      }
      const { data: newAtt } = await supabase.from('attendance').select('*').eq('user_id', user.id).order('date', { ascending: false });
      setAttendance(newAtt || []);
      calculateStreak(newAtt || []);
    } else {
      setAttendance(attendanceData);
      calculateStreak(attendanceData);
    }

    setLoading(false);
  };

  const calculateStreak = (attendanceData) => {
    if (!attendanceData || attendanceData.length === 0) { setStreak(0); return; }
    let s = 0;
    const today = new Date().toISOString().split('T')[0];
    const dates = attendanceData.map(a => a.date).sort().reverse();
    let current = today;
    for (const date of dates) {
      if (date === current) {
        s++;
        const d = new Date(current);
        d.setDate(d.getDate() - 1);
        current = d.toISOString().split('T')[0];
      } else break;
    }
    setStreak(s);
  };

  const bookClass = async (classItem) => {
    if (classItem.booked_spots >= classItem.total_spots) return;
    const alreadyBooked = myBookings.find(b => b.class_id === classItem.id);
    if (alreadyBooked) { alert('You already booked this class!'); return; }
    await supabase.from('class_bookings').insert({ user_id: user.id, class_id: classItem.id });
    await supabase.from('classes').update({ booked_spots: classItem.booked_spots + 1 }).eq('id', classItem.id);
    fetchData();
    alert('Class booked successfully!');
  };

  const getDaysLeft = () => {
    if (!profile?.subscription_end) return 0;
    const diff = Math.ceil((new Date(profile.subscription_end) - new Date()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'classes', label: 'Book Classes' },
    { id: 'trainers', label: 'Personal Training' },
    { id: 'nutrition', label: 'Nutrition' },
    { id: 'physio', label: 'Physiotherapy' },
    { id: 'inbody', label: 'InBody Tracking' },
  ];

  // Prepare chart data
  const chartData = inbodyResults.map(r => ({
    date: r.test_date,
    Weight: r.weight,
    Muscle: r.muscle_mass,
    'Body Fat': r.body_fat,
    BMI: r.bmi,
  }));

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <p className="text-white text-xl">Loading your dashboard...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-8 py-4 border-b border-gray-800 bg-gray-950">
        <h1 className="text-2xl font-black text-red-500 tracking-widest">IRON GYM</h1>
        <div className="flex items-center gap-4">
          <p className="text-gray-400 text-sm">Welcome, {profile?.full_name || user.email}</p>
          <span className="bg-red-600 text-white text-xs px-3 py-1 rounded-full font-bold">{profile?.subscription_type || 'Pro'}</span>
          {streak >= 3 && <span className="text-orange-400 font-bold text-sm">🔥 {streak} day streak!</span>}
          <a href="/admin" className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded font-bold text-sm transition">Admin Panel</a>
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

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-6">

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <p className="text-gray-400 text-sm mb-1">Days Left</p>
                <p className={`text-4xl font-black ${getDaysLeft() < 7 ? 'text-red-500' : 'text-green-400'}`}>{getDaysLeft()}</p>
                <p className="text-gray-500 text-xs mt-1">{profile?.subscription_type} Plan</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <p className="text-gray-400 text-sm mb-1">Classes Booked</p>
                <p className="text-4xl font-black text-blue-400">{myBookings.length}</p>
                <p className="text-gray-500 text-xs mt-1">This month</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <p className="text-gray-400 text-sm mb-1">Current Weight</p>
                <p className="text-4xl font-black text-yellow-400">{inbodyResults[inbodyResults.length-1]?.weight || '--'}</p>
                <p className="text-gray-500 text-xs mt-1">kg</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <p className="text-gray-400 text-sm mb-1">Body Fat</p>
                <p className="text-4xl font-black text-purple-400">{inbodyResults[inbodyResults.length-1]?.body_fat || '--'}</p>
                <p className="text-gray-500 text-xs mt-1">%</p>
              </div>
              <div className={`rounded-xl p-6 border ${streak >= 7 ? 'border-orange-500 bg-orange-900 bg-opacity-20' : 'border-gray-700 bg-gray-800'}`}>
                <p className="text-gray-400 text-sm mb-1">Gym Streak</p>
                <p className={`text-4xl font-black ${streak >= 7 ? 'text-orange-400' : streak >= 3 ? 'text-yellow-400' : 'text-gray-400'}`}>{streak}</p>
                <p className="text-gray-500 text-xs mt-1">{streak >= 7 ? '🔥 On fire!' : streak >= 3 ? '💪 Keep going!' : 'days in a row'}</p>
              </div>
            </div>

            {/* Streak Banner */}
            {streak >= 3 && (
              <div className={`rounded-xl p-4 border flex items-center gap-4 ${streak >= 7 ? 'bg-orange-900 bg-opacity-30 border-orange-500' : 'bg-yellow-900 bg-opacity-20 border-yellow-600'}`}>
                <span className="text-4xl">{streak >= 7 ? '🔥' : '💪'}</span>
                <div>
                  <p className={`font-bold text-lg ${streak >= 7 ? 'text-orange-400' : 'text-yellow-400'}`}>
                    {streak >= 7 ? `${streak} Day Streak — You're on fire!` : `${streak} Day Streak — Keep it up!`}
                  </p>
                  <p className="text-gray-400 text-sm">You've been to the gym {streak} days in a row. Amazing consistency!</p>
                </div>
              </div>
            )}

            {/* Subscription warning */}
            {getDaysLeft() < 7 && getDaysLeft() > 0 && (
              <div className="bg-red-900 bg-opacity-30 border border-red-500 rounded-xl p-4">
                <p className="text-red-400 font-bold">Your subscription expires in {getDaysLeft()} days! Contact us to renew.</p>
              </div>
            )}

            {/* Progress Chart */}
            {chartData.length > 1 && (
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="font-bold text-lg mb-6">My Progress Chart</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#F9FAFB' }} />
                    <Legend />
                    <Line type="monotone" dataKey="Weight" stroke="#FBBF24" strokeWidth={2} dot={{ fill: '#FBBF24', r: 5 }} />
                    <Line type="monotone" dataKey="Muscle" stroke="#34D399" strokeWidth={2} dot={{ fill: '#34D399', r: 5 }} />
                    <Line type="monotone" dataKey="Body Fat" stroke="#F87171" strokeWidth={2} dot={{ fill: '#F87171', r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Upcoming classes */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="font-bold text-lg mb-4">My Upcoming Classes</h3>
              {myBookings.length === 0 ? (
                <p className="text-gray-400">No classes booked yet. <button onClick={() => setActiveTab('classes')} className="text-red-400 hover:text-red-300">Book a class</button></p>
              ) : (
                <div className="flex flex-col gap-3">
                  {myBookings.map((b, i) => (
                    <div key={i} className="flex justify-between items-center bg-gray-700 rounded-lg px-4 py-3">
                      <div>
                        <p className="font-semibold">{b.classes?.name}</p>
                        <p className="text-gray-400 text-sm">{b.classes?.instructor}</p>
                      </div>
                      <p className="text-gray-300 text-sm">{b.classes?.schedule ? formatDate(b.classes.schedule) : ''}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Latest InBody */}
            {inbodyResults.length > 0 && (
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="font-bold text-lg mb-4">Latest InBody Results — {inbodyResults[inbodyResults.length-1]?.test_date}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Weight', value: `${inbodyResults[inbodyResults.length-1]?.weight} kg`, color: 'text-yellow-400' },
                    { label: 'Muscle Mass', value: `${inbodyResults[inbodyResults.length-1]?.muscle_mass} kg`, color: 'text-green-400' },
                    { label: 'Body Fat', value: `${inbodyResults[inbodyResults.length-1]?.body_fat}%`, color: 'text-red-400' },
                    { label: 'BMI', value: inbodyResults[inbodyResults.length-1]?.bmi, color: 'text-blue-400' },
                  ].map((s, i) => (
                    <div key={i} className="bg-gray-700 rounded-lg p-4 text-center">
                      <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                      <p className="text-gray-400 text-xs mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CLASSES TAB */}
        {activeTab === 'classes' && (
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-black mb-2">Available Classes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {classes.map((c, i) => {
                const spotsLeft = c.total_spots - c.booked_spots;
                const isFull = spotsLeft === 0;
                const isBooked = myBookings.find(b => b.class_id === c.id);
                return (
                  <div key={i} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-500 transition">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg">{c.name}</h3>
                        <p className="text-gray-400 text-sm">{c.instructor}</p>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-bold ${isFull ? 'bg-red-900 text-red-400' : spotsLeft <= 3 ? 'bg-yellow-900 text-yellow-400' : 'bg-green-900 text-green-400'}`}>
                        {isFull ? 'FULL' : `${spotsLeft} spots left`}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-4">{formatDate(c.schedule)}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2 items-center">
                        <div className="w-32 bg-gray-700 rounded-full h-2">
                          <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(c.booked_spots / c.total_spots) * 100}%` }}></div>
                        </div>
                        <span className="text-gray-400 text-xs">{c.booked_spots}/{c.total_spots}</span>
                      </div>
                      <button onClick={() => bookClass(c)} disabled={isFull || isBooked}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition ${isBooked ? 'bg-green-700 text-white cursor-default' : isFull ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500 text-white'}`}>
                        {isBooked ? 'Booked!' : isFull ? 'Full' : 'Book Now'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PERSONAL TRAINING TAB */}
        {activeTab === 'trainers' && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-black">Book a Personal Trainer</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: 'Coach Ahmed', spec: 'Strength & Powerlifting', exp: '8 years', img: 'https://images.unsplash.com/photo-1567013127542-490d757e51cd?w=200&h=200&fit=crop&crop=face' },
                { name: 'Coach Omar', spec: 'HIIT & Cardio', exp: '6 years', img: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=200&h=200&fit=crop&crop=face' },
                { name: 'Coach Karim', spec: 'Boxing & Combat', exp: '10 years', img: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=200&h=200&fit=crop&crop=face' },
              ].map((t, i) => (
                <div key={i} className="bg-gray-800 rounded-xl p-6 border border-gray-700 text-center hover:border-red-500 transition">
                  <img src={t.img} alt={t.name} className="w-20 h-20 rounded-full mx-auto mb-4 object-cover" />
                  <h3 className="font-bold text-lg">{t.name}</h3>
                  <p className="text-red-400 text-sm mb-1">{t.spec}</p>
                  <p className="text-gray-400 text-xs mb-4">{t.exp} experience</p>
                  <button onClick={() => alert('Booking request sent! We will confirm within 2 hours.')} className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg font-bold text-sm transition w-full">Book Session</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NUTRITION TAB */}
        {activeTab === 'nutrition' && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-black">Nutrition Consultation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="font-bold text-lg mb-2">Your Nutritionist</h3>
                <div className="flex items-center gap-4 mb-4">
                  <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&h=80&fit=crop&crop=face" alt="nutritionist" className="w-16 h-16 rounded-full object-cover" />
                  <div>
                    <p className="font-bold">Dr. Nadia Hassan</p>
                    <p className="text-green-400 text-sm">Sports Nutritionist</p>
                    <p className="text-gray-400 text-xs">12 years experience</p>
                  </div>
                </div>
                <button onClick={() => alert('Booking request sent! We will confirm within 2 hours.')} className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-bold text-sm transition w-full">Book Consultation</button>
              </div>
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="font-bold text-lg mb-4">Your Meal Plan</h3>
                <div className="flex flex-col gap-3">
                  {['Breakfast: Oats + Protein Shake', 'Lunch: Chicken + Rice + Vegetables', 'Snack: Greek Yogurt + Fruits', 'Dinner: Fish + Sweet Potato + Salad', 'Pre-workout: Banana + Coffee'].map((meal, i) => (
                    <div key={i} className="flex items-center gap-3 bg-gray-700 rounded-lg px-4 py-2">
                      <span className="text-green-400 font-bold">✓</span>
                      <p className="text-gray-300 text-sm">{meal}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PHYSIOTHERAPY TAB */}
        {activeTab === 'physio' && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-black">Physiotherapy</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="font-bold text-lg mb-4">Your Physiotherapist</h3>
                <div className="flex items-center gap-4 mb-4">
                  <img src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=80&h=80&fit=crop&crop=face" alt="physio" className="w-16 h-16 rounded-full object-cover" />
                  <div>
                    <p className="font-bold">Dr. Khaled Mostafa</p>
                    <p className="text-blue-400 text-sm">Sports Physiotherapist</p>
                    <p className="text-gray-400 text-xs">9 years experience</p>
                  </div>
                </div>
                <button onClick={() => alert('Booking request sent! We will confirm within 2 hours.')} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold text-sm transition w-full">Book Session</button>
              </div>
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="font-bold text-lg mb-4">Common Treatments</h3>
                <div className="flex flex-col gap-3">
                  {['Lower Back Pain Relief', 'Knee Rehabilitation', 'Shoulder Injury Recovery', 'Post-workout Recovery', 'Sports Injury Treatment', 'Posture Correction'].map((t, i) => (
                    <div key={i} className="flex items-center gap-3 bg-gray-700 rounded-lg px-4 py-2">
                      <span className="text-blue-400 font-bold">+</span>
                      <p className="text-gray-300 text-sm">{t}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INBODY TAB */}
        {activeTab === 'inbody' && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-black">InBody Tracking</h2>

            {/* Progress Chart */}
            {chartData.length > 1 && (
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="font-bold text-lg mb-6">Progress Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#F9FAFB' }} />
                    <Legend />
                    <Line type="monotone" dataKey="Weight" stroke="#FBBF24" strokeWidth={2} dot={{ fill: '#FBBF24', r: 5 }} />
                    <Line type="monotone" dataKey="Muscle" stroke="#34D399" strokeWidth={2} dot={{ fill: '#34D399', r: 5 }} />
                    <Line type="monotone" dataKey="Body Fat" stroke="#F87171" strokeWidth={2} dot={{ fill: '#F87171', r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {inbodyResults.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Weight', key: 'weight', unit: 'kg', color: 'text-yellow-400' },
                  { label: 'Muscle Mass', key: 'muscle_mass', unit: 'kg', color: 'text-green-400' },
                  { label: 'Body Fat', key: 'body_fat', unit: '%', color: 'text-red-400' },
                  { label: 'BMI', key: 'bmi', unit: '', color: 'text-blue-400' },
                ].map((s, i) => {
                  const latest = inbodyResults[inbodyResults.length-1]?.[s.key];
                  const previous = inbodyResults[inbodyResults.length-2]?.[s.key];
                  const diff = previous ? (latest - previous).toFixed(1) : null;
                  return (
                    <div key={i} className="bg-gray-800 rounded-xl p-6 border border-gray-700 text-center">
                      <p className={`text-3xl font-black ${s.color}`}>{latest}{s.unit}</p>
                      <p className="text-gray-400 text-sm mt-1">{s.label}</p>
                      {diff && <p className={`text-xs mt-2 font-bold ${diff < 0 && s.key !== 'muscle_mass' ? 'text-green-400' : diff > 0 && s.key === 'muscle_mass' ? 'text-green-400' : 'text-red-400'}`}>{diff > 0 ? '+' : ''}{diff}{s.unit} vs last</p>}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="font-bold text-lg mb-4">Test History</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-700">
                      <th className="text-left py-2 pr-4">Date</th>
                      <th className="text-left py-2 pr-4">Weight</th>
                      <th className="text-left py-2 pr-4">Muscle</th>
                      <th className="text-left py-2 pr-4">Body Fat</th>
                      <th className="text-left py-2 pr-4">BMI</th>
                      <th className="text-left py-2">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...inbodyResults].reverse().map((r, i) => (
                      <tr key={i} className="border-b border-gray-700 hover:bg-gray-700 transition">
                        <td className="py-3 pr-4 text-gray-300">{r.test_date}</td>
                        <td className="py-3 pr-4 text-yellow-400 font-bold">{r.weight} kg</td>
                        <td className="py-3 pr-4 text-green-400 font-bold">{r.muscle_mass} kg</td>
                        <td className="py-3 pr-4 text-red-400 font-bold">{r.body_fat}%</td>
                        <td className="py-3 pr-4 text-blue-400 font-bold">{r.bmi}</td>
                        <td className="py-3 text-gray-400">{r.notes}</td>
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

export default Dashboard;