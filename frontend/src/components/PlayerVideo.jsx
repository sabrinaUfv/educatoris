export default function PlayerVideo({ url }) {
  const youtubeId = extrairIdYoutube(url);

  if (youtubeId) {
    return (
      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, marginBottom: '0.5rem' }}>
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}`}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return <video src={url} controls style={{ width: '100%', marginBottom: '0.5rem' }} />;
}

function extrairIdYoutube(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
  return match ? match[1] : null;
}
