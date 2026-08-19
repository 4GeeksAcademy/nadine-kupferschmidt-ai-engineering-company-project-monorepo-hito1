/* =============================================================
   Brasaland — validation.js
   Validación del formulario de registro Brasa Points
   ============================================================= */

(function () {
  'use strict';

  const form = document.getElementById('brasaForm');
  if (!form) return;

  // ---- Referencias a campos ----
  const fields = {
    fullName: {
      el: document.getElementById('fullName'),
      errorEl: document.getElementById('fullName-error'),
      required: true,
    },
    email: {
      el: document.getElementById('email'),
      errorEl: document.getElementById('email-error'),
      required: true,
    },
    phone: {
      el: document.getElementById('phone'),
      errorEl: document.getElementById('phone-error'),
      required: true,
    },
    birthdate: {
      el: document.getElementById('birthdate'),
      errorEl: document.getElementById('birthdate-error'),
      required: true,
    },
    country: {
      el: document.getElementById('country'),
      errorEl: document.getElementById('country-error'),
      required: true,
    },
    city: {
      el: document.getElementById('city'),
      errorEl: document.getElementById('city-error'),
      required: true,
    },
    referral: {
      el: document.getElementById('referral'),
      errorEl: document.getElementById('referral-error'),
      required: true,
    },
    terms: {
      el: document.getElementById('terms'),
      errorEl: document.getElementById('terms-error'),
      required: true,
    },
  };

  // ---- Datos de ubicaciones (exactamente del CONTEXT.md) ----
  const cityByCountry = {
    CO: ['Medellín', 'Bogotá', 'Cali'],
    US: ['Miami', 'Orlando'],
  };

  const locationsByCity = {
    'CO-Medellín': [
      'Brasaland El Poblado',
      'Brasaland Laureles',
      'Brasaland Envigado',
      'Brasaland Sabaneta',
    ],
    'CO-Bogotá': [
      'Brasaland Usaquén',
      'Brasaland Chapinero',
      'Brasaland Zona Rosa',
    ],
    'CO-Cali': [
      'Brasaland Granada',
      'Brasaland Ciudad Jardín',
      'Brasaland Unicentro',
    ],
    'US-Miami': [
      'Brasaland Brickell',
      'Brasaland Coral Gables',
    ],
    'US-Orlando': [
      'Brasaland Downtown',
      'Brasaland International Drive',
    ],
  };

  // ---- Utilidades ----
  function addClass(el, cls) {
    if (el) el.classList.add(cls);
  }

  function removeClass(el, cls) {
    if (el) el.classList.remove(cls);
  }

  function hasClass(el, cls) {
    return el && el.classList.contains(cls);
  }

  function setError(fieldObj, show) {
    const container = fieldObj.el ? fieldObj.el.closest('.mb-6') || fieldObj.el.closest('.mb-5') || fieldObj.el.parentElement : null;
    if (show) {
      addClass(container, 'field-error');
      removeClass(container, 'field-success');
    } else {
      removeClass(container, 'field-error');
      addClass(container, 'field-success');
    }
  }

  // ---- Funciones de validación (reglas exactas del CONTEXT.md) ----
  function validateFullName() {
    const val = fields.fullName.el.value.trim();
    // Mínimo 2 palabras
    const words = val.split(/\s+/).filter(w => w.length > 0);
    if (val.length === 0 || words.length < 2) {
      fields.fullName.errorEl.textContent = 'Ingresa tu nombre completo (nombre y apellido)';
      setError(fields.fullName, true);
      return false;
    }
    setError(fields.fullName, false);
    return true;
  }

  function validateEmail() {
    const val = fields.email.el.value.trim();
    // Debe contener @ y dominio (formato válido de email)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (val.length === 0 || !emailRegex.test(val)) {
      fields.email.errorEl.textContent = 'Ingresa un email válido (ejemplo: nombre@correo.com)';
      setError(fields.email, true);
      return false;
    }
    setError(fields.email, false);
    return true;
  }

  function validatePhone() {
    const val = fields.phone.el.value.trim();
    // Debe comenzar con + seguido del código de país
    // Acepta: +57, +1, seguido de dígitos, espacios, guiones
    const phoneRegex = /^\+\d[\d\s\-]{4,}\d$/;
    if (val.length === 0 || !phoneRegex.test(val)) {
      fields.phone.errorEl.textContent = 'El teléfono debe incluir código de país (ejemplo: +57 300 123 4567 o +1 305 123 4567)';
      setError(fields.phone, true);
      return false;
    }
    setError(fields.phone, false);
    return true;
  }

  function validateBirthdate() {
    const val = fields.birthdate.el.value;
    if (!val) {
      fields.birthdate.errorEl.textContent = 'Debes ser mayor de 18 años para registrarte en Brasa Points';
      setError(fields.birthdate, true);
      return false;
    }
    const birthDate = new Date(val);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 18) {
      fields.birthdate.errorEl.textContent = 'Debes ser mayor de 18 años para registrarte en Brasa Points';
      setError(fields.birthdate, true);
      return false;
    }
    setError(fields.birthdate, false);
    return true;
  }

  function validateCountry() {
    const val = fields.country.el.value;
    if (!val) {
      setError(fields.country, true);
      return false;
    }
    setError(fields.country, false);
    return true;
  }

  function validateCity() {
    const val = fields.city.el.value;
    if (!val) {
      setError(fields.city, true);
      return false;
    }
    setError(fields.city, false);
    return true;
  }

  function validateReferral() {
    const val = fields.referral.el.value;
    if (!val) {
      setError(fields.referral, true);
      return false;
    }
    setError(fields.referral, false);
    return true;
  }

  function validateTerms() {
    if (!fields.terms.el.checked) {
      fields.terms.errorEl.textContent = 'Debes aceptar los términos del programa Brasa Points para continuar';
      setError(fields.terms, true);
      return false;
    }
    setError(fields.terms, false);
    return true;
  }

  // ---- Validar todos los campos requeridos ----
  function validateAll() {
    const validations = [
      validateFullName(),
      validateEmail(),
      validatePhone(),
      validateBirthdate(),
      validateCountry(),
      validateCity(),
      validateReferral(),
      validateTerms(),
    ];
    return validations.every(v => v === true);
  }

  // ---- Real-time validation (on blur) ----
  function setupRealTimeValidation() {
    const blurValidations = {
      fullName: validateFullName,
      email: validateEmail,
      phone: validatePhone,
      birthdate: validateBirthdate,
      country: validateCountry,
      city: validateCity,
      referral: validateReferral,
    };

    Object.keys(blurValidations).forEach(key => {
      const field = fields[key];
      if (!field || !field.el) return;

      field.el.addEventListener('blur', function () {
        blurValidations[key]();
      });

      // Also validate on input (real-time while typing, after first blur)
      let hasBlurred = false;
      field.el.addEventListener('blur', function () {
        hasBlurred = true;
      });
      field.el.addEventListener('input', function () {
        if (hasBlurred) {
          blurValidations[key]();
        }
      });
    });

    // Terms: validate on change
    if (fields.terms.el) {
      fields.terms.el.addEventListener('change', validateTerms);
    }
  }

  // ---- Lógica de campos dependientes (País → Ciudad → Ubicación favorita) ----
  function populateCities() {
    const countryVal = fields.country.el.value;
    const citySelect = fields.city.el;
    const favSelect = document.getElementById('favoriteLocation');

    // Guardar selección actual de ciudad
    const prevCity = citySelect.value;

    // Limpiar opciones de ciudad (mantener placeholder)
    while (citySelect.options.length > 1) {
      citySelect.remove(1);
    }

    // Limpiar ubicación favorita
    while (favSelect.options.length > 1) {
      favSelect.remove(1);
    }

    // Resetear estados
    removeClass(citySelect.closest('.mb-6') || citySelect.parentElement, 'field-success');

    if (!countryVal) return;

    const cities = cityByCountry[countryVal] || [];
    cities.forEach(city => {
      const option = document.createElement('option');
      option.value = city;
      option.textContent = city;
      citySelect.appendChild(option);
    });

    // Restaurar selección previa si sigue siendo válida
    if (prevCity && cities.includes(prevCity)) {
      citySelect.value = prevCity;
      populateFavoriteLocations();
    }
  }

  function populateFavoriteLocations() {
    const countryVal = fields.country.el.value;
    const cityVal = fields.city.el.value;
    const favSelect = document.getElementById('favoriteLocation');

    // Guardar selección previa
    const prevFav = favSelect.value;

    // Limpiar
    while (favSelect.options.length > 1) {
      favSelect.remove(1);
    }

    if (!countryVal || !cityVal) return;

    const key = countryVal + '-' + cityVal;
    const locations = locationsByCity[key] || [];

    locations.forEach(loc => {
      const option = document.createElement('option');
      option.value = loc;
      option.textContent = loc;
      favSelect.appendChild(option);
    });

    // Restaurar selección previa
    if (prevFav && locations.includes(prevFav)) {
      favSelect.value = prevFav;
    }
  }

  // ---- Event listeners para campos dependientes ----
  fields.country.el.addEventListener('change', function () {
    populateCities();
    validateCountry();
    // Re-valida ciudad si ya estaba seleccionando algo
    if (fields.city.el.value) {
      validateCity();
    }
  });

  fields.city.el.addEventListener('change', function () {
    populateFavoriteLocations();
    validateCity();
  });

  // ---- Reset del formulario ----
  form.addEventListener('reset', function () {
    // Limpiar estados de error/éxito de todos los campos
    const allFieldKeys = Object.keys(fields);
    allFieldKeys.forEach(key => {
      const f = fields[key];
      const container = f.el ? f.el.closest('.mb-6') || f.el.closest('.mb-5') || f.el.parentElement : null;
      if (container) {
        removeClass(container, 'field-error');
        removeClass(container, 'field-success');
      }
      if (f.errorEl) {
        f.errorEl.textContent = f.errorEl.getAttribute('data-original-message') || f.errorEl.textContent;
      }
    });

    // Limpiar selects dependientes
    const citySelect = fields.city.el;
    while (citySelect.options.length > 1) {
      citySelect.remove(1);
    }
    const favSelect = document.getElementById('favoriteLocation');
    while (favSelect.options.length > 1) {
      favSelect.remove(1);
    }

    // Ocultar mensaje de éxito
    const successEl = document.getElementById('success-message');
    if (successEl) successEl.style.display = 'none';

    // Quitar overlay
    const overlay = document.getElementById('success-overlay');
    if (overlay) overlay.style.display = 'none';

    // Reset de banderas de blur
    document.querySelectorAll('input, select').forEach(el => {
      el._hasBlurred = false;
    });
  });

  // ---- Mostrar mensaje de éxito (exactamente del CONTEXT.md) ----
  function showSuccessMessage() {
    // Crear overlay
    const existingOverlay = document.getElementById('success-overlay');
    if (existingOverlay) {
      existingOverlay.style.display = 'flex';
      return;
    }

    const overlay = document.createElement('div');
    overlay.id = 'success-overlay';
    overlay.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'success-title');

    const successBox = document.createElement('div');
    successBox.id = 'success-message';
    successBox.className = 'bg-brand-ivory max-w-lg mx-6 p-10 lg:p-14 text-center shadow-xl';

    // Ícono decorativo
    const icon = document.createElement('div');
    icon.className = 'text-5xl mb-6';
    icon.textContent = '✦';
    icon.setAttribute('aria-hidden', 'true');

    const title = document.createElement('h2');
    title.id = 'success-title';
    title.className = 'text-2xl lg:text-3xl font-serif font-bold text-brand-charcoal mb-4';
    title.textContent = '¡Bienvenido a Brasa Points!';

    const desc = document.createElement('p');
    desc.className = 'text-brand-charcoal/70 text-sm lg:text-base leading-relaxed mb-6 font-light';
    desc.textContent = 'Tu registro ha sido exitoso. Recibirás un email de confirmación en los próximos minutos con los detalles de tu cuenta y cómo empezar a acumular puntos.';

    const subtitle = document.createElement('p');
    subtitle.className = 'text-brand-ochre text-sm font-medium';
    subtitle.textContent = '¡Ya puedes disfrutar de tus beneficios en cualquiera de nuestras 14 ubicaciones!';

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'mt-8 px-8 py-3 bg-brand-ochre text-brand-darkbrown font-semibold uppercase tracking-[0.15em] text-sm hover:bg-brand-ochre/90 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-brand-ochre focus-visible:ring-offset-2';
    closeBtn.textContent = 'Cerrar';
    closeBtn.addEventListener('click', function () {
      overlay.style.display = 'none';
    });
    closeBtn.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') overlay.style.display = 'none';
    });

    successBox.appendChild(icon);
    successBox.appendChild(title);
    successBox.appendChild(desc);
    successBox.appendChild(subtitle);
    successBox.appendChild(closeBtn);
    overlay.appendChild(successBox);
    document.body.appendChild(overlay);

    // Cerrar con Escape
    overlay.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') overlay.style.display = 'none';
    });
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) overlay.style.display = 'none';
    });

    // Enfocar el botón de cerrar
    setTimeout(function () {
      closeBtn.focus();
    }, 100);
  }

  // ---- Submit handler ----
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Correr todas las validaciones
    const isValid = validateAll();

    // También validar términos por separado con su mensaje específico
    if (!fields.terms.el.checked) {
      fields.terms.errorEl.textContent = 'Debes aceptar los términos del programa Brasa Points para continuar';
      setError(fields.terms, true);
    }

    if (isValid) {
      showSuccessMessage();
      // Opcionalmente resetear el formulario después de éxito
      // (no hacer reset automático para que el usuario vea los datos)
    } else {
      // Enfocar el primer campo con error
      const firstError = form.querySelector('.field-error input, .field-error select');
      if (firstError) {
        firstError.focus();
      }
    }
  });

  // ---- Inicializar ----
  setupRealTimeValidation();

  // ---- Inicializar i18n para mensajes de error y placeholders ----
  // Guardar mensajes de error originales para reset
  Object.keys(fields).forEach(key => {
    const f = fields[key];
    if (f.errorEl) {
      f.errorEl.setAttribute('data-original-message', f.errorEl.textContent);
    }
  });

  // ---- Exponer populateCities para que i18n toggle pueda re-poblar ----
  window._populateCities = populateCities;
  window._populateFavoriteLocations = populateFavoriteLocations;

})();