import {motion} from 'framer-motion';

export const Select: React.FC<{
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  error?: string;
  required?: boolean;
}> = ({ label, value, onChange, options, placeholder, error, required }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      {label && (
        <label className="block text-sm text-white mb-2">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          w-full px-4 py-3 
          bg-[#00A63E]/5 border border-white/20
          rounded-lg text-white appearance-none
          focus:outline-none focus:border-green-600
          transition duration-300
          ${error ? 'border-red-500/50' : ''}
        `}
      >
        {placeholder && <option value="" className="bg-zinc-900 text-gray-400">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value} className="bg-zinc-900 text-white">
            {opt.label}
          </option>
        ))}
      </select>
       <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-400 text-sm mt-1"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
};