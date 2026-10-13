/**
 * js/widgets.js
 * Property Finder Real Estate - Mumbai
 * Interactive Portal Widgets, Calculators & UI Utilities
 */

(function (window, document) {
  'use strict';

  function formatInr(num) {
    if (isNaN(num)) return '₹0';
    return '₹' + Math.round(num).toLocaleString('en-IN');
  }

  function showToast(message, type = 'info', duration = 3500) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = '&#8505;&#65039;';
    if (type === 'success') icon = '&#10003;';
    if (type === 'error') icon = '&#9888;&#65039;';

    toast.innerHTML = `<span>${icon}</span><div style="flex:1">${message}</div>`;
    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentElement) toast.parentElement.removeChild(toast);
      }, 300);
    }, duration);
  }

  window.showToast = showToast;

  function initEmiCalculator() {
    const amountSlider = document.getElementById('emiAmountSlider');
    const rateSlider = document.getElementById('emiRateSlider');
    const tenureSlider = document.getElementById('emiTenureSlider');

    const amountDisplay = document.getElementById('emiAmountVal');
    const rateDisplay = document.getElementById('emiRateVal');
    const tenureDisplay = document.getElementById('emiTenureVal');

    const monthlyEmiDisplay = document.getElementById('emiMonthlyVal');
    const totalInterestDisplay = document.getElementById('emiInterestVal');
    const totalPayableDisplay = document.getElementById('emiTotalVal');

    if (!amountSlider || !rateSlider || !tenureSlider) return;

    function calculate() {
      const p = parseFloat(amountSlider.value);
      const annualRate = parseFloat(rateSlider.value);
      const years = parseFloat(tenureSlider.value);

      if (amountDisplay) amountDisplay.textContent = formatInr(p);
      if (rateDisplay) rateDisplay.textContent = annualRate.toFixed(1) + ' %';
      if (tenureDisplay) tenureDisplay.textContent = years + (years === 1 ? ' Year' : ' Years');

      const r = (annualRate / 12) / 100;
      const n = years * 12;

      let emi = 0;
      if (r > 0 && n > 0) {
        emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      }

      const totalPayment = emi * n;
      const totalInterest = totalPayment - p;

      if (monthlyEmiDisplay) monthlyEmiDisplay.textContent = formatInr(emi);
      if (totalInterestDisplay) totalInterestDisplay.textContent = formatInr(totalInterest);
      if (totalPayableDisplay) totalPayableDisplay.textContent = formatInr(totalPayment);
    }

    amountSlider.addEventListener('input', calculate);
    rateSlider.addEventListener('input', calculate);
    tenureSlider.addEventListener('input', calculate);

    calculate();
  }

  function initStampDutyEstimator() {
    const priceInput = document.getElementById('stampPriceInput');
    const genderPills = document.querySelectorAll('.stamp-gender-pill');
    const dutyValEl = document.getElementById('stampDutyVal');
    const regFeeValEl = document.getElementById('stampRegVal');
    const totalTaxValEl = document.getElementById('stampTotalVal');

    if (!priceInput) return;

    let selectedRate = 0.06;

    genderPills.forEach(pill => {
      pill.addEventListener('click', function () {
        genderPills.forEach(p => p.classList.remove('active'));
        this.classList.add('active');
        selectedRate = parseFloat(this.getAttribute('data-rate')) || 0.06;
        compute();
      });
    });

    function compute() {
      const price = parseFloat(priceInput.value) || 0;
      const duty = price * selectedRate;
      
      let registration = price > 3000000 ? 30000 : price * 0.01;
      if (price === 0) registration = 0;

      const total = duty + registration;

      if (dutyValEl) dutyValEl.textContent = formatInr(duty);
      if (regFeeValEl) regFeeValEl.textContent = formatInr(registration);
      if (totalTaxValEl) totalTaxValEl.textContent = formatInr(total);
    }

    priceInput.addEventListener('input', compute);
    compute();
  }

  function initUnitConverter() {
    const fromInput = document.getElementById('converterFromInput');
    const toInput = document.getElementById('converterToInput');
    const fromUnit = document.getElementById('converterFromUnit');
    const toUnit = document.getElementById('converterToUnit');
    const switchBtn = document.getElementById('converterSwitchBtn');

    if (!fromInput || !toInput || !fromUnit || !toUnit) return;

    const sqftFactors = {
      sqft: 1,
      sqm: 10.7639,
      sqyd: 9,
      guntha: 1089,
      acre: 43560,
      bigha: 27000
    };

    function convert() {
      const val = parseFloat(fromInput.value);
      if (isNaN(val)) {
        toInput.value = '';
        return;
      }

      const factorFrom = sqftFactors[fromUnit.value] || 1;
      const factorTo = sqftFactors[toUnit.value] || 1;

      const sqft = val * factorFrom;
      const result = sqft / factorTo;

      toInput.value = (Math.round(result * 1000) / 1000).toLocaleString('en-IN');
    }

    fromInput.addEventListener('input', convert);
    fromUnit.addEventListener('change', convert);
    toUnit.addEventListener('change', convert);

    if (switchBtn) {
      switchBtn.addEventListener('click', function () {
        const temp = fromUnit.value;
        fromUnit.value = toUnit.value;
        toUnit.value = temp;
        convert();
      });
    }

    convert();
  }

  function initStickyEnquiry() {
    const stickyBar = document.getElementById('stickyEnquiry');
    if (!stickyBar) return;

    let lastScroll = 0;
    window.addEventListener('scroll', function () {
      const currentScroll = window.scrollY;
      if (currentScroll > 400) {
        stickyBar.classList.add('show');
      } else {
        stickyBar.classList.remove('show');
      }
      lastScroll = currentScroll;
    }, { passive: true });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initEmiCalculator();
    initStampDutyEstimator();
    initUnitConverter();
    initStickyEnquiry();
  });
})(window, document);