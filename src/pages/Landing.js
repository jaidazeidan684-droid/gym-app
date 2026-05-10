import React from 'react';
import { Link } from 'react-router-dom';

function Landing() {
  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-8 py-5 border-b border-gray-800">
        <h1 className="text-2xl font-black text-red-500 tracking-widest">IRON GYM</h1>
        <div className="flex gap-6 text-sm text-gray-400">
          <a href="#packages" className="hover:text-white transition">Packages</a>
          <a href="#services" className="hover:text-white transition">Services</a>
          <a href="#gallery" className="hover:text-white transition">Gallery</a>
        </div>
        <div className="flex gap-3">
          <Link to="/login" className="border border-gray-600 text-gray-300 px-5 py-2 rounded hover:border-white hover:text-white transition text-sm">Login</Link>
          <Link to="/register" className="bg-red-600 hover:bg-red-500 text-white px-5 py-2 rounded transition text-sm font-medium">Join Now</Link>
        </div>
      </nav>

      {/* HERO */}
      <div className="relative py-32 px-8 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-900 to-gray-900 opacity-50"></div>
        <div className="relative z-10">
          <p className="text-red-400 tracking-widest text-sm font-semibold mb-4">CAIRO'S PREMIER FITNESS CENTER</p>
          <h2 className="text-7xl font-black mb-6 leading-tight">TRANSFORM<br /><span className="text-red-500">YOUR BODY</span></h2>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-10">State-of-the-art equipment, expert trainers, and a community that pushes you to be your best.</p>
          <div className="flex gap-4 justify-center">
            <Link to="/register" className="bg-red-600 hover:bg-red-500 text-white px-10 py-4 rounded font-bold text-lg transition">Start Today</Link>
            <a href="#packages" className="border border-gray-600 hover:border-white text-gray-300 hover:text-white px-10 py-4 rounded font-bold text-lg transition">View Packages</a>
          </div>
          <div className="flex gap-16 justify-center mt-16 pt-10 border-t border-gray-800">
            <div><p className="text-4xl font-black text-red-500">500+</p><p className="text-gray-400 text-sm mt-1">Active Members</p></div>
            <div><p className="text-4xl font-black text-red-500">20+</p><p className="text-gray-400 text-sm mt-1">Expert Trainers</p></div>
            <div><p className="text-4xl font-black text-red-500">50+</p><p className="text-gray-400 text-sm mt-1">Weekly Classes</p></div>
            <div><p className="text-4xl font-black text-red-500">5★</p><p className="text-gray-400 text-sm mt-1">Member Rating</p></div>
          </div>
        </div>
      </div>

      {/* PACKAGES */}
      <div id="packages" className="py-24 px-8 bg-gray-950">
        <p className="text-red-500 text-sm font-semibold text-center tracking-widest mb-2">MEMBERSHIP PLANS</p>
        <h3 className="text-4xl font-black text-center mb-16">Choose Your Package</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { name: 'Basic', price: '599', period: 'month', color: 'border-gray-700', btn: 'bg-gray-700 hover:bg-gray-600', features: ['Gym Access', 'Locker Room', '2 Group Classes/week', 'Basic App Access'] },
            { name: 'Pro', price: '999', period: 'month', color: 'border-red-500', btn: 'bg-red-600 hover:bg-red-500', badge: 'MOST POPULAR', features: ['Unlimited Gym Access', '2 PT Sessions/month', 'Unlimited Classes', 'Nutrition Consultation', 'InBody Analysis', 'Full App Access'] },
            { name: 'Elite', price: '1499', period: 'month', color: 'border-yellow-500', btn: 'bg-yellow-600 hover:bg-yellow-500', features: ['Everything in Pro', '8 PT Sessions/month', 'Monthly Physiotherapy', 'Custom Meal Plan', 'Priority Booking', 'VIP Locker'] },
          ].map((p, i) => (
            <div key={i} className={`border-2 ${p.color} rounded-xl p-8 relative hover:scale-105 transition`}>
              {p.badge && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs px-4 py-1 rounded-full font-bold">{p.badge}</span>}
              <h4 className="text-xl font-black mb-2">{p.name}</h4>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-4xl font-black text-white">{p.price}</span>
                <span className="text-gray-400 text-sm mb-1">EGP/{p.period}</span>
              </div>
              <ul className="flex flex-col gap-3 mb-8">
                {p.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-gray-300 text-sm">
                    <span className="text-green-400 font-bold">✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link to="/register" className={`${p.btn} text-white w-full py-3 rounded font-bold text-center block transition`}>Get Started</Link>
            </div>
          ))}
        </div>
      </div>

      {/* SERVICES */}
      <div id="services" className="py-24 px-8 bg-gray-900">
        <p className="text-red-500 text-sm font-semibold text-center tracking-widest mb-2">WHAT WE OFFER</p>
        <h3 className="text-4xl font-black text-center mb-16">Our Services</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[
            { title: 'Group Classes', desc: 'HIIT, Yoga, Spinning, Zumba and more — 50+ classes weekly' },
            { title: 'Personal Training', desc: 'One-on-one sessions with certified expert trainers' },
            { title: 'Nutrition Consulting', desc: 'Custom meal plans and dietary guidance from nutritionists' },
            { title: 'Physiotherapy', desc: 'Injury recovery and prevention with licensed physiotherapists' },
            { title: 'InBody Analysis', desc: 'Advanced body composition analysis and progress tracking' },
            { title: 'Supplement Bar', desc: 'Premium protein shakes and supplements available on-site' },
            { title: 'Sauna & Recovery', desc: 'Post-workout recovery facilities for elite members' },
            { title: 'Online Coaching', desc: 'Remote training programs for members on the go' },
          ].map((s, i) => (
            <div key={i} className="bg-gray-800 p-6 rounded-xl hover:bg-gray-750 hover:border-red-500 border border-gray-700 transition">
              <h4 className="text-white font-bold mb-2">{s.title}</h4>
              <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* GALLERY */}
      <div id="gallery" className="py-24 px-8 bg-gray-950">
        <p className="text-red-500 text-sm font-semibold text-center tracking-widest mb-2">OUR FACILITY</p>
        <h3 className="text-4xl font-black text-center mb-16">The Gym</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {[
            { label: 'Weight Room', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop' },
            { label: 'Cardio Zone', img: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&h=300&fit=crop' },
            { label: 'Group Classes', img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&fit=crop' },
            { label: 'Personal Training', img: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=300&fit=crop' },
            { label: 'Locker Rooms', img: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&h=300&fit=crop' },
            { label: 'Recovery Zone', img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop' },
          ].map((g, i) => (
            <div key={i} className="relative rounded-xl overflow-hidden group cursor-pointer">
              <img src={g.img} alt={g.label} className="w-full h-48 object-cover group-hover:scale-110 transition duration-300" />
              <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-20 transition flex items-end">
                <p className="text-white font-bold text-sm p-4">{g.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="py-24 px-8 bg-red-600 text-center">
        <h3 className="text-4xl font-black mb-4">Ready to Transform?</h3>
        <p className="text-red-100 text-lg mb-8">Join hundreds of members already crushing their goals at Iron Gym</p>
        <Link to="/register" className="bg-white text-red-600 px-12 py-4 rounded font-black text-lg hover:bg-red-50 transition">JOIN NOW</Link>
      </div>

      {/* FOOTER */}
      <div className="py-8 text-center text-gray-500 text-sm bg-gray-950 border-t border-gray-800">
        <p className="font-bold text-white mb-1">Iron Gym Cairo</p>
        <p>2024 All rights reserved | Built by Jaida Zeidan</p>
      </div>

    </div>
  );
}

export default Landing;