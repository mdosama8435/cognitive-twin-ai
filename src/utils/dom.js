/**
 * DOM Utility Helpers
 */

export const $ = (selector, context = document) => {
    return context.querySelector(selector);
};

export const $$ = (selector, context = document) => {
    return Array.from(context.querySelectorAll(selector));
};

export const show = (element) => {
    if (element) element.style.display = '';
};

export const hide = (element) => {
    if (element) element.style.display = 'none';
};

export const toggle = (element, condition) => {
    if (element) {
        element.style.display = condition ? '' : 'none';
    }
};

export const html = (element, content) => {
    if (element) element.innerHTML = content;
};

export const text = (element, content) => {
    if (element) element.textContent = content;
};

export const on = (element, event, handler) => {
    if (element) element.addEventListener(event, handler);
};

export const addClass = (element, className) => {
    if (element) element.classList.add(className);
};

export const removeClass = (element, className) => {
    if (element) element.classList.remove(className);
};
