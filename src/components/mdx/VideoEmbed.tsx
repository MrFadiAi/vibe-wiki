"use client";

interface VideoEmbedProps {
  url: string;
  title?: string;
}

function extractVideoId(url: string): { platform: "youtube" | "vimeo" | null; id: string | null } {
  // YouTube patterns
  const youtubePatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  
  for (const pattern of youtubePatterns) {
    const match = url.match(pattern);
    if (match) {
      return { platform: "youtube", id: match[1] };
    }
  }
  
  // Vimeo patterns
  const vimeoPattern = /(?:vimeo\.com\/)(\d+)/;
  const vimeoMatch = url.match(vimeoPattern);
  if (vimeoMatch) {
    return { platform: "vimeo", id: vimeoMatch[1] };
  }
  
  return { platform: null, id: null };
}

export function VideoEmbed({ url, title = "فيديو مضمن" }: VideoEmbedProps) {
  const { platform, id } = extractVideoId(url);
  
  if (!platform || !id) {
    return (
      <div className="my-8 p-6 rounded-2xl glass border border-destructive/30 text-center">
        <p className="text-destructive">رابط الفيديو غير صالح</p>
        <p className="text-sm text-muted-foreground mt-2">{url}</p>
      </div>
    );
  }
  
  const embedUrl = platform === "youtube"
    ? `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`
    : `https://player.vimeo.com/video/${id}?title=0&byline=0&portrait=0`;
  
  return (
    <div className="my-8 group">
      {/* Title bar if provided */}
      {title && (
        <div className="flex items-center gap-3 px-4 py-2 rounded-t-2xl bg-secondary/80 border border-b-0 border-border">
          <svg className="w-5 h-5 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm text-foreground font-medium">{title}</span>
          <span className="px-2 py-0.5 text-xs font-medium text-neon-purple bg-neon-purple/10 rounded-full border border-neon-purple/20 capitalize">
            {platform}
          </span>
        </div>
      )}
      
      {/* Video container with 16:9 aspect ratio */}
      <div className={`relative w-full overflow-hidden glass border border-border ${title ? 'rounded-b-2xl border-t-0' : 'rounded-2xl'}`}
        style={{ paddingTop: "56.25%" }} // 16:9 aspect ratio
      >
        <iframe
          src={embedUrl}
          title={title}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </div>
  );
}

export default VideoEmbed;
