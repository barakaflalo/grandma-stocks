/* ── AppNest · Cloudflare Pages fix (Oct 2026) ──
   Cloudflare redirects *.html to clean URLs (/index.html -> /). Chrome refuses a
   "redirected" response that a Service Worker hands to a page load (ERR_FAILED).
   This strips the redirect flag from every response the SW fetches or reads from cache. */
(function(){
  var NB={101:1,204:1,205:1,304:1};
  function clean(r){
    if(!r||!r.redirected||NB[r.status])return r;
    return r.blob().then(function(b){return new Response(b,{status:r.status,statusText:r.statusText,headers:r.headers});});
  }
  var _fetch=self.fetch.bind(self);
  self.fetch=function(input,init){
    if(input&&typeof input==='object'&&input.mode==='navigate')input=input.url;
    return _fetch(input,init).then(clean);
  };
  var cm=Cache.prototype.match;
  Cache.prototype.match=function(){return cm.apply(this,arguments).then(clean);};
  var sm=CacheStorage.prototype.match;
  CacheStorage.prototype.match=function(){return sm.apply(this,arguments).then(clean);};
})();

/* Grandma's Stock Market — AppNest service worker (network-first shell) */
const VERSION = "grandmastocks-v2";
const CORE = ["./", "./manifest.json", "./icon-192.png", "./icon-512.png",
  "./art/bm_forecast.webp",
  "./art/bm_limit.webp",
  "./art/bm_rumor.webp",
  "./art/char_doctor.webp",
  "./art/char_f_hana.webp",
  "./art/char_f_mazal.webp",
  "./art/char_f_miri.webp",
  "./art/char_f_nurse.webp",
  "./art/char_f_penina.webp",
  "./art/char_f_postman.webp",
  "./art/char_f_shimon.webp",
  "./art/char_f_yankale.webp",
  "./art/char_grandma.webp",
  "./art/char_grandson.webp",
  "./art/char_pickpocket.webp",
  "./art/char_rachel.webp",
  "./art/char_scammer.webp",
  "./art/char_whisperer.webp",
  "./art/end_broke.webp",
  "./art/end_win.webp",
  "./art/ev_brag.webp",
  "./art/ev_caught_thief.webp",
  "./art/ev_doctor.webp",
  "./art/ev_grandson.webp",
  "./art/ev_lucky_cash.webp",
  "./art/ev_lucky_certificate.webp",
  "./art/ev_pick.webp",
  "./art/ev_quiet.webp",
  "./art/ev_rain.webp",
  "./art/ev_scam.webp",
  "./art/home_hero.webp",
  "./art/loc_bench.webp",
  "./art/loc_clinic.webp",
  "./art/loc_club.webp",
  "./art/loc_grocery.webp",
  "./art/loc_home.webp",
  "./art/loc_mall.webp",
  "./art/loc_market.webp",
  "./art/loc_post.webp",
  "./art/loc_salon.webp",
  "./art/map_hood.webp",
  "./art/prot_amulet.webp",
  "./art/prot_note.webp",
  "./art/prot_purse.webp",
  "./art/prot_shoes.webp",
  "./art/rank_1.webp",
  "./art/rank_2.webp",
  "./art/rank_3.webp",
  "./art/rank_4.webp",
  "./art/rank_5.webp",
  "./art/stock_antenna.webp",
  "./art/stock_bags.webp",
  "./art/stock_borekas.webp",
  "./art/stock_cane.webp",
  "./art/stock_coffee.webp",
  "./art/stock_dentures.webp",
  "./art/stock_remedy.webp",
  "./art/stock_socks.webp",
  "./art/up_bus.webp",
  "./art/up_hidden.webp",
  "./art/up_taxi.webp",
  "./art/up_walk.webp",
  "./art/veh_bus.webp",
  "./art/veh_taxi.webp",
  "./art/veh_walk.webp"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).catch(()=>{}));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== VERSION).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    fetch(req)
      .then(res => {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put(req, copy)).catch(()=>{});
        return res;
      })
      .catch(() => caches.match(req, {ignoreSearch:true}).then(r => r || (req.mode === "navigate" ? caches.match("./") : undefined)))
  );
});
