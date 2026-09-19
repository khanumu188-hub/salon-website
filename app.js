/**
 * AURA LUXURY HAIR LOUNGE - MAIN CLIENT APPLICATION
 * Rich interactivity, Before/After Slider, Price Calculator, Theme Switcher & Filters
 */

// Toast notification helper
window.showToast = function(message) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>✨</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
};

document.addEventListener('DOMContentLoaded', () => {
  /* ==========================================================================
     1. THEME SWITCHER (LUXURY LIGHT / MIDNIGHT VELVET)
     ========================================================================== */
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const savedTheme = localStorage.getItem('aura-theme') || 'light';
  
  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    if (themeToggleBtn) themeToggleBtn.innerHTML = '☀️';
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    if (themeToggleBtn) themeToggleBtn.innerHTML = '🌙';
  }

  themeToggleBtn?.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('aura-theme', newTheme);
    themeToggleBtn.innerHTML = newTheme === 'dark' ? '☀️' : '🌙';
    window.showToast(`Switched to ${newTheme === 'dark' ? 'Midnight Velvet' : 'Champagne Light'} mode`);
  });

  /* ==========================================================================
     2. BEFORE & AFTER IMAGE COMPARISON SLIDER
     ========================================================================== */
  const comparisonContainer = document.getElementById('hair-comparison-container');
  const beforeImageLayer = document.getElementById('comparison-before-layer');
  const sliderHandle = document.getElementById('comparison-slider-handle');

  if (comparisonContainer && beforeImageLayer && sliderHandle) {
    let isDragging = false;

    const updateSliderPosition = (clientX) => {
      const rect = comparisonContainer.getBoundingClientRect();
      let offsetX = clientX - rect.left;
      
      // Clamp between 0 and rect.width
      offsetX = Math.max(0, Math.min(offsetX, rect.width));
      const percentage = (offsetX / rect.width) * 100;

      beforeImageLayer.style.width = `${percentage}%`;
      sliderHandle.style.left = `${percentage}%`;
    };

    const onPointerDown = (e) => {
      isDragging = true;
      updateSliderPosition(e.clientX || (e.touches && e.touches[0].clientX));
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      updateSliderPosition(e.clientX || (e.touches && e.touches[0].clientX));
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    comparisonContainer.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    comparisonContainer.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);
  }

  /* ==========================================================================
     3. LIVE SALON OPEN / CLOSED STATUS BADGE
     ========================================================================== */
  const checkSalonHours = () => {
    const statusDot = document.getElementById('salon-status-dot');
    const statusText = document.getElementById('salon-status-text');
    if (!statusDot || !statusText) return;

    const now = new Date();
    const day = now.getDay(); // 0 is Sunday, 1-6 is Mon-Sat
    const hour = now.getHours();

    let isOpen = false;
    let closingTime = "8:00 PM";

    if (day >= 1 && day <= 6) {
      // Mon-Sat: 9:00 AM - 8:00 PM
      if (hour >= 9 && hour < 20) {
        isOpen = true;
        closingTime = "8:00 PM";
      }
    } else if (day === 0) {
      // Sunday: 10:00 AM - 6:00 PM
      if (hour >= 10 && hour < 18) {
        isOpen = true;
        closingTime = "6:00 PM";
      }
    }

    if (isOpen) {
      statusDot.className = 'status-dot';
      statusText.innerHTML = `Open Now &bull; Closes at ${closingTime}`;
    } else {
      statusDot.className = 'status-dot closed';
      statusText.innerHTML = `Closed Now &bull; Opens tomorrow 9:00 AM`;
    }

    // Highlight today in hours table
    const tableRows = document.querySelectorAll('.hours-table tr');
    const dayIndices = [6, 0, 1, 2, 3, 4, 5]; // Mapping Sun=6, Mon=0...
    const todayIndex = dayIndices[day];
    if (tableRows[todayIndex]) {
      tableRows[todayIndex].classList.add('highlight-today');
    }
  };
  checkSalonHours();

  /* ==========================================================================
     4. SERVICE CATEGORY TABS FILTER
     ========================================================================== */
  const serviceTabs = document.querySelectorAll('.category-tabs .tab-btn');
  const serviceCards = document.querySelectorAll('.service-card');

  serviceTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      serviceTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.dataset.filter;

      serviceCards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  /* ==========================================================================
     5. INTERACTIVE PRICE & CUSTOM PACKAGE CALCULATOR
     ========================================================================== */
  const CalcState = {
    lengthPrice: 0,
    baseServicePrice: 85,
    baseServiceName: "Precision Cut & Finish",
    addons: []
  };

  const updateCalculatorUI = () => {
    // Length chip buttons
    document.querySelectorAll('[data-calc-length]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('[data-calc-length]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        CalcState.lengthPrice = parseFloat(btn.dataset.price);
        recalcTotals();
      });
    });

    // Base service chips
    document.querySelectorAll('[data-calc-service]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('[data-calc-service]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        CalcState.baseServicePrice = parseFloat(btn.dataset.price);
        CalcState.baseServiceName = btn.dataset.name;
        recalcTotals();
      });
    });

    // Add-on checkboxes
    document.querySelectorAll('.addon-row').forEach(row => {
      row.addEventListener('click', (e) => {
        row.classList.toggle('active');
        const id = row.dataset.id;
        const name = row.dataset.name;
        const price = parseFloat(row.dataset.price);

        if (row.classList.contains('active')) {
          CalcState.addons.push({ id, name, price });
        } else {
          CalcState.addons = CalcState.addons.filter(a => a.id !== id);
        }
        recalcTotals();
      });
    });

    const recalcTotals = () => {
      const lineItemsContainer = document.getElementById('calc-line-items');
      const totalDisplay = document.getElementById('calc-total-display');

      let html = `
        <div class="summary-item">
          <span>${CalcState.baseServiceName}</span>
          <span>$${CalcState.baseServicePrice}</span>
        </div>
      `;

      if (CalcState.lengthPrice > 0) {
        html += `
          <div class="summary-item">
            <span>Hair Length Supplement</span>
            <span>+$${CalcState.lengthPrice}</span>
          </div>
        `;
      }

      let addonsTotal = 0;
      CalcState.addons.forEach(item => {
        addonsTotal += item.price;
        html += `
          <div class="summary-item">
            <span>${item.name}</span>
            <span>+$${item.price}</span>
          </div>
        `;
      });

      const grandTotal = CalcState.baseServicePrice + CalcState.lengthPrice + addonsTotal;

      html += `
        <div class="summary-item total-row">
          <span>Estimated Total</span>
          <span class="summary-total-val">$${grandTotal}</span>
        </div>
      `;

      if (lineItemsContainer) lineItemsContainer.innerHTML = html;
      if (totalDisplay) totalDisplay.textContent = `$${grandTotal}`;
    };

    recalcTotals();

    // Book calculated package button
    document.getElementById('book-calculated-package-btn')?.addEventListener('click', () => {
      const grandTotal = CalcState.baseServicePrice + CalcState.lengthPrice + CalcState.addons.reduce((acc, i) => acc + i.price, 0);
      const fullPackageName = `Custom Package: ${CalcState.baseServiceName} (+${CalcState.addons.length} Add-ons)`;
      if (window.BookingApp) {
        window.BookingApp.openWithPreselectedService('custom-package', fullPackageName, `$${grandTotal}`);
      }
    });
  };
  updateCalculatorUI();

  /* ==========================================================================
     6. LOOKBOOK QUICK PREVIEW MODAL
     ========================================================================== */
  const lookbookModal = document.getElementById('lookbook-preview-modal');
  const previewImg = document.getElementById('lookbook-preview-img');
  const previewTitle = document.getElementById('lookbook-preview-title');
  const previewStylist = document.getElementById('lookbook-preview-stylist');
  const previewBookBtn = document.getElementById('lookbook-preview-book-btn');

  document.querySelectorAll('.lookbook-item').forEach(item => {
    item.addEventListener('click', () => {
      const img = item.dataset.img;
      const title = item.dataset.title;
      const stylist = item.dataset.stylist;
      const service = item.dataset.service;
      const price = item.dataset.price;

      if (previewImg) previewImg.src = img;
      if (previewTitle) previewTitle.textContent = title;
      if (previewStylist) previewStylist.textContent = `Crafted by ${stylist}`;
      
      if (previewBookBtn) {
        previewBookBtn.onclick = () => {
          lookbookModal.classList.remove('open');
          if (window.BookingApp) {
            window.BookingApp.openWithPreselectedService(service, title, price);
          }
        };
      }

      lookbookModal?.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  document.getElementById('close-lookbook-modal-btn')?.addEventListener('click', () => {
    lookbookModal?.classList.remove('open');
    document.body.style.overflow = '';
  });

  lookbookModal?.addEventListener('click', (e) => {
    if (e.target === lookbookModal) {
      lookbookModal.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  /* ==========================================================================
     7. FAQ ACCORDION & LIVE SEARCH
     ========================================================================== */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    questionBtn?.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    });
  });

  const faqSearchInput = document.getElementById('faq-search-input');
  faqSearchInput?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    faqItems.forEach(item => {
      const text = item.textContent.toLowerCase();
      if (text.includes(query)) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
  });

  /* ==========================================================================
     8. VIP NEWSLETTER PROMO APPLIER
     ========================================================================== */
  const vipForm = document.getElementById('vip-newsletter-form');
  vipForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('vip-email-input');
    if (emailInput && emailInput.value) {
      navigator.clipboard?.writeText('AURAVIP20');
      window.showToast('🎉 VIP Code AURAVIP20 copied! Enjoy 20% off your booking.');
      emailInput.value = '';
    }
  });

  /* ==========================================================================
     9. MOBILE NAVIGATION DRAWER
     ========================================================================== */
  const mobileNavToggle = document.getElementById('mobile-nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  mobileNavToggle?.addEventListener('click', () => {
    navLinks?.classList.toggle('open');
    mobileNavToggle.textContent = navLinks?.classList.contains('open') ? '✕' : '☰';
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks?.classList.remove('open');
      if (mobileNavToggle) mobileNavToggle.textContent = '☰';
    });
  });

  /* ==========================================================================
     10. STICKY NAVBAR SCROLL EFFECT
     ========================================================================== */
  window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 40) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  });
});
