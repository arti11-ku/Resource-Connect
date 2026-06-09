import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface TermsModalProps {
  open: boolean;
  title?: "Terms & Conditions" | "Privacy Policy";
  onClose: () => void;
  onAccept: () => void;
}

const TERMS_BODY = `
Welcome to Sahara — Smart Resource Allocation System.

1. Acceptance of Terms
By accessing or using the Sahara platform, you agree to be bound by these Terms & Conditions and our Privacy Policy. If you do not agree, you must not use the service.

2. Eligibility
You must be at least 16 years old to register. By creating an account, you confirm that the information you provide is accurate and up to date.

3. User Responsibilities
You are responsible for all activity on your account. Keep your credentials confidential and notify us of any unauthorized access. Do not misuse the platform, attempt to disrupt the service, or upload unlawful content.

4. Role-Specific Duties
Reporters, NGOs, Volunteers, Donors, and Administrators each have distinct responsibilities. Misrepresentation of role or identity is strictly prohibited.

5. Data & Privacy
We collect only the information necessary to operate the platform and allocate resources effectively. See the Privacy Policy for details on storage, use, and your rights.

6. Donations & Contributions
All donations are voluntary. Sahara does not guarantee specific outcomes but commits to transparent allocation and reporting.

7. Intellectual Property
All content, trademarks, and materials on the platform are owned by Sahara or its partners and may not be copied without permission.

8. Limitation of Liability
Sahara provides the platform "as is" without warranties of any kind. To the maximum extent permitted by law, we are not liable for indirect or consequential damages.

9. Termination
We may suspend or terminate accounts that violate these terms, at our discretion.

10. Changes
We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the updated terms.

By checking the box below, you acknowledge that you have read and agree to these Terms & Conditions and the Privacy Policy.
`.trim();

export default function TermsModal({ open, title = "Terms & Conditions", onClose, onAccept }: TermsModalProps) {
  const [checked, setChecked] = useState(false);

  // Reset the checkbox whenever the modal is re-opened.
  useEffect(() => {
    if (open) setChecked(false);
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal box */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="terms-modal-title"
            className="relative bg-white rounded-2xl shadow-2xl border border-orange-100 w-full max-w-md overflow-hidden"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="h-1.5 w-full"
              style={{ background: "linear-gradient(90deg, #FF7A00, #FFB347, #FF7A00)" }}
            />

            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <h3 id="terms-modal-title" className="text-base font-bold text-gray-900">{title}</h3>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-orange-500 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-5 pb-3">
              <div className="max-h-64 overflow-y-auto pr-2 text-xs text-gray-600 leading-relaxed whitespace-pre-line border border-orange-100 rounded-xl p-3 bg-orange-50/30">
                {TERMS_BODY}
              </div>

              <label className="flex items-start gap-2 mt-4 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={e => setChecked(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-orange-500 rounded"
                />
                <span className="text-xs text-gray-700">
                  I agree to the Terms &amp; Conditions
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-2 px-5 py-4 bg-orange-50/30 border-t border-orange-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <motion.button
                type="button"
                disabled={!checked}
                onClick={() => { onAccept(); onClose(); }}
                whileHover={checked ? { scale: 1.03 } : {}}
                whileTap={checked ? { scale: 0.97 } : {}}
                className="px-5 py-2 rounded-xl text-white text-sm font-semibold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #FF7A00, #FF9A40)" }}
              >
                Accept
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
