//  sendProjectToShopify
//   redirectProjectToShopify
//   continueToShopifyAnyway

import {saveProjectBasketToStorage} from "../basket/basketStorage.js";
import {analyzeProjectBasketCompatibility} from "../compatibility/compatibility.js";
import {closeCompatibilityModal, openCompatibilityModal} from "../ui/compatibilityModal.js";

import {state} from "../state.js";
import {SHOPIFY_CART_URL} from "../constants.js";

export function sendProjectToShopify() {
  if (state.projectBasket.length === 0) return;

  const analysis = analyzeProjectBasketCompatibility();

  if (!analysis.ok) {
    openCompatibilityModal(analysis.messages, analysis.missingAdaptorKeys);
    return;
  }

  if (analysis.hasTipsAndCables) {
    openCompatibilityModal([], [], true);
    return;
  }

  redirectProjectToShopify();
}

//export function redirectProjectToShopify() {
//  saveProjectBasketToStorage();

//  const queryParams = state.projectBasket.map(item => `${item.id}:${item.qty}`).join(",");

//  window.top.location.href = SHOPIFY_CART_URL + queryParams + "?attributes[source]=TLKC_app_checkout&storefront=true";
//}

export function redirectProjectToShopify() {
  saveProjectBasketToStorage();

  const itemsQuery = state.projectBasket
    .map(item => `items[][id]=${item.id}&items[][quantity]=${item.qty}`)
    .join("&");

  window.top.location.href = `${SHOPIFY_CART_URL}?${itemsQuery}&attributes[source]=TLKC_app_checkout&return_to=/cart`;
}



export function continueToShopifyAnyway() {
  closeCompatibilityModal();
  redirectProjectToShopify();
}
