export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="flex space-x-2 mb-4">
        <div
          className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
          style={{ animationDelay: "0s" }}
        ></div>
        <div
          className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
          style={{ animationDelay: "0.2s" }}
        ></div>
        <div
          className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
          style={{ animationDelay: "0.4s" }}
        ></div>
      </div>
      <p className="text-gray-600 font-medium">メッセージを読み込み中...</p>
    </div>
  );
}
