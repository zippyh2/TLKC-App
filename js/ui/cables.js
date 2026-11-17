//   selectCableType
//   updateCableDropdown

import {state} from "../state.js";
import {DB_CABLES} from "../catalogue/data.js";
import {checkStocks} from "../apiQuery.js";


export function selectCableType(type) {
  state.activeCableType = type;
  document.querySelectorAll("#carousel-cable-types .carousel-item").forEach(el => {
    // Clean, direct equality check
    el.classList.toggle("selected", el.dataset.type === type);
  });
  updateCableDropdown();
}

export async function updateCableDropdown() {
  const cableMenu = document.getElementById("cableLength");

  const availableCables = DB_CABLES.filter(c =>
    c.type === state.activeCableType
  );

  if (availableCables.length === 0) {
    cableMenu.innerHTML = `<option value="">-- No Cable Lengths Available --</option>`;
    return;
  }

  cableMenu.innerHTML = `<option value="">Checking stock...</option>`;
  cableMenu.disabled = true;

  try {
    const cablesWithVariantIds = availableCables.map(cable => ({
      ...cable,
      shopifyVariantId: cable.id.startsWith("gid://shopify/ProductVariant/")
        ? cable.id
        : `gid://shopify/ProductVariant/${cable.id}`
    }));

    const availabilityById = await checkStocks(
      cablesWithVariantIds.map(cable => cable.shopifyVariantId)
    );

    const cablesWithStock = cablesWithVariantIds.map(cable => {
      const availableForSale = availabilityById.get(cable.shopifyVariantId);

      return {
        ...cable,
        availableForSale,
        inStock: availableForSale !== false
      };
    });

    const defaultCable = cablesWithStock.find(c => c.inStock && parseFloat(c.length) >= 5);

    cableMenu.innerHTML = cablesWithStock.map(c => `
              <option
                value="${c.id}"
                data-conn="${c.conn}"
                ${c.inStock ? "" : "disabled"}
                ${defaultCable && c.id === defaultCable.id ? "selected" : ""}
              >
                ${c.length} (${c.conn})${c.inStock ? "" : " - Out of stock"}
              </option>
          `).join("");

    if (defaultCable) {
      cableMenu.value = defaultCable.id;
    }
  } catch (error) {
    console.error("[updateCableDropdown] unexpected failure:", error);

    const defaultCable = availableCables.find(c => parseFloat(c.length) >= 5);

    cableMenu.innerHTML = availableCables.map(c => `
              <option
                value="${c.id}"
                data-conn="${c.conn}"
                ${defaultCable && c.id === defaultCable.id ? "selected" : ""}
              >
                ${c.length} (${c.conn}) - Stock check unavailable
              </option>
          `).join("");

    if (defaultCable) {
      cableMenu.value = defaultCable.id;
    }
  } finally {
    cableMenu.disabled = false;
  }
}
