'use strict';



// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }



// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });



// custom select variables
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-selecct-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");

select.addEventListener("click", function () { elementToggleFunc(this); });

// add event in all select items
for (let i = 0; i < selectItems.length; i++) {
  selectItems[i].addEventListener("click", function () {

    let selectedValue = this.dataset.selectItem;
    elementToggleFunc(select);
    filterFunc(selectedValue);

  });
}

// filter variables
const filterItems = document.querySelectorAll("[data-filter-item]");

const filterFunc = function (selectedValue) {

  select.dataset.value = selectedValue;
  selectValue.textContent = window.resumeI18n.text(selectedValue);
  filterBtn.forEach(button => button.classList.toggle('active', button.dataset.filterBtn === selectedValue));

  for (let i = 0; i < filterItems.length; i++) {

    if (selectedValue === "all") {
      filterItems[i].classList.add("active");
    } else if (selectedValue === filterItems[i].dataset.category) {
      filterItems[i].classList.add("active");
    } else {
      filterItems[i].classList.remove("active");
    }

  }

}

// add event in all filter button items for large screen

for (let i = 0; i < filterBtn.length; i++) {

  filterBtn[i].addEventListener("click", function () {

    let selectedValue = this.dataset.filterBtn;
    filterFunc(selectedValue);


  });

}



// contact form variables
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

// add event to all form input field
for (let i = 0; i < formInputs.length; i++) {
  formInputs[i].addEventListener("input", function () {

    // check form validation
    if (form.checkValidity()) {
      formBtn.removeAttribute("disabled");
    } else {
      formBtn.setAttribute("disabled", "");
    }

  });
}

// submit the form to Formspree without leaving the page
const formStatus = document.querySelector("[data-form-status]");

function showFormStatus(key, state) {
  formStatus.dataset.statusKey = key;
  formStatus.textContent = window.resumeI18n.text(key);
  formStatus.className = `form-status ${state}`;
  formStatus.hidden = false;
}

form.addEventListener("submit", function (event) {
  event.preventDefault();

  formBtn.setAttribute("disabled", "");
  formStatus.hidden = true;

  fetch(form.action, {
    method: "POST",
    body: new FormData(form),
    headers: { "Accept": "application/json" }
  }).then(function (response) {

    if (response.ok) {
      showFormStatus('success', 'success');
      form.reset();
    } else {
      showFormStatus('error', 'error');
      formBtn.removeAttribute("disabled");
    }

    formStatus.hidden = false;

  }).catch(function () {
    showFormStatus('network', 'error');
    formBtn.removeAttribute("disabled");
  });

});



// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// add event to all nav link
for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {

    const targetPage = this.dataset.navLink;

    for (let i = 0; i < pages.length; i++) {
      if (targetPage === pages[i].dataset.page) {
        pages[i].classList.add("active");
        navigationLinks[i].classList.add("active");
        navigationLinks[i].setAttribute("aria-current", "page");
        window.scrollTo(0, 0);
      } else {
        pages[i].classList.remove("active");
        navigationLinks[i].classList.remove("active");
        navigationLinks[i].removeAttribute("aria-current");
      }
    }

  });
}
