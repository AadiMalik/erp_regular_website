// Smart Mart — store branch selector: first-visit gate + header pill/switcher.
// Selection is backed by localStorage and broadcasts a `branch:change` event,
// mirroring the cart/wishlist pattern in ./store.js.

import { qs, qsa, escapeHtml } from './utils.js';
import { BRANCHES, getBranch } from '../data/branches.js';

const BRANCH_KEY = 'sm_branch';

export function getSelectedBranchId() {
  return localStorage.getItem(BRANCH_KEY);
}

export function getSelectedBranch() {
  const id = getSelectedBranchId();
  return id ? getBranch(id) : null;
}

function setSelectedBranch(id) {
  localStorage.setItem(BRANCH_KEY, id);
  window.dispatchEvent(new CustomEvent('branch:change', { detail: { branchId: id } }));
}

function branchCardMarkup(branch, selectedId) {
  return `
    <label class="branch-card${branch.id === selectedId ? ' active' : ''}">
      <input type="radio" name="branch-select" value="${branch.id}" ${branch.id === selectedId ? 'checked' : ''}>
      <img src="${branch.image}" alt="" class="branch-card__img">
      <div class="branch-card__meta">
        <strong>${escapeHtml(branch.name)}</strong>
        <span><i class="fa-solid fa-location-dot"></i> ${escapeHtml(branch.address)}</span>
        <span><i class="fa-regular fa-clock"></i> ${escapeHtml(branch.hours)}</span>
        <span class="branch-card__note"><i class="fa-solid fa-truck-fast"></i> ${escapeHtml(branch.deliveryNote)}</span>
      </div>
      <i class="fa-solid fa-circle-check branch-card__check"></i>
    </label>`;
}

function buildOverlay() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay branch-modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box branch-modal">
      <button class="modal-close" data-branch-close aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
      <div class="branch-modal__head">
        <span class="branch-modal__icon"><i class="fa-solid fa-store"></i></span>
        <h2>Choose Your Nearest Store</h2>
        <p>Select a Smart Mart branch to see accurate delivery times and availability for your area.</p>
      </div>
      <div class="branch-modal__list" data-branch-list></div>
      <button class="btn btn-primary btn-block" data-branch-confirm disabled>Confirm Store</button>
    </div>`;
  document.body.appendChild(overlay);
  return overlay;
}

let overlayEl = null;

function openBranchModal({ dismissible }) {
  if (!overlayEl) overlayEl = buildOverlay();
  const selectedId = getSelectedBranchId();
  overlayEl.querySelector('[data-branch-list]').innerHTML = BRANCHES.map((b) => branchCardMarkup(b, selectedId)).join('');
  const closeBtn = overlayEl.querySelector('[data-branch-close]');
  const confirmBtn = overlayEl.querySelector('[data-branch-confirm]');
  closeBtn.style.display = dismissible ? '' : 'none';
  confirmBtn.disabled = !selectedId;
  overlayEl.classList.toggle('is-gate', !dismissible);

  qsa('input[name="branch-select"]', overlayEl).forEach((input) => {
    input.addEventListener('change', () => {
      qsa('.branch-card', overlayEl).forEach((c) => c.classList.remove('active'));
      input.closest('.branch-card').classList.add('active');
      confirmBtn.disabled = false;
    });
  });

  confirmBtn.onclick = () => {
    const checked = overlayEl.querySelector('input[name="branch-select"]:checked');
    if (!checked) return;
    setSelectedBranch(checked.value);
    closeBranchModal();
  };

  if (dismissible) {
    closeBtn.onclick = closeBranchModal;
    overlayEl.onclick = (e) => { if (e.target === overlayEl) closeBranchModal(); };
    document.addEventListener('keydown', escToClose);
  } else {
    closeBtn.onclick = null;
    overlayEl.onclick = null;
    document.removeEventListener('keydown', escToClose);
  }

  overlayEl.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function escToClose(e) {
  if (e.key === 'Escape') closeBranchModal();
}

function closeBranchModal() {
  if (!overlayEl || overlayEl.classList.contains('is-gate') && !getSelectedBranchId()) return;
  overlayEl.classList.remove('open');
  document.body.style.overflow = '';
  document.removeEventListener('keydown', escToClose);
}

function renderPill() {
  const branch = getSelectedBranch();
  const label = branch ? branch.name : 'Select store';
  qsa('[data-branch-pill-label]').forEach((el) => { el.textContent = label; });
}

function wirePillTriggers() {
  qsa('[data-branch-pill], [data-branch-pill-mobile]').forEach((btn) => {
    btn.addEventListener('click', () => openBranchModal({ dismissible: true }));
  });
}

export function initBranch() {
  wirePillTriggers();
  renderPill();
  window.addEventListener('branch:change', renderPill);

  if (!getSelectedBranchId()) {
    openBranchModal({ dismissible: false });
  }
}
