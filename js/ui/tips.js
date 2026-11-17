//   selectTipStyle
//   setTipLength
//   renderTipLengths
//   populateTipDiameters

import {state} from "../state.js";
import {DB_TIPS} from "../catalogue/data.js";
import {checkStocks} from "../apiQuery.js";


export function selectTipStyle(style) {
  state.activeTipStyle = style;
  document.querySelectorAll("#carousel-tip-styles .carousel-item").forEach(el => {
    el.classList.toggle("selected", el.innerText.includes(style));
  });
  renderTipLengths();
}

export function setTipLength(length) {
  state.activeTipLength = length;
  renderTipLengths();
}

function renderTipLengths() {
  const wrapper = document.getElementById("carousel-tip-lengths");
  let lengths = [...new Set(DB_TIPS.filter(t => t.style === state.activeTipStyle).map(t => t.length))];

  if (!lengths.includes(state.activeTipLength)) {
    state.activeTipLength = lengths[0] || "5in";
  }

  wrapper.innerHTML = lengths.map(l => `
          <div class="carousel-item ${l === state.activeTipLength ? 'selected' : ''}" data-length="${l}">
              ${l}
          </div>
      `).join("");

  populateTipDiameters();
}

export async function populateTipDiameters() {
  const diaMenu = document.getElementById("tipDiameter");


  if (!diaMenu) {
    console.error("[populateTipDiameters] Could not find #tipDiameter");
    return;
  }

  const targetTips = DB_TIPS.filter(t =>
    t.style === state.activeTipStyle &&
    t.length === state.activeTipLength
  );



  if (targetTips.length === 0) {
    diaMenu.innerHTML = `<option value="">-- No Tips Available --</option>`;
    return;
  }

  diaMenu.innerHTML = `<option value="">Checking stock...</option>`;
  diaMenu.disabled = true;

  try {
    const tipsWithVariantIds = targetTips.map(tip => ({
      ...tip,
      shopifyVariantId: tip.id.startsWith("gid://shopify/ProductVariant/")
        ? tip.id
        : `gid://shopify/ProductVariant/${tip.id}`
    }));

    const availabilityById = await checkStocks(
      tipsWithVariantIds.map(tip => tip.shopifyVariantId)
    );

    const tipsWithStock = tipsWithVariantIds.map(tip => {
      const availableForSale = availabilityById.get(tip.shopifyVariantId);

      return {
        ...tip,
        availableForSale,
        inStock: availableForSale !== false
      };
    });

    const defaultTip = tipsWithStock.find(t => t.inStock && parseFloat(t.size) >= 4);

    diaMenu.innerHTML = tipsWithStock.map(t => `
            <option
              value="${t.id}"
              data-conn="${t.conn}"
              ${t.inStock ? "" : "disabled"}
              ${defaultTip && t.id === defaultTip.id ? "selected" : ""}
            >
              ${t.size} (${t.conn})${t.inStock ? "" : " - Out of stock"}
            </option>
        `).join("");

    if (defaultTip) {
      diaMenu.value = defaultTip.id;
    }

  } catch (error) {
    console.error("[populateTipDiameters] unexpected failure:", error);

    const defaultTip = targetTips.find(t => parseFloat(t.size) >= 4);

    diaMenu.innerHTML = targetTips.map(t => `
            <option
              value="${t.id}"
              data-conn="${t.conn}"
              ${defaultTip && t.id === defaultTip.id ? "selected" : ""}
            >
              ${t.size} (${t.conn}) - Stock check unavailable
            </option>
        `).join("");

    if (defaultTip) {
      diaMenu.value = defaultTip.id;
    }
  } finally {
    diaMenu.disabled = false;
  }
}
