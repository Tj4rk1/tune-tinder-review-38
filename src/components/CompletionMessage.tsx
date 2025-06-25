
import React from 'react';
import { CheckCircle, Headphones } from 'lucide-react';
import { Card } from '@/components/ui/card';

const CompletionMessage = () => {
  return (
    <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-2xl">
      <div className="p-8 text-center space-y-6">
        <div className="w-20 h-20 mx-auto bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">All Done!</h2>
          <p className="text-gray-300">
            You've reviewed all available tracks. Great work!
          </p>
        </div>
        
        <div className="flex items-center justify-center gap-2 text-gray-400">
          <Headphones className="w-5 h-5" />
          <span className="text-sm">Come back later for more music</span>
        </div>
      </div>
    </Card>
  );
};

export default CompletionMessage;
