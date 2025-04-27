export default function ScoreDisplay({ score }) {
  return (
    <div className="p-6 bg-white shadow rounded-lg text-center">
      <h2 className="text-2xl font-semibold text-gray-800">
        Health Readiness Score
      </h2>
      <p className="mt-4 text-5xl font-bold text-green-600">{score}</p>
    </div>
  );
}
