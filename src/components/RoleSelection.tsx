/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { ROLES, RoleId, RoleInfo } from '../types';
import { Briefcase, Code, Cpu, Database, Layout, Settings } from 'lucide-react';

interface RoleSelectionProps {
  onSelectRole: (roleId: RoleId) => void;
}

const iconMapRecord: Record<RoleId, any> = {
  software_engineer: Briefcase,
  frontend_developer: Layout,
  full_stack_developer: Code,
  data_scientist: Database,
  product_manager: Cpu,
  devops_engineer: Settings,
};

export default function RoleSelection({ onSelectRole }: RoleSelectionProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <span className="px-3 py-1 text-xs font-semibold tracking-wider text-[#7c6bff] uppercase bg-[#7c6bff]/10 rounded-full border border-[#7c6bff]/20">
            Mock AI Scenario
          </span>
          <h1 className="mt-4 text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Select Your Target Role
          </h1>
          <p className="mt-3 text-base text-gray-400 max-w-xl mx-auto">
            Choose a domain to start a professional 5-question mock interview. Questions adjust iteratively to evaluate your depth.
          </p>
        </motion.div>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {ROLES.map((role: RoleInfo) => {
          const IconComponent = iconMapRecord[role.id] || Briefcase;
          return (
            <motion.button
              key={role.id}
              id={`role-btn-${role.id}`}
              onClick={() => onSelectRole(role.id)}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group flex flex-col justify-between p-6 rounded-2xl bg-[#13131a] border border-gray-800/60 text-left cursor-pointer transition-colors duration-200 hover:border-[#7c6bff]/45 hover:bg-[#13131a]/95 focus:outline-none focus:ring-2 focus:ring-[#7c6bff]/50"
            >
              <div>
                <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-[#7c6bff]/10 border border-[#7c6bff]/20 text-[#7c6bff] mb-4 group-hover:bg-[#7c6bff]/20 transition-all">
                  <IconComponent className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-100 group-hover:text-white transition-colors">
                  {role.title}
                </h3>
                <p className="mt-2 text-sm text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                  {role.description}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-1.5 pt-4 border-t border-gray-800/40 w-full">
                {role.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="inline-block text-[11px] font-medium px-2 py-0.5 rounded bg-gray-800/80 text-gray-400 border border-gray-700/50"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
