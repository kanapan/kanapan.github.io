// Paying on the booking page through the hotel's own card gateway, like a modern shop: card fields, Apple Pay and
// Google Pay (Stripe), and PromptPay that confirms by itself (no slip). The card fields are the gateway's own (Stripe's
// Payment Element, Omise's card form, Beam's hosted page): no card number ever passes through this page's code or
// Inn's servers. A hotel without a gateway shows none of this, and book.js keeps today's PromptPay QR and slip.
//
// Also: the rest of the stay for a confirmed booking, a guest cancelling a confirmed booking after seeing the fee, and
// payment links the hotel sends (?pay=<link>&t=<token>; the token is then kept in this tab, never sent to a
// gateway). Loaded before book.js; it uses book.js's helpers (makeElement, requestBookingEngine, formattedMoney,
// pageLanguage, showGuestBooking …) when called.
"use strict";

const checkoutStrings = {
  th: {
    payNow: "ชำระเงินตอนนี้",
    payByCard: "บัตรเครดิต / เดบิต",
    payByCardAndWallets: "บัตร, Apple Pay, Google Pay",
    payByPromptPay: "พร้อมเพย์ (ยืนยันอัตโนมัติ)",
    orTransfer: "หรือโอนเงินแล้วแนบสลิป",
    keepCard: "เก็บบัตรไว้กับโรงแรม",
    pay: (amount) => `ชำระ ${amount}`,
    paying: "กำลังชำระเงิน…",
    checkingPayment: "กำลังตรวจสอบการชำระเงิน…",
    scanPromptPay: "สแกน QR ด้วยแอปธนาคาร ระบบจะยืนยันเองเมื่อได้รับเงิน",
    qrExpired: "QR นี้หมดเวลาแล้ว เลือกวิธีชำระอีกครั้ง",
    chooseAnotherWay: "เลือกวิธีอื่น",
    tryAgain: "ลองอีกครั้ง",
    paymentFailed: "การชำระเงินไม่สำเร็จ ลองอีกครั้ง หรือใช้วิธีอื่น",
    cardDeclined: "บัตรนี้ใช้ไม่ได้ ลองบัตรอื่น หรือใช้วิธีอื่น",
    gatewayUnavailable: "ระบบชำระเงินไม่ตอบ ลองอีกครั้งในอีกสักครู่",
    tooManyAttempts: "ลองหลายครั้งเกินไป รอสักครู่ หรือโอนเงินแล้วแนบสลิป",
    methodUnavailable: "โรงแรมไม่รับวิธีนี้ตอนนี้",
    testMode: "โหมดทดสอบ: ไม่มีการเรียกเก็บเงินจริง",
    secureNote: "ข้อมูลบัตรกรอกในหน้าของผู้ให้บริการชำระเงินโดยตรง Inn ไม่เห็นเลขบัตร",
    payRest: "ชำระส่วนที่เหลือ",
    cancelConfirmed: "ยกเลิกการจอง",
    cancellationFee: "ค่าธรรมเนียมการยกเลิก",
    refundDue: "เงินที่จะได้คืน",
    stillToPay: "ยอดที่ยังต้องชำระ",
    freeUntil: (date) => `ยกเลิกฟรีถึง ${date}`,
    refundNote: "โรงแรมจะคืนเงินตามช่องทางที่ชำระ",
    termsChanged: "เงื่อนไขการยกเลิกเปลี่ยนแล้ว ดูยอดใหม่ด้านบน",
    cancelFailed: "ยกเลิกไม่สำเร็จ ลองอีกครั้ง หรือติดต่อโรงแรม",
    confirmCancel: "ยืนยันการยกเลิก",
    keepBooking: "ไม่ยกเลิก",
    linkTitle: "ลิงก์ชำระเงิน",
    linkExpired: "ลิงก์นี้หมดอายุแล้ว ขอลิงก์ใหม่จากโรงแรม",
    linkPaid: "ชำระเงินแล้ว ขอบคุณค่ะ",
    linkOpenAgain: "เปิดลิงก์ชำระเงินจากโรงแรมอีกครั้ง เพื่อดูผลการชำระ",
    bookingOpenAgain: "กำลังตรวจสอบการชำระเงิน เปิดลิงก์การจองของคุณเพื่อดูผล",
    holdNote: "เป็นการกันวงเงินในบัตร ยังไม่ตัดเงิน โรงแรมจะปลดเมื่อเช็กเอาต์",
    booking: (number) => `การจองหมายเลข ${number}`,
  },
  en: {
    payNow: "Pay now",
    payByCard: "Credit or debit card",
    payByCardAndWallets: "Card, Apple Pay, Google Pay",
    payByPromptPay: "PromptPay (confirms by itself)",
    orTransfer: "Or transfer and attach the slip",
    keepCard: "Keep my card with the hotel",
    pay: (amount) => `Pay ${amount}`,
    paying: "Paying…",
    checkingPayment: "Checking your payment…",
    scanPromptPay: "Scan the QR with your banking app. It confirms by itself when the money arrives.",
    qrExpired: "This QR has expired. Choose how to pay again.",
    chooseAnotherWay: "Pay another way",
    tryAgain: "Try again",
    paymentFailed: "The payment didn't go through. Try again, or pay another way.",
    cardDeclined: "The card wasn't accepted. Try another card, or pay another way.",
    gatewayUnavailable: "The payment service didn't answer. Try again in a moment.",
    tooManyAttempts: "Too many tries. Wait a while, or transfer and attach the slip.",
    methodUnavailable: "The hotel doesn't take this way to pay now.",
    testMode: "Test mode: no real money is charged.",
    secureNote: "You type your card on the payment provider's own form. Inn never sees the card number.",
    payRest: "Pay the rest",
    cancelConfirmed: "Cancel booking",
    cancellationFee: "Cancellation fee",
    refundDue: "Refund due",
    stillToPay: "Still to pay",
    freeUntil: (date) => `Free cancellation until ${date}`,
    refundNote: "The hotel refunds the way you paid.",
    termsChanged: "The cancellation terms changed. See the new amounts above.",
    cancelFailed: "The booking wasn't cancelled. Try again, or contact the hotel.",
    confirmCancel: "Cancel the booking",
    keepBooking: "Keep it",
    linkTitle: "Payment link",
    linkExpired: "This link has expired. Ask the hotel for a new one.",
    linkPaid: "Paid. Thank you.",
    linkOpenAgain: "Open the hotel's payment link again to see how the payment went.",
    bookingOpenAgain: "Your payment is being checked. Open your booking link to see it.",
    holdNote: "This holds the amount on your card without charging it. The hotel releases it at check-out.",
    booking: (number) => `Booking ${number}`,
  },
};

function checkoutText(key, ...values) {
  const text = checkoutStrings[pageLanguage][key] ?? checkoutStrings.en[key];
  return typeof text === "function" ? text(...values) : text;
}

const checkoutErrorKeys = {
  payment_declined: "cardDeclined",
  gateway_unavailable: "gatewayUnavailable",
  too_many_payment_attempts: "tooManyAttempts",
  payment_method_unavailable: "methodUnavailable",
  card_payments_unavailable: "methodUnavailable",
  payment_link_expired: "linkExpired",
  payment_link_already_paid: "linkPaid",
  payment_not_open: "paymentFailed",
};

function checkoutError(error) {
  const key = checkoutErrorKeys[error?.code];
  if (key) return checkoutText(key);
  return localizedStrings[pageLanguage][error?.code] ? errorMessage(error) : checkoutText("paymentFailed");
}

/** Loads a gateway's own script once (Stripe.js must come from js.stripe.com, Omise.js from cdn.omise.co). */
const loadedScripts = new Map();
function loadScript(url) {
  if (!loadedScripts.has(url)) {
    loadedScripts.set(url, new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = url;
      script.onload = resolve;
      script.onerror = () => reject(new Error("script_not_loaded"));
      document.head.append(script);
    }));
  }
  return loadedScripts.get(url);
}

/** This page, with `parameters`, as the gateway's return address: never with the guest's or a link's token. */
function returnAddress(parameters) {
  const url = new URL(location.origin + location.pathname);
  if (bookingEngineURL !== productionBookingEngineURL) url.searchParams.set("booking_engine", bookingEngineURL);
  for (const [name, value] of Object.entries(parameters)) url.searchParams.set(name, value);
  return url.toString();
}

/** The one payment being watched; a new one, or a redraw of the booking, stops the old. */
let stopWatchingPayment = () => {};
function stopCheckoutPolling() {
  stopWatchingPayment();
  stopWatchingPayment = () => {};
}

/** Asks every few seconds until the payment settles (the booking engine asks the gateway when its webhook is late),
 * or until `until` (a time) passes. `done` gets the payment, or null when time ran out. */
function watchPayment(paymentPath, query, until, done) {
  stopCheckoutPolling();
  let timer = null;
  let isStopped = false;
  const ask = async () => {
    if (isStopped) return;
    try {
      const { payment } = await requestBookingEngine("GET", paymentPath.path, { ...paymentPath.options, query });
      if (isStopped) return;
      if (!["created", "requires_action"].includes(payment.status)) return done(payment);
    } catch {
      // Asked again below.
    }
    if (Date.now() > until) return done(null);
    timer = setTimeout(ask, 4000);
  };
  stopWatchingPayment = () => {
    isStopped = true;
    clearTimeout(timer);
  };
  ask();
}

function isSettled(payment) {
  return payment && ["captured", "partially_captured", "authorized"].includes(payment.status);
}

/** The gateway's own checkout, in `box`. `paths` say where to send the card token and what to poll; `onPaid` runs
 * once the payment settles, `onRestart` lets the guest choose again (a declined card makes a new payment). */
async function showCheckout(box, payment, paths, onPaid, onRestart) {
  const checkout = payment.checkout;
  const errorParagraph = makeElement("p", { className: "error", role: "alert" });
  const amountText = formattedMoney(payment.amount, payment.currency_code);
  const restartButton = (label = checkoutText("chooseAnotherWay")) =>
    makeElement("button", { type: "button", className: "secondary block", onclick: () => {
      stopCheckoutPolling();
      onRestart();
    } }, label);
  const settle = (final) => {
    if (isSettled(final)) return onPaid(final);
    box.replaceChildren(makeElement("p", { className: "error", role: "alert" },
      final ? checkoutText("paymentFailed") : checkoutText("qrExpired")), restartButton(checkoutText("tryAgain")));
  };
  box.replaceChildren(makeElement("p", { className: "muted small" }, checkoutText("checkingPayment")));
  switch (checkout?.kind) {
    case "redirect":
      location.href = checkout.url;
      return;
    case "promptpay_qr": {
      const image = makeElement("img", {
        className: "qr", alt: "PromptPay QR",
        src: checkout.qr_image_url ?? `data:image/png;base64,${checkout.qr_image_base64}`,
      });
      box.replaceChildren(makeElement("p", { className: "small" }, checkoutText("scanPromptPay")), image,
        makeElement("p", { className: "muted small" }, checkoutText("checkingPayment")), restartButton());
      // Watched until the QR expires (15 minutes), not a fixed number of tries.
      const until = Date.parse(checkout.expires_at ?? "") || Date.now() + 15 * 60_000;
      watchPayment(paths.poll, paths.query, until + 30_000, settle);
      return;
    }
    case "stripe_payment_element": {
      await loadScript("https://js.stripe.com/v3/");
      const stripe = window.Stripe(checkout.publishable_key, { stripeAccount: checkout.stripe_account, locale: pageLanguage });
      const elements = stripe.elements({ clientSecret: checkout.client_secret });
      const express = makeElement("div", { id: "express-checkout" });
      const fields = makeElement("div", { id: "payment-element" });
      const payButton = makeElement("button", { type: "button", className: "block" }, checkoutText("pay", amountText));
      box.replaceChildren(express, fields, errorParagraph, payButton, restartButton(),
        makeElement("p", { className: "muted small" }, checkoutText("secureNote")));
      const returnURL = returnAddress(paths.returnParameters);
      // Apple Pay and Google Pay as one-tap buttons where the device has them; card fields below.
      const expressElement = elements.create("expressCheckout");
      expressElement.on("confirm", async () => {
        const { error } = await stripe.confirmPayment({ elements, confirmParams: { return_url: returnURL } });
        if (error) errorParagraph.textContent = error.message ?? checkoutText("paymentFailed");
      });
      expressElement.mount(express);
      elements.create("payment").mount(fields);
      payButton.addEventListener("click", async () => {
        payButton.disabled = true;
        payButton.textContent = checkoutText("paying");
        errorParagraph.textContent = "";
        const { error } = await stripe.confirmPayment({ elements, confirmParams: { return_url: returnURL } });
        // Only reached when Stripe couldn't send the guest on (a declined card, a missing field): Stripe's own words.
        errorParagraph.textContent = error?.message ?? checkoutText("paymentFailed");
        payButton.disabled = false;
        payButton.textContent = checkoutText("pay", amountText);
      });
      return;
    }
    case "omise_card_form": {
      await loadScript("https://cdn.omise.co/omise.js");
      const payButton = makeElement("button", { type: "button", className: "block" }, checkoutText("pay", amountText));
      box.replaceChildren(errorParagraph, payButton, restartButton(),
        makeElement("p", { className: "muted small" }, checkoutText("secureNote")));
      window.OmiseCard.configure({ publicKey: checkout.public_key });
      payButton.addEventListener("click", () => {
        errorParagraph.textContent = "";
        // Omise's own card form, in its iframe; it gives back a one-use token. One token per payment: a declined
        // card starts a new payment.
        window.OmiseCard.open({
          amount: checkout.amount_minor, currency: checkout.currency, defaultPaymentMethod: "credit_card",
          frameLabel: document.title, submitLabel: checkoutText("pay", amountText), locale: pageLanguage,
          onCreateTokenSuccess: async (token) => {
            payButton.disabled = true;
            payButton.textContent = checkoutText("paying");
            try {
              const result = await requestBookingEngine("POST", paths.cardToken.path, {
                ...paths.cardToken.options,
                body: { ...paths.cardToken.body, card_token: token, page_url: returnAddress({}) },
              });
              if (result.payment.redirect_url) {
                location.href = result.payment.redirect_url;
                return;
              }
              if (isSettled(result.payment)) return onPaid(result.payment);
              box.replaceChildren(makeElement("p", { className: "error", role: "alert" }, checkoutText("cardDeclined")),
                restartButton(checkoutText("tryAgain")));
            } catch (error) {
              box.replaceChildren(makeElement("p", { className: "error", role: "alert" }, checkoutError(error)),
                restartButton(checkoutText("tryAgain")));
            }
          },
        });
      });
      return;
    }
    default:
      box.replaceChildren(makeElement("p", { className: "error" }, checkoutText("paymentFailed")), restartButton());
  }
}

/** The "pay now" choices for `options`, which start a payment with `start(method, keepsCard, box)`. */
function paymentChoices(options, start) {
  const box = makeElement("div", {});
  const showChoices = () => {
    const errorParagraph = makeElement("p", { className: "error", role: "alert" });
    const keepCard = options.saved_card_terms &&
      makeElement("input", { type: "checkbox", id: "keep-card", style: "width:auto;min-height:0" });
    const choose = async (method, button) => {
      errorParagraph.textContent = "";
      button.disabled = true;
      try {
        await start(method, Boolean(keepCard?.checked && method === "card"), box, showChoices);
      } catch (error) {
        errorParagraph.textContent = checkoutError(error);
        button.disabled = false;
      }
    };
    const buttons = options.methods.map((method) => {
      const label = method === "promptpay" ? checkoutText("payByPromptPay")
        : options.has_wallets ? checkoutText("payByCardAndWallets") : checkoutText("payByCard");
      const button = makeElement("button", { type: "button", className: method === "card" ? "block" : "block secondary-fill" }, label);
      button.addEventListener("click", () => choose(method, button));
      return button;
    });
    box.replaceChildren(...buttons.flatMap((button) => [button, makeElement("div", { className: "gap" })]));
    if (keepCard) {
      box.append(makeElement("label", { className: "small consent", for: "keep-card" }, keepCard, " ",
        checkoutText("keepCard"), makeElement("span", { className: "muted small block-text" },
          options.saved_card_terms.consent_text)));
    }
    box.append(errorParagraph);
  };
  showChoices();
  return box;
}

// MARK: The guest's booking

function bookingPaymentPaths(booking, bookingID, accessToken, paymentID) {
  return {
    poll: { path: `/bookings/${bookingID}/payments/${paymentID}`, options: { accessToken } },
    cardToken: { path: `/bookings/${bookingID}/payments/${paymentID}/card-token`, options: { accessToken }, body: {} },
    returnParameters: { h: booking.booking_page_code ?? "", b: bookingID, paid: paymentID },
  };
}

/** The gateway's part of the payment card, while the deposit is due; empty for a hotel without a gateway. */
function gatewayPaymentSection(booking, bookingID, accessToken) {
  const section = makeElement("div", {});
  requestBookingEngine("GET", `/bookings/${bookingID}/payment-options`, { accessToken }).then(({ payment_options: options }) => {
    if (!options.is_available) return;
    const choices = paymentChoices(options, async (method, keepsCard, box, showChoices) => {
      const { payment } = await requestBookingEngine("POST", `/bookings/${bookingID}/payments`, {
        accessToken, body: { method, keeps_card: keepsCard, page_url: returnAddress({}) },
      });
      await showCheckout(box, payment, bookingPaymentPaths(booking, bookingID, accessToken, payment.id),
        () => showGuestBooking(bookingID, accessToken), showChoices);
    });
    section.replaceChildren(
      makeElement("h3", {}, checkoutText("payNow")),
      options.is_test_mode && makeElement("p", { className: "test-mode small" }, checkoutText("testMode")),
      choices,
      // The hotel's own QR or bank details follow only when it has them.
      booking.payment_instructions && makeElement("p", { className: "divider muted small" }, checkoutText("orTransfer")));
  }).catch(() => {
    // Without the gateway's part, the slip below still works.
  });
  return section;
}

/** For a confirmed booking: pay the rest by card, and cancel after seeing the fee. */
function confirmedBookingActions(booking, bookingID, accessToken) {
  const section = makeElement("div", {});
  requestBookingEngine("GET", `/bookings/${bookingID}/payment-options`, { accessToken }).then(({ payment_options: options }) => {
    if (!options.is_available || options.purpose !== "balance") return;
    const card = makeElement("div", { className: "card" }, makeElement("h3", {}, checkoutText("payRest")),
      makeElement("p", { className: "amount" }, formattedMoney(options.amount, options.currency)),
      options.is_test_mode && makeElement("p", { className: "test-mode small" }, checkoutText("testMode")));
    card.append(paymentChoices(options, async (method, keepsCard, box, showChoices) => {
      const { payment } = await requestBookingEngine("POST", `/bookings/${bookingID}/payments`, {
        accessToken, body: { method, keeps_card: keepsCard, page_url: returnAddress({}) },
      });
      await showCheckout(box, payment, bookingPaymentPaths(booking, bookingID, accessToken, payment.id),
        () => showGuestBooking(bookingID, accessToken), showChoices);
    }));
    section.prepend(card);
  }).catch(() => {});
  section.append(cancelConfirmedBookingButton(bookingID, accessToken));
  return section;
}

function cancelConfirmedBookingButton(bookingID, accessToken) {
  const holder = makeElement("div", {});
  const button = makeElement("button", { type: "button", className: "danger" }, checkoutText("cancelConfirmed"));
  button.addEventListener("click", () => {
    button.disabled = true;
    showCancellationTerms(holder, bookingID, accessToken, "").finally(() => {
      button.disabled = false;
    });
  });
  holder.append(button);
  return holder;
}

/** The fee and refund if cancelled now, and the button that cancels with exactly that fee. */
async function showCancellationTerms(holder, bookingID, accessToken, notice) {
  let terms;
  try {
    terms = (await requestBookingEngine("GET", `/bookings/${bookingID}/cancellation-terms`, { accessToken }))
      .cancellation_terms;
  } catch (error) {
    return alert(errorMessage(error));
  }
  if (!terms.can_cancel_on_page) return alert(localizedText("booking_not_cancellable"));
  const money = (amount) => formattedMoney(amount, terms.currency_code);
  const errorParagraph = makeElement("p", { className: "error", role: "alert" }, notice);
  const confirmButton = makeElement("button", { type: "button", className: "block danger-fill" }, checkoutText("confirmCancel"));
  confirmButton.addEventListener("click", async () => {
    confirmButton.disabled = true;
    errorParagraph.textContent = "";
    try {
      await requestBookingEngine("POST", `/bookings/${bookingID}/cancel`, {
        accessToken, body: { agreed_fee_amount: terms.fee_amount },
      });
      showGuestBooking(bookingID, accessToken);
    } catch (error) {
      // The terms changed while the guest read them (the free-cancellation date passed): show the new ones.
      if (error.code === "cancellation_terms_changed") {
        return showCancellationTerms(holder, bookingID, accessToken, checkoutText("termsChanged"));
      }
      errorParagraph.textContent = localizedStrings[pageLanguage][error.code] ? errorMessage(error) : checkoutText("cancelFailed");
      confirmButton.disabled = false;
    }
  });
  holder.replaceChildren(makeElement("div", { className: "card" },
    makeElement("h3", {}, checkoutText("cancelConfirmed")),
    terms.free_cancellation_until && makeElement("p", { className: "small" },
      checkoutText("freeUntil", formattedStayDate(terms.free_cancellation_until.slice(0, 10)))),
    makeElement("table", { className: "lines" }, makeElement("tbody", {},
      makeElement("tr", {}, makeElement("td", {}, checkoutText("cancellationFee")), makeElement("td", {}, money(terms.fee_amount))),
      terms.balance_amount > 0
        ? makeElement("tr", { className: "total" }, makeElement("td", {}, checkoutText("stillToPay")),
          makeElement("td", {}, money(terms.balance_amount)))
        : makeElement("tr", { className: "total" }, makeElement("td", {}, checkoutText("refundDue")),
          makeElement("td", {}, money(terms.refund_amount))))),
    terms.refund_amount > 0 && makeElement("p", { className: "muted small" }, checkoutText("refundNote")),
    errorParagraph, confirmButton,
    makeElement("button", { type: "button", className: "secondary block", onclick: () => showGuestBooking(bookingID, accessToken) },
      checkoutText("keepBooking"))));
}

// MARK: Coming back from the gateway, and the hotel's payment links

/** The link's token, kept in this tab when the guest opened the link, so the gateway's return address needn't
 * carry it. */
function linkTokenFor(linkID) {
  const fromURL = new URLSearchParams(location.search).get("t");
  try {
    if (fromURL && /^[0-9a-f]{48}$/.test(fromURL)) sessionStorage.setItem(`inn.link.${linkID}`, fromURL);
    return fromURL ?? sessionStorage.getItem(`inn.link.${linkID}`);
  } catch {
    return fromURL;
  }
}

/** This page's address without what the gateway added on the way back. */
function addressWithout(...names) {
  const url = new URL(location.href);
  for (const name of names) url.searchParams.delete(name);
  return url;
}

/** Handles ?paid= (back from 3-D Secure or a hosted page) and ?pay= (a link from the hotel). True when it did. */
function showsCheckoutPageForLocation() {
  const gatewayParameters = ["payment_intent", "payment_intent_client_secret", "redirect_status"];
  // Read afresh: this runs again on a language change, after the address was cleaned.
  const parameters = new URLSearchParams(location.search);
  const linkID = parameters.get("pay");
  if (linkID && /^[0-9a-f-]{36}$/.test(linkID)) {
    const linkToken = linkTokenFor(linkID);
    const paidPaymentID = parameters.get("paid");
    history.replaceState(null, "", addressWithout("t", "paid", ...gatewayParameters));
    if (!linkToken || !/^[0-9a-f]{48}$/.test(linkToken)) {
      replacePageContent(pageHeader(), makeElement("p", {}, checkoutText("linkOpenAgain")));
      return true;
    }
    showPaymentLink(linkID, linkToken, paidPaymentID);
    return true;
  }
  const paymentID = parameters.get("paid");
  const bookingID = parameters.get("b");
  if (paymentID && bookingID && !location.hash.startsWith("#b=")) {
    const saved = bookingsSavedOnThisDevice().find((booking) => booking.id === bookingID);
    const cleanURL = addressWithout("paid", "b", ...gatewayParameters);
    if (!saved?.access_token) {
      // Back in another browser than the one that booked (a LINE in-app browser, then Safari): no token here.
      history.replaceState(null, "", cleanURL);
      replacePageContent(pageHeader(), makeElement("p", {}, checkoutText("bookingOpenAgain")));
      return true;
    }
    const token = saved.access_token;
    history.replaceState(null, "", `${cleanURL.pathname}${cleanURL.search}#b=${bookingID}.${token}`);
    replacePageContent(pageHeader(), makeElement("p", { className: "muted" }, checkoutText("checkingPayment")));
    watchPayment({ path: `/bookings/${bookingID}/payments/${paymentID}`, options: { accessToken: token } }, undefined,
      Date.now() + 60_000, () => showGuestBooking(bookingID, token));
    return true;
  }
  return false;
}

async function showPaymentLink(linkID, linkToken, paidPaymentID) {
  let link;
  try {
    link = (await requestBookingEngine("GET", `/payment-links/${linkID}`, { query: { token: linkToken } })).payment_link;
  } catch (error) {
    return replacePageContent(pageHeader(), errorWithRetry(error, () => showPaymentLink(linkID, linkToken, paidPaymentID)));
  }
  document.title = `${displayedHotelName(link.hotel_name, link.hotel_name_en)} · ${checkoutText("linkTitle")}`;
  const header = makeElement("div", { className: "card" },
    makeElement("h3", {}, displayedHotelName(link.hotel_name, link.hotel_name_en)),
    makeElement("p", { className: "muted small" }, checkoutText("booking", link.booking_number)),
    link.reason_text && makeElement("p", {}, link.reason_text),
    makeElement("p", { className: "amount" }, formattedMoney(link.amount, link.currency_code)),
    link.kind === "hold" && makeElement("p", { className: "muted small" }, checkoutText("holdNote")));
  if (link.is_paid) {
    return replacePageContent(pageHeader(), makeElement("p", { className: "state good" }, checkoutText("linkPaid")), header);
  }
  if (link.is_expired) {
    return replacePageContent(pageHeader(), makeElement("p", { className: "state bad" }, checkoutText("linkExpired")), header);
  }
  if (paidPaymentID && /^[0-9a-f-]{36}$/.test(paidPaymentID)) {
    replacePageContent(pageHeader(), header, makeElement("p", { className: "muted" }, checkoutText("checkingPayment")));
    return watchPayment({ path: `/payment-links/${linkID}/payments/${paidPaymentID}`, options: {} }, { token: linkToken },
      Date.now() + 60_000, () => showPaymentLink(linkID, linkToken, null));
  }
  const choices = paymentChoices({ ...link, has_wallets: link.provider === "stripe", saved_card_terms: null },
    async (method, _keepsCard, box, showChoices) => {
      const { payment } = await requestBookingEngine("POST", `/payment-links/${linkID}/payments`, {
        body: { token: linkToken, method, page_url: returnAddress({}) },
      });
      await showCheckout(box, payment, {
        poll: { path: `/payment-links/${linkID}/payments/${payment.id}`, options: {} },
        query: { token: linkToken },
        cardToken: { path: `/payment-links/${linkID}/payments/${payment.id}/card-token`, options: {}, body: { token: linkToken } },
        returnParameters: { pay: linkID, paid: payment.id },
      }, () => showPaymentLink(linkID, linkToken, null), showChoices);
    });
  replacePageContent(pageHeader(), makeElement("p", { className: "state warn" }, checkoutText("linkTitle")), header,
    link.is_test_mode && makeElement("p", { className: "test-mode small" }, checkoutText("testMode")),
    makeElement("div", { className: "card" }, choices));
}

window.InnCheckout = {
  gatewayPaymentSection,
  confirmedBookingActions,
  showsCheckoutPageForLocation,
  stopCheckoutPolling,
};
