import { motion } from "framer-motion";
import { Link } from "wouter";
import { Mail, Phone, MapPin, Linkedin, Github, Twitter, Heart } from "lucide-react";

const quickLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Report Issue", href: "/reporter-dashboard" },
  { label: "About", href: "/" },
  { label: "Contact", href: "/" },
];

const socials = [
  { Icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn", color: "hover:bg-[#0A66C2]" },
  { Icon: Github, href: "https://github.com", label: "GitHub", color: "hover:bg-gray-800" },
  { Icon: Twitter, href: "https://twitter.com", label: "Twitter", color: "hover:bg-black" },
];

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mt-auto w-full relative"
      style={{
        background: "linear-gradient(180deg, #FFF1E0 0%, #FFE2C2 100%)",
        borderTop: "1px solid rgba(255,154,64,0.3)",
      }}
    >
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-3/4 max-w-5xl"
        style={{ background: "linear-gradient(90deg, transparent, #FF9A40, transparent)" }}
      />

      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold shadow-md"
              style={{ background: "linear-gradient(135deg, #FF7A00, #FF9A40)" }}
            >
              S
            </div>
            <span className="text-lg font-bold text-gray-800" style={{ fontFamily: "Poppins, sans-serif" }}>
              SAHARA
            </span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Smart Resource Allocation System connecting volunteers, NGOs, donors, and reporters
            to deliver humanitarian aid where it's needed most.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">
            Quick Links
          </h4>
          <ul className="space-y-2">
            {quickLinks.map(link => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="group inline-flex items-center text-sm text-gray-600 hover:text-orange-600 transition-colors"
                >
                  <span className="relative">
                    {link.label}
                    <span className="absolute left-0 -bottom-0.5 h-[1.5px] w-0 bg-orange-500 transition-all duration-300 group-hover:w-full" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">
            Contact
          </h4>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <Mail size={16} className="mt-0.5 text-orange-500 flex-shrink-0" />
              <a href="mailto:support@sahara.org" className="hover:text-orange-600 transition-colors">
                support@sahara.org
              </a>
            </li>
            <li className="flex items-start gap-2">
              <Phone size={16} className="mt-0.5 text-orange-500 flex-shrink-0" />
              <a href="tel:+911800000000" className="hover:text-orange-600 transition-colors">
                +91 1800 000 000
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 text-orange-500 flex-shrink-0" />
              <span>New Delhi, India</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">
            Follow Us
          </h4>
          <div className="flex gap-3">
            {socials.map(({ Icon, href, label, color }) => (
              <motion.a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                whileHover={{ y: -3, scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                className={`w-10 h-10 rounded-xl bg-white border border-orange-100 text-gray-600 hover:text-white flex items-center justify-center shadow-sm transition-colors ${color}`}
              >
                <Icon size={18} />
              </motion.a>
            ))}
          </div>
          <p className="mt-5 text-xs text-gray-500">
            Built with care for communities everywhere.
          </p>
        </div>
      </div>

      <div
        className="border-t border-orange-200/60 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-600"
        style={{ background: "rgba(255,255,255,0.4)" }}
      >
        <p>© {new Date().getFullYear()} SAHARA. All rights reserved.</p>
        <p className="flex items-center gap-1">
          Made with <Heart size={12} className="text-orange-500 fill-orange-500" /> for humanity
        </p>
      </div>
    </motion.footer>
  );
}
