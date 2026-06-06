export default function PlayerVideo({ url }) {
  const youtubeId = extrairIdYoutube(url);

  if (youtubeId) {
    return (
      <div className="relative w-full pt-[56.25%] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}`}
          className="absolute top-0 left-0 w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <video 
      src={url} 
      controls 
      className="w-full rounded-2xl shadow-xl bg-slate-900"
    />
  );
}

function extrairIdYoutube(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
  return match ? match[1] : null;
}