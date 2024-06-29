export function updateDisplayLog(key, value) {
    window.dispatchEvent(new CustomEvent("displayLogUpdate", { detail: { key, value } }));
}