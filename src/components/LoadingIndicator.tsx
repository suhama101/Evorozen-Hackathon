/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';

interface LoadingIndicatorProps {
  message: string;
}

export default function LoadingIndicator({ message }: LoadingIndicatorProps) {
  const dotTransition = {
    duration: 0.5,
    repeat: Infinity,
    repeatType: 'reverse' as const,
    ease: 'easeInOut',
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="flex space-x-2.5 mb-5 items-center">
        <motion.div
          className="w-3.5 h-3.5 bg-[#7c6bff] rounded-full"
          animate={{ y: [0, -10, 0] }}
          transition={{ ...dotTransition, delay: 0 }}
        />
        <motion.div
          className="w-3.5 h-3.5 bg-[#7c6bff]/80 rounded-full"
          animate={{ y: [0, -10, 0] }}
          transition={{ ...dotTransition, delay: 0.15 }}
        />
        <motion.div
          className="w-3.5 h-3.5 bg-[#7c6bff]/60 rounded-full"
          animate={{ y: [0, -10, 0] }}
          transition={{ ...dotTransition, delay: 0.3 }}
        />
      </div>
      <p className="text-gray-400 text-sm font-medium tracking-wide animate-pulse">
        {message}
      </p>
    </div>
  );
}
