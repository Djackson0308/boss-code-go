(function () {
  'use strict';
  const posters = {
    'https://boss-code-go-api.dezthareason4ever.workers.dev/media/videos/705a0680-ca26-48bf-8534-65a8372378a9.mp4': 'images/quick-decisions/705a0680-ca26-48bf-8534-65a8372378a9.jpg',
    'https://boss-code-go-api.dezthareason4ever.workers.dev/media/videos/63df65a5-e1d8-48da-a431-045a4437f622.mp4': 'images/quick-decisions/63df65a5-e1d8-48da-a431-045a4437f622.jpg'
  };
  const fallback = 'images/quick-decisions/video-preview.svg';
  function candidates(video, source) {
    const custom = [video.thumbnailUrl, video.thumbnail_url, video.poster_url, video.posterUrl].filter(value =>
      typeof value === 'string' && value.trim() && !/(?:^|\/)boss-code-go-logo\.png(?:[?#]|$)/i.test(value)
    );
    const id = window.BossVideo.youtube(source);
    return [...new Set([...custom, posters[source], id && `https://img.youtube.com/vi/${id}/hqdefault.jpg`, fallback].filter(Boolean))];
  }
  function attach(image, video, source) {
    const urls = candidates(video, source);
    let index = 0;
    image.addEventListener('error', () => {
      if (index + 1 < urls.length) image.src = urls[++index];
    });
    image.src = urls[0];
  }
  window.BossQuickThumbnail = { candidates, attach };
})();
