/**
 * AURA LUXURY HAIR LOUNGE - STYLE FINDER QUIZ
 * Interactive 3-step recommendation engine
 */

const QuizEngine = {
  currentStep: 1,
  totalSteps: 3,
  answers: {
    length: 'medium',
    goal: 'color',
    routine: 'polished'
  },

  recommendations: {
    color: {
      title: "Signature Honey Balayage & Gloss",
      desc: "Based on your preferences, our dimensional hand-painted Balayage with customized tone glossing and botanical bond builder will deliver unmatched warmth and luminous shine.",
      duration: "2h 45m",
      price: "$195",
      stylist: "Elena Vance (Master Colorist)",
      serviceId: "balayage"
    },
    cut: {
      title: "Couture Precision Cut & Styling",
      desc: "A bespoke haircut designed to frame your facial features and enhance natural hair movement, finished with a nourishing blowout and heat protection.",
      duration: "1h 15m",
      price: "$95",
      stylist: "Marcus Stone (Creative Director)",
      serviceId: "couture-cut"
    },
    spa: {
      title: "Botanical Head Spa & Silk Therapy",
      desc: "An ultra-relaxing Japanese-inspired scalp exfoliation, therapeutic head massage, and deep reconstructive moisture mask for transformative hair vitality.",
      duration: "1h 30m",
      price: "$140",
      stylist: "Sophia Laurent (Texture Specialist)",
      serviceId: "scalp-spa"
    },
    glow: {
      title: "Luxe Cut, Gloss & Blowout Duo",
      desc: "The ultimate hair refresh combining custom shaping, high-shine glossing glaze, and our signature voluminous red-carpet blowout.",
      duration: "1h 45m",
      price: "$160",
      stylist: "Elena Vance (Master Colorist)",
      serviceId: "cut-gloss"
    }
  },

  init() {
    this.bindEvents();
    this.updateUI();
  },

  bindEvents() {
    // Option clicks
    document.querySelectorAll('.quiz-option-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const optionEl = e.currentTarget;
        const group = optionEl.dataset.group;
        const value = optionEl.dataset.value;

        // Deselect peers in group
        const stepPane = optionEl.closest('.quiz-step');
        stepPane.querySelectorAll('.quiz-option-card').forEach(c => c.classList.remove('selected'));
        
        optionEl.classList.add('selected');
        this.answers[group] = value;
      });
    });

    // Next step
    document.getElementById('quiz-next-btn')?.addEventListener('click', () => {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
        this.updateUI();
      } else {
        this.showResult();
      }
    });

    // Prev step
    document.getElementById('quiz-prev-btn')?.addEventListener('click', () => {
      if (this.currentStep > 1) {
        this.currentStep--;
        this.updateUI();
      }
    });

    // Restart quiz
    document.getElementById('quiz-restart-btn')?.addEventListener('click', () => {
      this.currentStep = 1;
      this.updateUI();
    });

    // Book recommended style
    document.getElementById('quiz-book-recommended-btn')?.addEventListener('click', () => {
      const recKey = this.computeRecommendationKey();
      const rec = this.recommendations[recKey];
      if (window.BookingApp) {
        window.BookingApp.openWithPreselectedService(rec.serviceId, rec.title, rec.price);
      }
    });
  },

  computeRecommendationKey() {
    if (this.answers.goal === 'color') return 'color';
    if (this.answers.goal === 'spa' || this.answers.routine === 'luxury') return 'spa';
    if (this.answers.length === 'short' || this.answers.goal === 'refresh') return 'cut';
    return 'glow';
  },

  updateUI() {
    // Show active step
    document.querySelectorAll('.quiz-step').forEach(step => step.classList.remove('active'));
    const currentStepEl = document.getElementById(`quiz-step-${this.currentStep}`);
    if (currentStepEl) currentStepEl.classList.add('active');

    // Progress bar
    const progressPercent = (this.currentStep / this.totalSteps) * 100;
    const progressFill = document.getElementById('quiz-progress-fill');
    if (progressFill) progressFill.style.width = `${progressPercent}%`;

    // Button states
    const prevBtn = document.getElementById('quiz-prev-btn');
    const nextBtn = document.getElementById('quiz-next-btn');

    if (prevBtn) prevBtn.style.visibility = this.currentStep === 1 ? 'hidden' : 'visible';
    if (nextBtn) {
      nextBtn.textContent = this.currentStep === this.totalSteps ? 'See My Ideal Style ✨' : 'Continue ➔';
    }

    const resultStep = document.getElementById('quiz-step-result');
    if (resultStep) resultStep.classList.remove('active');
  },

  showResult() {
    document.querySelectorAll('.quiz-step').forEach(step => step.classList.remove('active'));
    const resultStep = document.getElementById('quiz-step-result');
    if (!resultStep) return;
    
    resultStep.classList.add('active');

    const recKey = this.computeRecommendationKey();
    const rec = this.recommendations[recKey];

    document.getElementById('quiz-result-title').textContent = rec.title;
    document.getElementById('quiz-result-desc').textContent = rec.desc;
    document.getElementById('quiz-result-duration').textContent = `⏱ Duration: ${rec.duration}`;
    document.getElementById('quiz-result-price').textContent = `🏷 Est. Price: ${rec.price}`;
    document.getElementById('quiz-result-stylist').textContent = `✂ Recommended Artist: ${rec.stylist}`;

    const nextBtn = document.getElementById('quiz-next-btn');
    const prevBtn = document.getElementById('quiz-prev-btn');
    if (nextBtn) nextBtn.style.display = 'none';
    if (prevBtn) prevBtn.style.display = 'none';
  }
};

document.addEventListener('DOMContentLoaded', () => {
  QuizEngine.init();
});
