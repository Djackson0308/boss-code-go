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
      if (active.id === 'the-code-clothing-screen') {
        if (active.querySelector('#clothing-cart-panel.show')) closeClothingCart();
        else if (active.querySelector('#clothing-detail.show')) {
          const backToShop = active.querySelector('#clothing-back-to-shop');
          if (backToShop) backToShop.click(); else openClothingStore();
        } else $('the-code-clothing-back').click();
        return true;
      }
      const back = active.querySelector('.back-button,.return-home-button,.go-list-back,.contact-back,#boss-internal-back');
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

// Native-only license documentation; existing legal screen remains the entry point.
GO_LEGAL_DOCS.terms.sections.push(['OPEN-SOURCE SOFTWARE: MAPLIBRE', "Copyright (c) 2023, MapLibre contributors\n\nAll rights reserved.\n\nRedistribution and use in source and binary forms, with or without modification,\nare permitted provided that the following conditions are met:\n\n    * Redistributions of source code must retain the above copyright notice,\n      this list of conditions and the following disclaimer.\n    * Redistributions in binary form must reproduce the above copyright notice,\n      this list of conditions and the following disclaimer in the documentation\n      and/or other materials provided with the distribution.\n    * Neither the name of MapLibre GL JS nor the names of its contributors\n      may be used to endorse or promote products derived from this software\n      without specific prior written permission.\n\nTHIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS\n\"AS IS\" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT\nLIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR\nA PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR\nCONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,\nEXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,\nPROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR\nPROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF\nLIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING\nNEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS\nSOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.\n\n\n-------------------------------------------------------------------------------\n\nContains code from mapbox-gl-js v1.13 and earlier\n\nVersion v1.13 of mapbox-gl-js and earlier are licensed under a BSD-3-Clause license\n\nCopyright (c) 2020, Mapbox\nRedistribution and use in source and binary forms, with or without modification,\nare permitted provided that the following conditions are met:\n\n* Redistributions of source code must retain the above copyright notice,\n  this list of conditions and the following disclaimer.\n* Redistributions in binary form must reproduce the above copyright notice,\n  this list of conditions and the following disclaimer in the documentation\n  and/or other materials provided with the distribution.\n* Neither the name of Mapbox GL JS nor the names of its contributors\n  may be used to endorse or promote products derived from this software\n  without specific prior written permission.\n\nTHIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS\n\"AS IS\" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT\nLIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR\nA PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR\nCONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,\nEXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,\nPROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR\nPROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF\nLIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING\nNEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,\nEVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.\n\n\n-------------------------------------------------------------------------------\n\nContains code from glfx.js\n\nCopyright (C) 2011 by Evan Wallace\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the \"Software\"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in\nall copies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\nTHE SOFTWARE.\n\n--------------------------------------------------------------------------------\n\nContains a portion of d3-color https://github.com/d3/d3-color\n\nCopyright 2010-2016 Mike Bostock\nAll rights reserved.\n\nRedistribution and use in source and binary forms, with or without modification,\nare permitted provided that the following conditions are met:\n\n* Redistributions of source code must retain the above copyright notice, this\n  list of conditions and the following disclaimer.\n\n* Redistributions in binary form must reproduce the above copyright notice,\n  this list of conditions and the following disclaimer in the documentation\n  and/or other materials provided with the distribution.\n\n* Neither the name of the author nor the names of contributors may be used to\n  endorse or promote products derived from this software without specific prior\n  written permission.\n\nTHIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS \"AS IS\" AND\nANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED\nWARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE\nDISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR\nANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES\n(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;\nLOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON\nANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT\n(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS\nSOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.\n"]);

// Verified privacy disclosure update for the next native build; no tracking claim.
GO_LEGAL_DOCS.privacy.sections = GO_LEGAL_DOCS.privacy.sections.map(([heading,body]) => {
  if (heading === 'SERVICE PROVIDERS') body = 'GO uses providers including Cloudflare for hosting and storage, Resend for email delivery, Stripe for payments, and embedded media and map providers. Embedded services may collect information when loaded or played and process it under their own privacy terms. The current published policy describes these integrations: https://djackson0308.github.io/boss-code-go/privacy.html';
  if (heading === 'ANALYTICS AND DEVICE STORAGE') body = 'GO stores persistent visitor and session identifiers and records app interactions and promotional impressions or clicks. These records may be linked to an account. Network information may be used to derive approximate city, region and country for analytics. This is distinct from precise GPS location.';
  return [heading,body];
});
GO_LEGAL_DOCS.privacy.sections.push(['PROMOTIONAL EMAIL CHOICES','Promotional emails require a recorded affirmative opt-in. Creating an account, making a purchase or appearing in the contact database does not grant marketing consent. GO records the choice, notice version and time. Withdraw consent through the unsubscribe link or https://boss-code-go-api.dezthareason4ever.workers.dev/go/email-preferences. Authentication and transactional messages remain separate.']);
