/* =========================================================
   BOOST ATHLETICS — main.js
   Handles: nav, mobile menu, product image
   carousel, product modal, scroll reveal
   ========================================================= */

(function () {
  'use strict';

  /* -------------------------------------------------------
     Smooth scroll to a section by id
  ------------------------------------------------------- */
  function scrollTo(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = document.querySelector('.site-header').offsetHeight;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  /* -------------------------------------------------------
     Navigation — plain scroll links
  ------------------------------------------------------- */
  document.querySelectorAll('[data-scroll]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      const id = el.dataset.scroll;
      closeMobileNav();
      scrollTo(id);
    });
  });

  /* -------------------------------------------------------
     Cart icon → scroll to products
  ------------------------------------------------------- */
  const cartBtn = document.getElementById('cartBtn');
  if (cartBtn) {
    cartBtn.addEventListener('click', function () { scrollTo('products'); });
  }

  /* -------------------------------------------------------
     Mobile hamburger / drawer
  ------------------------------------------------------- */
  const hamburger  = document.getElementById('hamburger');
  const mobileNav  = document.getElementById('mobileNav');

  function closeMobileNav() {
    if (!hamburger || !mobileNav) return;
    hamburger.classList.remove('open');
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function () {
      const isOpen = mobileNav.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
      if (isOpen) {
        // Position drawer flush with bottom of sticky header
        const headerEl = document.querySelector('.site-header');
        if (headerEl) {
          mobileNav.style.top = headerEl.getBoundingClientRect().bottom + 'px';
        }
      }
    });
  }

  /* -------------------------------------------------------
     Product image carousel (within product cards)
  ------------------------------------------------------- */
  document.querySelectorAll('.product-img-wrap').forEach(function (wrap) {
    const imgs = wrap.querySelectorAll('img');
    if (imgs.length < 2) return; // nothing to carousel

    const prev = wrap.querySelector('.img-nav.prev');
    const next = wrap.querySelector('.img-nav.next');
    const dots = wrap.querySelectorAll('.img-dot');
    let current = 0;

    function showImg(idx) {
      imgs[current].classList.remove('active');
      dots[current] && dots[current].classList.remove('active');
      current = (idx + imgs.length) % imgs.length;
      imgs[current].classList.add('active');
      dots[current] && dots[current].classList.add('active');
    }

    if (prev) prev.addEventListener('click', function (e) { e.stopPropagation(); showImg(current - 1); });
    if (next) next.addEventListener('click', function (e) { e.stopPropagation(); showImg(current + 1); });

    /* Touch swipe on image */
    let touchStartX = 0;
    wrap.addEventListener('touchstart', function (e) { touchStartX = e.touches[0].clientX; }, { passive: true });
    wrap.addEventListener('touchend',   function (e) {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) showImg(current + (diff > 0 ? 1 : -1));
    });
  });

  /* -------------------------------------------------------
     Product Modal
  ------------------------------------------------------- */
  const modalOverlay = document.getElementById('productModal');
  const modalClose   = document.getElementById('modalClose');
  const modalImg     = document.getElementById('modalImg');
  const modalTitle   = document.getElementById('modalTitle');
  const modalSub     = document.getElementById('modalSub');
  const modalDesc    = document.getElementById('modalDesc');
  const modalSale    = document.getElementById('modalPriceSale');
  const modalCta     = document.getElementById('modalCta');
  const modalPrev    = document.getElementById('modalPrev');
  const modalNext    = document.getElementById('modalNext');
  const modalDots    = document.getElementById('modalDots');

  let modalImages  = [];
  let modalImgIdx  = 0;

  function showModalImg(idx) {
    modalImgIdx = (idx + modalImages.length) % modalImages.length;
    modalImg.src = modalImages[modalImgIdx];
    Array.from(modalDots.children).forEach(function (d, i) {
      d.classList.toggle('active', i === modalImgIdx);
    });
  }

  if (modalPrev) modalPrev.addEventListener('click', function (e) { e.stopPropagation(); showModalImg(modalImgIdx - 1); });
  if (modalNext) modalNext.addEventListener('click', function (e) { e.stopPropagation(); showModalImg(modalImgIdx + 1); });

  /* Touch swipe in product modal */
  var modalTouchX = 0;
  if (modalImg) {
    modalImg.addEventListener('touchstart', function (e) { modalTouchX = e.touches[0].clientX; }, { passive: true });
    modalImg.addEventListener('touchend', function (e) {
      var diff = modalTouchX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) showModalImg(modalImgIdx + (diff > 0 ? 1 : -1));
    });
  }

  function openModal(data) {
    if (!modalOverlay) return;
    // Parse images
    var imgs = data.imgs ? data.imgs.split('|') : [data.img];
    modalImages = imgs;
    modalImgIdx = 0;
    // Build dots
    modalDots.innerHTML = '';
    var multiImg = imgs.length > 1;
    if (multiImg) {
      imgs.forEach(function () {
        var d = document.createElement('span');
        d.className = 'img-dot';
        modalDots.appendChild(d);
      });
    }
    modalDots.style.display    = multiImg ? '' : 'none';
    modalPrev.style.display    = multiImg ? '' : 'none';
    modalNext.style.display    = multiImg ? '' : 'none';
    showModalImg(0);
    modalImg.alt            = data.name;
    modalTitle.textContent  = data.name;
    modalSub.textContent    = data.sub;
    modalDesc.textContent   = data.desc;
    modalSale.textContent   = data.salePrice;
    modalCta.href           = 'http://facebook.com/boostathleticstx';
    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (modalClose)   modalClose.addEventListener('click', closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', function (e) {
      if (e.target === modalOverlay) closeModal();
    });
  }

  // Keyboard close
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeModal(); closeGoalModal(); }
  });

  /* Attach open-modal to each product card */
  document.querySelectorAll('.product-card[data-product]').forEach(function (card) {
    card.addEventListener('click', function () {
      if (card.classList.contains('coming-soon')) return;
      const d = card.dataset;
      openModal({
        img:       d.img,
        imgs:      d.imgs,
        name:      d.name,
        sub:       d.sub,
        desc:      d.desc,
        salePrice: d.sale,
      });
    });
  });

  /* -------------------------------------------------------
     Goal Coming Soon Modal
  ------------------------------------------------------- */
  const goalModal      = document.getElementById('goalModal');
  const goalModalClose = document.getElementById('goalModalClose');
  const goalModalImg   = document.getElementById('goalModalImg');
  const goalModalBadge = document.getElementById('goalModalBadge');
  const goalModalTitle = document.getElementById('goalModalTitle');
  const goalModalDesc  = document.getElementById('goalModalDesc');
  const goalModalRecs  = document.getElementById('goalModalRecs');
  const goalModalCta   = document.getElementById('goalModalCta');

  function openGoalModal(data) {
    if (!goalModal) return;
    goalModalImg.src           = data.img;
    goalModalTitle.textContent = data.title;
    goalModalDesc.textContent  = data.desc;
    goalModalRecs.textContent  = data.recs;
    if (data.isComingSoon) {
      goalModalBadge.style.display = '';
      goalModalCta.href            = 'http://facebook.com/boostathleticstx';
      goalModalCta.setAttribute('target', '_blank');
      goalModalCta.setAttribute('rel', 'noopener noreferrer');
      goalModalCta.textContent     = 'Stay Updated on Facebook';
    } else {
      goalModalBadge.style.display = 'none';
      goalModalCta.href            = '#products';
      goalModalCta.removeAttribute('target');
      goalModalCta.removeAttribute('rel');
      goalModalCta.textContent     = 'Shop Now';
    }
    goalModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeGoalModal() {
    if (!goalModal) return;
    goalModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (goalModalClose) goalModalClose.addEventListener('click', closeGoalModal);
  if (goalModal) {
    goalModal.addEventListener('click', function (e) {
      if (e.target === goalModal) closeGoalModal();
    });
  }

  // "Shop Now" CTA on goal modal → close & scroll
  if (goalModalCta) {
    goalModalCta.addEventListener('click', function (e) {
      if (goalModalCta.getAttribute('href') === '#products') {
        e.preventDefault();
        closeGoalModal();
        scrollTo('products');
      }
    });
  }

  /* Goal cards 01-04 — open modal with model photo */
  document.querySelectorAll('.goal-card:not(.coming-soon)').forEach(function (card) {
    card.style.cursor = 'pointer';
    card.addEventListener('click', function () {
      const bgEl    = card.querySelector('.goal-card-bg');
      const bgStyle = bgEl ? bgEl.style.backgroundImage : '';
      const img     = bgStyle.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
      const body    = card.querySelector('.goal-card-body');
      const title   = body.querySelector('.goal-title').textContent;
      const desc    = body.querySelector('.goal-desc').textContent.trim();
      const recs    = body.querySelector('.goal-recs').textContent;
      openGoalModal({ img: img, title: title, desc: desc, recs: recs, isComingSoon: false });
    });
  });

  /* Goal cards 05-08 — coming soon modal */
  document.querySelectorAll('.goal-card.coming-soon').forEach(function (card) {
    card.addEventListener('click', function () {
      const body  = card.querySelector('.goal-card-body');
      const title = body.querySelector('.goal-title').textContent;
      const desc  = body.querySelector('.goal-desc').textContent;
      const recs  = body.querySelector('.goal-recs').textContent;
      openGoalModal({ img: 'Assets/Coming Soon Website Part.png', title: title, desc: desc, recs: recs, isComingSoon: true });
    });
  });

  /* -------------------------------------------------------
     Scroll Reveal (Intersection Observer)
  ------------------------------------------------------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    // Fallback — just reveal immediately
    revealEls.forEach(function (el) { el.classList.add('revealed'); });
  }

}());
