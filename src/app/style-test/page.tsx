export default function StyleTest() {
  return (
    <div className="min-h-screen bg-red-500 p-8">
      <div className="bg-blue-500 text-white p-4 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Style Test Page</h1>
        <p className="text-lg">If you can see this with colors and styling, Tailwind is working.</p>
        
        <div className="mt-6 space-y-4">
          <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors">
            Test Button
          </button>
          
          <div className="bg-yellow-200 text-yellow-800 p-3 rounded border-l-4 border-yellow-500">
            Test Alert Box
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-purple-500 h-20 rounded"></div>
            <div className="bg-pink-500 h-20 rounded"></div>
            <div className="bg-indigo-500 h-20 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
