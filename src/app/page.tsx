import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Healthcare Portal
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Manage patients, claims, and sync data efficiently
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Link
            href="/patients"
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
          >
            <div className="text-center">
              <div className="text-3xl text-blue-600 mb-4">👥</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Patients</h2>
              <p className="text-gray-600">
                View and manage patient information, add new patients
              </p>
            </div>
          </Link>
          
          <Link
            href="/claims"
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
          >
            <div className="text-center">
              <div className="text-3xl text-green-600 mb-4">📋</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Claims</h2>
              <p className="text-gray-600">
                Manage insurance claims, update statuses, and track progress
              </p>
            </div>
          </Link>
          
          <Link
            href="/sync"
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
          >
            <div className="text-center">
              <div className="text-3xl text-purple-600 mb-4">🔄</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Sync</h2>
              <p className="text-gray-600">
                Synchronize data with Google Sheets and external systems
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
