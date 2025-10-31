// utils/storage.js
export const setLocalStorageWithEvent = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(
    new CustomEvent("local-storage-update", { detail: { key } })
  );
};
