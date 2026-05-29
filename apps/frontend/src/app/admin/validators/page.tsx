'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';

export default function AdminValidatorsPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">Validators</h1>
        <p className="text-slate-600 dark:text-slate-400">Manage medical validators</p>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>Validators List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 dark:text-slate-400">Validator management coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}