import React, { useState } from 'react';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Send,
  Leaf,
  ShieldCheck,
  CheckCircle,
  ExternalLink,
  Code,
  GraduationCap,
} from 'lucide-react';

export const AboutPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-50 text-xs font-bold text-[#7561A8] border border-purple-100">
          <GraduationCap className="w-4 h-4" />
          Engineering Design & Innovation (EDI) Project
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#252536]">
          Digital Platform for Sustainable Use of Construction Material
        </h1>
        <p className="text-sm text-[#51416F] max-w-2xl mx-auto leading-relaxed">
          A circular economy platform engineering solution designed to eliminate construction and demolition (C&D) waste across the Pune metropolitan region.
        </p>
      </div>

      {/* Problem & Solution Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-3">
          <h3 className="font-bold text-base text-rose-600 flex items-center gap-2">
            The Urban C&D Waste Challenge in Pune
          </h3>
          <p className="text-xs text-[#51416F] leading-relaxed">
            Pune generates over 800 metric tons of construction waste daily from massive real-estate expansions in Hinjawadi, Kharadi, Wakad, and Baner. High-grade materials (unopened cement bags, structural steel offcuts, vitrified tiles) are frequently dumped into overburdened landfills due to fragmented communication between job sites.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-3">
          <h3 className="font-bold text-base text-emerald-700 flex items-center gap-2">
            The CircuBuild Engineering Solution
          </h3>
          <p className="text-xs text-[#51416F] leading-relaxed">
            CircuBuild closes the material loop by connecting active builder sites with surplus inventory to nearby sites requiring materials. Enhanced with genuine Google Maps spatial navigation, Gemini Vision AI for non-destructive surface condition screening, and transparent LCA carbon metrics.
          </p>
        </div>
      </div>

      {/* Technical Stack Architecture */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-4">
        <h3 className="font-display font-bold text-lg text-[#252536] flex items-center gap-2">
          <Code className="w-5 h-5 text-[#7561A8]" />
          Technical Stack & Architectural Pillars
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#F1F2F5]">
            <strong className="block text-[#252536]">Frontend</strong>
            <span className="text-[#8B8D98]">React.js + Vite + Tailwind CSS</span>
          </div>
          <div className="p-3 rounded-xl bg-[#F1F2F5]">
            <strong className="block text-[#252536]">Geospatial Engine</strong>
            <span className="text-[#8B8D98]">Google Maps JavaScript API</span>
          </div>
          <div className="p-3 rounded-xl bg-[#F1F2F5]">
            <strong className="block text-[#252536]">Computer Vision AI</strong>
            <span className="text-[#8B8D98]">Gemini 3.8 Flash Vision SDK</span>
          </div>
          <div className="p-3 rounded-xl bg-[#F1F2F5]">
            <strong className="block text-[#252536]">Database & Auth</strong>
            <span className="text-[#8B8D98]">Supabase PostgreSQL + RLS</span>
          </div>
        </div>
      </div>

      {/* Sustainable Development Goals Alignment */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-3xl border border-emerald-200 text-xs text-emerald-900 space-y-2">
        <div className="flex items-center gap-2 font-bold text-emerald-800 text-sm">
          <Leaf className="w-4 h-4 text-emerald-600" />
          UN Sustainable Development Goals (SDG) Alignment
        </div>
        <ul className="list-disc list-inside space-y-1 text-emerald-800">
          <li><strong>SDG 11 (Sustainable Cities and Communities)</strong>: Reducing adverse municipal per-capita environmental impact through active C&D waste diversion.</li>
          <li><strong>SDG 12 (Responsible Consumption and Production)</strong>: Substantially reducing waste generation through prevention, reduction, recycling, and reuse.</li>
          <li><strong>SDG 13 (Climate Action)</strong>: Mitigating embodied greenhouse gas emissions from virgin cement manufacturing and steel smelting.</li>
        </ul>
      </div>
    </div>
  );
};

export const ContactPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [msg, setMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="font-display font-extrabold text-3xl text-[#252536]">
          Contact CircuBuild Pune
        </h1>
        <p className="text-xs sm:text-sm text-[#8B8D98]">
          Have questions regarding surplus listings, builder verification, or academic research collaboration?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-5 bg-gradient-to-br from-[#7561A8] to-[#51416F] text-white p-6 sm:p-8 rounded-3xl shadow-lg space-y-6">
          <div>
            <h3 className="font-bold text-base mb-1">Regional Office & Support</h3>
            <p className="text-xs text-purple-200 leading-relaxed">
              Operating across the Pune Metropolitan Region Development Authority (PMRDA) corridor.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#72B9E8] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white">Pune Coordination Cell</strong>
                <p className="text-purple-200">Shivajinagar Institutional Zone, Pune, Maharashtra 411005</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-[#72B9E8] shrink-0" />
              <span>circubuild.pune@gmail.com</span>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-[#72B9E8] shrink-0" />
              <span>+91 98220 11442 / +91 94223 99881</span>
            </div>
          </div>

          <div className="pt-4 border-t border-white/20 text-[11px] text-purple-200">
            Support Hours: Monday – Saturday, 8:00 AM – 7:00 PM IST
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs">
          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-base text-[#252536]">Message Transmitted!</h3>
              <p className="text-xs text-[#8B8D98]">
                Thank you for contacting us. Our Pune engineering support desk will reply within 24 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-2 text-xs font-bold text-[#7561A8] hover:underline"
              >
                Send Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#252536]">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Er. Rajesh Patil"
                    className="w-full bg-[#F1F2F5] text-xs text-[#252536] p-2.5 rounded-xl border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#252536]">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rajesh@firm.in"
                    className="w-full bg-[#F1F2F5] text-xs text-[#252536] p-2.5 rounded-xl border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#252536]">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Listing 500 Cement Bags in Hinjawadi"
                  className="w-full bg-[#F1F2F5] text-xs text-[#252536] p-2.5 rounded-xl border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#252536]">Inquiry Details</label>
                <textarea
                  rows={4}
                  required
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder="Provide your site address or specific material questions..."
                  className="w-full bg-[#F1F2F5] text-xs text-[#252536] p-2.5 rounded-xl border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm bg-[#7561A8] hover:bg-[#51416F] text-white shadow-md shadow-[#7561A8]/30 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Submit Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
