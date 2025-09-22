import React from 'react';

const ArticleCardSkeleton: React.FC = () => {
    return (
        <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 flex gap-4 animate-pulse">
            <div className="w-32 h-24 bg-gray-700/50 rounded-md flex-shrink-0"></div>
            <div className="flex-grow space-y-3 py-1">
                <div className="h-5 bg-gray-700/50 rounded w-3/4"></div>
                <div className="h-3 bg-gray-700/50 rounded w-1/4"></div>
                <div className="h-4 bg-gray-700/50 rounded w-full"></div>
                <div className="h-4 bg-gray-700/50 rounded w-5/6"></div>
            </div>
        </div>
    );
};

export default ArticleCardSkeleton;
