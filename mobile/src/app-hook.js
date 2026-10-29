// Native staging hook only. The website's app.js is never modified by mobile builds.
window.BossGoNative = {
  async refresh() {
    await sync();
    await Promise.allSettled([goListLoadFeature(), goLoadChallenges(), goLoadActiveRun(), goLoadCommunityPreview(), goLoadDecisionMakersMonth()]);
    if (goListScreen.classList.contains('active-screen')) {
      if (!document.querySelector('#go-list-detail').hidden && window.BossGoNative.detailSlug) await goListOpenDetail(window.BossGoNative.detailSlug);
      else await goListFetch(true);
    }
  },
  back() {
    const closers = [
      ['#go-auth-overlay.open', () => document.querySelector('#go-auth-overlay').classList.remove('open')],
      ['#go-challenge-overlay.open', () => goClose()],
      ['#daily-decision-modal.open', () => closeDaily(false)],
      ['#boss-demographics-overlay.open', () => document.querySelector('#boss-demographics-overlay').classList.remove('open')],
      ['#boss-promo-ad-overlay.show', () => document.querySelector('#boss-promo-ad-close')?.click()]
    ];
    const dialog = document.querySelector('dialog[open]');
    if (dialog) { dialog.close(); return true; }
    for (const [selector, close] of closers) if (document.querySelector(selector)) { close(); return true; }
    if (!goListScreen.hidden && goListScreen.classList.contains('active-screen') && !document.querySelector('#go-list-detail').hidden) { goListBackToBrowse(); return true; }
    const active = document.querySelector('.screen.active-screen');
    if (active && active.id !== 'home-screen') {
      const back = active.querySelector('.back-button,.return-home-button,.go-list-back,.contact-back');
      if (back) back.click(); else showScreen(home);
      return true;
    }
    return false;
  }
};
const nativeOriginalGoListDetail = goListOpenDetail;
goListOpenDetail = async function (slug) {
  window.BossGoNative.detailSlug = slug;
  return nativeOriginalGoListDetail(slug);
};
