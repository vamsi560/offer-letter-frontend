import React from 'react'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <Skeleton height={40} width={300} />
        <Skeleton height={48} width={200} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="stat-card">
            <Skeleton height={48} width={100} />
            <Skeleton height={20} width={150} className="mt-4" />
          </div>
        ))}
      </div>
      <div className="card">
        <Skeleton height={32} width={200} className="mb-6" />
        <Skeleton height={400} />
      </div>
    </div>
  )
}

export const FormSkeleton = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {[1, 2, 3].map((i) => (
        <div key={i} className="card">
          <Skeleton height={32} width={200} className="mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((j) => (
              <Skeleton key={j} height={48} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default DashboardSkeleton
