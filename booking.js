/**
 * AURA LUXURY HAIR LOUNGE - ONLINE APPOINTMENT BOOKING ENGINE
 * Complete state machine for interactive appointment scheduling
 */

const BookingApp = {
  currentStep: 1,
  totalSteps: 4, // 1: Services, 2: Stylist, 3: Date/Time, 4: Contact, 5: Confirmation
  
  bookingData: {
    serviceName: "Signature Haircut & Style",
    serviceCategory: "cut",
    servicePrice: 85,
    serviceDuration: "60 mins",
    stylistName: "Elena Vance",
    stylistRole: "Master Colorist",
    date: "",
    time: "11:00 AM",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    notes: "",
    promoCode: "",
    discountAmount: 0,
    finalPrice: 85,
    referenceId: ""
  },

  init() {
    this.modal = document.getElementById('booking-modal');
    this.bindEvents();
    this.setDefaultDate();
  },

  bindEvents() {
    // Open modal triggers
    document.querySelectorAll('[data-open-booking]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const service = btn.dataset.service;
        const price = btn.dataset.price;
        const stylist = btn.dataset.stylist;
        
        if (service && price) {
          this.bookingData.serviceName = service;
          this.bookingData.servicePrice = parseFloat(price.replace('$', '')) || 85;
          this.bookingData.finalPrice = this.bookingData.servicePrice;
        }
        if (stylist) {
          this.bookingData.stylistName = stylist;
        }
        
        this.openModal();
      });
    });

    // Close modal
    document.getElementById('close-booking-modal-btn')?.addEventListener('click', () => this.closeModal());
    this.modal?.addEventListener('click', (e) => {
      if (e.target === this.modal) this.closeModal();
    });

    // Step navigation buttons
    document.getElementById('booking-next-btn')?.addEventListener('click', () => this.nextStep());
    document.getElementById('booking-prev-btn')?.addEventListener('click', () => this.prevStep());

    // Service card clicks inside modal
    document.querySelectorAll('.modal-service-option').forEach(opt => {
      opt.addEventListener('click', () => {
        document.querySelectorAll('.modal-service-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        this.bookingData.serviceName = opt.dataset.name;
        this.bookingData.servicePrice = parseFloat(opt.dataset.price);
        this.bookingData.serviceDuration = opt.dataset.duration;
        this.updateFinalCalculation();
      });
    });

    // Stylist cards inside modal
    document.querySelectorAll('.stylist-pick-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.stylist-pick-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.bookingData.stylistName = card.dataset.name;
        this.bookingData.stylistRole = card.dataset.role;
      });
    });

    // Time slot buttons
    document.querySelectorAll('.time-slot-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.bookingData.time = btn.dataset.time;
      });
    });

    // Calendar date change
    const dateInput = document.getElementById('booking-date-input');
    if (dateInput) {
      dateInput.addEventListener('change', (e) => {
        this.bookingData.date = e.target.value;
      });
    }

    // Promo code apply
    document.getElementById('apply-promo-btn')?.addEventListener('click', () => {
      this.applyPromoCode();
    });

    // Print / Save Confirmation Pass
    document.getElementById('print-pass-btn')?.addEventListener('click', () => {
      window.print();
    });

    // Reset / Book Another
    document.getElementById('book-another-btn')?.addEventListener('click', () => {
      this.currentStep = 1;
      this.updateStepView();
    });
  },

  setDefaultDate() {
    const dateInput = document.getElementById('booking-date-input');
    if (dateInput) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const formatted = tomorrow.toISOString().split('T')[0];
      dateInput.min = today.toISOString().split('T')[0];
      dateInput.value = formatted;
      this.bookingData.date = formatted;
    }
  },

  openModal() {
    if (!this.modal) return;
    this.modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    this.currentStep = 1;
    this.updateStepView();
  },

  closeModal() {
    if (!this.modal) return;
    this.modal.classList.remove('open');
    document.body.style.overflow = '';
  },

  openWithPreselectedService(serviceId, title, price) {
    this.bookingData.serviceName = title;
    this.bookingData.servicePrice = parseFloat(price.replace(/[^0-9.]/g, '')) || 95;
    this.updateFinalCalculation();
    this.openModal();
  },

  nextStep() {
    if (this.currentStep === 1) {
      // Validate service
      if (!this.bookingData.serviceName) {
        if (window.showToast) window.showToast('Please pick a service to continue.');
        return;
      }
    } else if (this.currentStep === 2) {
      // Stylist selected
      if (!this.bookingData.stylistName) {
        this.bookingData.stylistName = "Any Available Master Stylist";
      }
    } else if (this.currentStep === 3) {
      // Validate date and time
      if (!this.bookingData.date || !this.bookingData.time) {
        if (window.showToast) window.showToast('Please select your preferred date and time.');
        return;
      }
    } else if (this.currentStep === 4) {
      // Validate contact info
      const nameInput = document.getElementById('client-name-input');
      const phoneInput = document.getElementById('client-phone-input');
      const emailInput = document.getElementById('client-email-input');

      if (!nameInput?.value || !phoneInput?.value) {
        if (window.showToast) window.showToast('Please provide your name and phone number.');
        return;
      }

      this.bookingData.clientName = nameInput.value;
      this.bookingData.clientPhone = phoneInput.value;
      this.bookingData.clientEmail = emailInput?.value || '';
      this.bookingData.notes = document.getElementById('client-notes-input')?.value || '';

      this.generateConfirmation();
      this.currentStep = 5;
      this.updateStepView();
      return;
    }

    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      this.updateStepView();
    }
  },

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.updateStepView();
    }
  },

  applyPromoCode() {
    const promoInput = document.getElementById('booking-promo-input');
    const code = promoInput?.value.trim().toUpperCase();
    const promoStatus = document.getElementById('promo-status-msg');

    if (!code) return;

    if (code === 'AURAVIP20' || code === 'WELCOME20') {
      this.bookingData.promoCode = code;
      this.bookingData.discountAmount = this.bookingData.servicePrice * 0.20;
      this.updateFinalCalculation();
      if (promoStatus) {
        promoStatus.innerHTML = `<span style="color:#2ECC71;">✓ Code ${code} applied! 20% discount saved.</span>`;
      }
      if (window.showToast) window.showToast(`✨ Promo code applied! Saved $${this.bookingData.discountAmount.toFixed(2)}`);
    } else {
      if (promoStatus) {
        promoStatus.innerHTML = `<span style="color:#E74C3C;">Invalid promo code. Try 'AURAVIP20'</span>`;
      }
    }
  },

  updateFinalCalculation() {
    this.bookingData.finalPrice = Math.max(0, this.bookingData.servicePrice - this.bookingData.discountAmount);
    
    // Update labels in step 4
    const subtotalEl = document.getElementById('modal-subtotal-price');
    const discountEl = document.getElementById('modal-discount-price');
    const totalEl = document.getElementById('modal-total-price');

    if (subtotalEl) subtotalEl.textContent = `$${this.bookingData.servicePrice.toFixed(2)}`;
    if (discountEl) discountEl.textContent = `-$${this.bookingData.discountAmount.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${this.bookingData.finalPrice.toFixed(2)}`;
  },

  generateConfirmation() {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    this.bookingData.referenceId = `AURA-${randomNum}`;

    document.getElementById('pass-booking-ref').textContent = this.bookingData.referenceId;
    document.getElementById('pass-client-name').textContent = this.bookingData.clientName;
    document.getElementById('pass-service-name').textContent = this.bookingData.serviceName;
    document.getElementById('pass-stylist-name').textContent = this.bookingData.stylistName;
    document.getElementById('pass-datetime').textContent = `${this.bookingData.date} at ${this.bookingData.time}`;
    document.getElementById('pass-total-amount').textContent = `$${this.bookingData.finalPrice.toFixed(2)}`;

    if (window.showToast) {
      window.showToast('🎉 Appointment booked successfully! Confirmation pass ready.');
    }
  },

  updateStepView() {
    // Stepper header
    document.querySelectorAll('.stepper-step').forEach(step => {
      const stepNum = parseInt(step.dataset.step);
      step.classList.remove('active', 'completed');
      if (stepNum === this.currentStep) {
        step.classList.add('active');
      } else if (stepNum < this.currentStep) {
        step.classList.add('completed');
      }
    });

    // Panes
    document.querySelectorAll('.booking-step-pane').forEach(pane => pane.classList.remove('active'));
    const activePane = document.getElementById(`booking-pane-${this.currentStep}`);
    if (activePane) activePane.classList.add('active');

    // Controls
    const prevBtn = document.getElementById('booking-prev-btn');
    const nextBtn = document.getElementById('booking-next-btn');
    const footer = document.querySelector('.booking-modal-footer');

    if (this.currentStep === 5) {
      if (footer) footer.style.display = 'none';
    } else {
      if (footer) footer.style.display = 'flex';
      if (prevBtn) prevBtn.style.visibility = this.currentStep === 1 ? 'hidden' : 'visible';
      if (nextBtn) {
        nextBtn.textContent = this.currentStep === 4 ? 'Confirm & Book Appointment ➔' : 'Continue ➔';
      }
    }

    this.updateFinalCalculation();
  }
};

window.BookingApp = BookingApp;

document.addEventListener('DOMContentLoaded', () => {
  BookingApp.init();
});
