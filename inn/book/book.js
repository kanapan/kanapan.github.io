// A hotel's booking page: pick dates and a room, book, then pay and send the slip.
// Links: /inn/book/?h=<booking page code> for the hotel, and #b=<booking id>.<access token> for a booking. The token
// is only in the fragment, which browsers never send to a server, and in this browser's storage so the guest can
// come back. Every price comes from the booking engine (the `booking-engine` edge function); this page only shows it.
"use strict";

const productionBookingEngineURL = "https://huajuadlepkzptizxeyf.supabase.co/functions/v1/booking-engine";
const pageParameters = new URLSearchParams(location.search);
// A copy of the page served on this computer may point at a function served on this computer, for testing.
const bookingEngineURL = ["localhost", "127.0.0.1"].includes(location.hostname) && pageParameters.get("booking_engine")
  ? pageParameters.get("booking_engine") : productionBookingEngineURL;
const pageContent = document.getElementById("app");

/** The link to a hotel's booking page, keeping the test booking engine of a copy served on this computer. */
function bookingPageLink(bookingPageCode) {
  const parameters = new URLSearchParams({ h: bookingPageCode });
  if (bookingEngineURL !== productionBookingEngineURL) parameters.set("booking_engine", bookingEngineURL);
  return `?${parameters}`;
}

// MARK: - Language

const localizedStrings = {
  th: {
    title: "จองห้องพัก",
    otherLanguage: "English",
    checkIn: "เช็กอิน",
    checkOut: "เช็กเอาต์",
    adults: "ผู้ใหญ่",
    children: "เด็ก",
    infants: "ทารก (ต่ำกว่า 2 ปี)",
    promoCode: "โค้ดส่วนลด (ถ้ามี)",
    searchRoomOffers: "ดูห้องว่าง",
    searchingRoomOffers: "กำลังหาห้องว่าง…",
    nightCount: (count) => `${count} คืน`,
    guestCount: (adults, children, infants) => (children ? `ผู้ใหญ่ ${adults} · เด็ก ${children}` : `ผู้ใหญ่ ${adults}`) +
      (infants ? ` · ทารก ${infants}` : ""),
    roomsLeft: (count) => count <= 3 ? `เหลือ ${count} ห้อง` : "",
    chooseRoomOffer: "เลือก",
    breakfastIncluded: "รวมอาหารเช้า",
    roomOnly: "ไม่รวมอาหารเช้า",
    soldOut: "เต็มแล้วในวันที่เลือก",
    tooManyGuests: "พักได้ไม่ถึงจำนวนคนที่เลือก",
    tooFewNights: (count) => `ต้องพักอย่างน้อย ${count} คืน`,
    tooManyNights: (count) => `พักได้ไม่เกิน ${count} คืน`,
    closedNights: "ไม่เปิดขายบางคืนในวันที่เลือก",
    closedToArrival: "ไม่รับเช็กอินในวันที่เลือก",
    closedToDeparture: "ไม่รับเช็กเอาต์ในวันที่เลือก",
    outsideBookingWindow: "ไม่เปิดขายสำหรับวันเข้าพักนี้",
    notSold: "ยังไม่เปิดขายในวันที่เลือก",
    arrivalClosedHint: "ไม่รับเช็กอินในวันที่เลือก เลือกวันอื่น",
    departureClosedHint: "ไม่รับเช็กเอาต์ในวันที่เลือก เลือกวันอื่น",
    soldOutHint: "ห้องเต็มในคืนที่เลือก",
    minimumStayHint: (count) => `เช็กอินวันที่เลือกต้องพักอย่างน้อย ${count} คืน`,
    promotionApplied: (code, name) => `ใช้โค้ด ${code} แล้ว: ${name}`,
    promotionInvalid: "โค้ดนี้ใช้ไม่ได้",
    promotionNotStarted: "โค้ดนี้ยังไม่เริ่มใช้",
    promotionEnded: "โค้ดนี้หมดเขตแล้ว",
    promotionUsedUp: "โค้ดนี้ถูกใช้ครบแล้ว",
    promotionNotForThisStay: "โค้ดนี้ใช้กับวันหรือห้องที่เลือกไม่ได้",
    priceBeforeCode: "ราคาก่อนใช้โค้ด",
    promotionLine: (code) => `โปรโมชัน ${code}`,
    wasNow: (was, now) => `ราคาปกติ ${was} ลดเหลือ ${now}`,
    promotionUsed: (code) => `โค้ด ${code}`,
    noRoomOffers: "ไม่มีห้องว่างในวันที่เลือก ลองเปลี่ยนวัน",
    yourStay: "การเข้าพักของคุณ",
    roomAmount: "ค่าห้อง",
    total: "รวม",
    taxesIncluded: "รวมภาษีและค่าธรรมเนียมแล้ว",
    payWhenBooking: "จ่ายตอนจอง",
    payAtHotel: "จ่ายที่โรงแรม",
    paid: "จ่ายแล้ว",
    guestDetails: "ข้อมูลผู้เข้าพัก",
    guestName: "ชื่อ-นามสกุล",
    guestPhone: "เบอร์โทร",
    guestEmail: "อีเมล (ไม่บังคับ)",
    guestNote: "ข้อความถึงโรงแรม (ไม่บังคับ)",
    guestNotePlaceholder: "เช่น เวลาที่จะมาถึง",
    confirmBooking: "ยืนยันการจอง",
    confirmingBooking: "กำลังจอง…",
    back: "ย้อนกลับ",
    acceptPolicies: "การกดยืนยันถือว่ายอมรับนโยบายของโรงแรมด้านบน",
    policies: "นโยบายของโรงแรม",
    about: "เกี่ยวกับที่พัก",
    amenities: "สิ่งอำนวยความสะดวก",
    contact: "ติดต่อโรงแรม",
    openMap: "ดูแผนที่",
    directions: "การเดินทาง",
    yourBookings: "การจองของคุณ",
    notTakingBookings: "โรงแรมนี้ยังไม่เปิดรับจองออนไลน์ ติดต่อโรงแรมโดยตรง",
    awaitingPayment: "รอการชำระเงิน",
    holdExplanation: "เรากันห้องไว้ให้ 1 ชั่วโมง โอนแล้วแนบสลิปภายในเวลานี้ ไม่อย่างนั้นการจองจะถูกยกเลิก",
    holdExplanationCard: "เรากันห้องไว้ให้ 1 ชั่วโมง ชำระภายในเวลานี้ ไม่อย่างนั้นการจองจะถูกยกเลิก",
    timeLeft: (time) => `เหลือเวลา ${time}`,
    scanToPay: "สแกนจ่ายด้วยแอปธนาคารใดก็ได้ ยอดเงินจะขึ้นให้เอง",
    saveQRCode: "กดค้างที่ QR เพื่อบันทึกรูป แล้วเปิดในแอปธนาคาร",
    transferTo: "โอนเข้าบัญชี",
    bankName: "ธนาคาร",
    accountName: "ชื่อบัญชี",
    accountNumber: "เลขบัญชี",
    attachPaymentSlip: "แนบสลิปการโอน",
    sendPaymentSlip: "ส่งสลิป",
    sendingPaymentSlip: "กำลังส่งสลิป…",
    choosePaymentSlipAgain: "เลือกรูปใหม่",
    awaitingApproval: "รอโรงแรมยืนยัน",
    awaitingApprovalExplanation: "โรงแรมจะดูการจองแล้วยืนยันให้ หน้านี้จะเปลี่ยนเองเมื่อยืนยันแล้ว ไม่ต้องจ่ายอะไรตอนนี้",
    paymentSlipSent: "ส่งสลิปแล้ว รอโรงแรมตรวจสอบ",
    paymentSlipSentExplanation: "โรงแรมจะยืนยันเมื่อเห็นเงินเข้า หน้านี้จะเปลี่ยนเองเมื่อยืนยันแล้ว",
    confirmed: "ยืนยันการจองแล้ว",
    confirmedExplanation: "เก็บลิงก์หน้านี้ไว้ดูการจองได้ตลอด",
    checkedIn: "เช็กอินแล้ว",
    checkedOut: "เช็กเอาต์แล้ว",
    cancelled: "การจองถูกยกเลิก",
    cancelledExplanation: "สอบถามเพิ่มเติมได้ที่โรงแรม",
    paymentDeadlinePassed: "หมดเวลาชำระเงิน การจองถูกยกเลิก",
    paymentDeadlinePassedExplanation: "ห้องกลับไปเปิดขายแล้ว จองใหม่ได้ถ้ายังว่าง",
    bookAgain: "จองใหม่",
    cancelBooking: "ยกเลิกการจองนี้",
    confirmCancellingBooking: "ยกเลิกการจองนี้ใช่ไหม",
    bookingNumber: "หมายเลขการจอง",
    keepThisLink: "บันทึกหน้านี้ไว้ ใช้กลับมาดูการจองและส่งสลิป",
    sentPaymentSlip: "สลิปที่ส่งแล้ว",
    // Error codes from the booking engine, and "network" for a request that never reached it.
    tryAgain: "ลองใหม่",
    hotelApprovesFirst: "โรงแรมจะตรวจสอบและยืนยันการจองนี้ก่อน การจองจะสมบูรณ์เมื่อโรงแรมยืนยันแล้ว หน้าถัดไปจะแสดงสถานะให้",
    network: "เชื่อมต่อไม่ได้ ตรวจอินเทอร์เน็ตแล้วลองใหม่",
    server_error: "ระบบขัดข้อง ลองใหม่อีกครั้ง",
    booking_page_not_found: "ไม่พบหน้าจองนี้ หรือโรงแรมปิดรับจองออนไลน์แล้ว",
    booking_page_not_ready: "โรงแรมนี้ยังไม่เปิดรับจองออนไลน์ ติดต่อโรงแรมโดยตรง",
    invalid_dates: "เลือกวันเช็กอินและเช็กเอาต์ใหม่",
    invalid_guests: "จำนวนผู้เข้าพักไม่ถูกต้อง",
    missing_guest_name: "ใส่ชื่อผู้เข้าพัก",
    invalid_guest_phone: "ใส่เบอร์โทรที่ติดต่อได้",
    invalid_guest_email: "อีเมลไม่ถูกต้อง",
    room_offer_changed: "ราคาหรือห้องเปลี่ยนไปแล้ว ดูห้องว่างอีกครั้ง",
    invalid_promo_code: "โค้ดส่วนลดนี้ใช้ไม่ได้",
    too_many_promo_code_attempts: "ลองโค้ดหลายครั้งเกินไป ลองใหม่ในอีก 1 ชั่วโมง",
    promotion_used_up: "คุณใช้โค้ดนี้ครบแล้ว",
    room_type_sold_out: "ห้องนี้เพิ่งเต็ม ลองห้องอื่นหรือวันอื่น",
    too_many_unpaid_bookings: "คุณมีการจองที่ยังไม่ได้ชำระเงินหลายรายการ ชำระหรือยกเลิกก่อนจองเพิ่ม",
    guest_blocked: "ไม่สามารถจองออนไลน์ได้ กรุณาติดต่อโรงแรมโดยตรง",
    prepayment_unavailable: "โรงแรมยังรับชำระเงินออนไลน์ไม่ได้ กรุณาติดต่อโรงแรม",
    booking_not_found: "ไม่พบการจองนี้",
    invalid_payment_slip_image: "ใช้รูปนี้ไม่ได้ เลือกรูปสลิปใหม่",
    booking_not_awaiting_payment: "การจองนี้ไม่ได้รอชำระเงินแล้ว",
    booking_not_cancellable: "ยกเลิกเองไม่ได้แล้ว ติดต่อโรงแรมเพื่อยกเลิก",
    booking_cancel_after_slip: "ส่งสลิปแล้ว ยกเลิกเองไม่ได้ ติดต่อโรงแรมเพื่อยกเลิก",
    booking_already_confirmed: "โรงแรมยืนยันการจองแล้ว ยกเลิกเองไม่ได้ ติดต่อโรงแรมเพื่อยกเลิก",
    payment_deadline_passed: "หมดเวลาชำระเงินแล้ว การจองนี้ถูกยกเลิกไปแล้ว",
    body_too_large: "รูปใหญ่เกินไป เลือกรูปสลิปใหม่",
  },
  en: {
    title: "Book a stay",
    otherLanguage: "ภาษาไทย",
    checkIn: "Check-in",
    checkOut: "Check-out",
    adults: "Adults",
    children: "Children",
    infants: "Infants (under 2)",
    promoCode: "Promo code (optional)",
    searchRoomOffers: "See available rooms",
    searchingRoomOffers: "Finding rooms…",
    nightCount: (count) => count === 1 ? "1 night" : `${count} nights`,
    guestCount: (adults, children, infants) => `${adults} ${adults === 1 ? "adult" : "adults"}` +
      (children ? ` · ${children} ${children === 1 ? "child" : "children"}` : "") +
      (infants ? ` · ${infants} ${infants === 1 ? "infant" : "infants"}` : ""),
    roomsLeft: (count) => count <= 3 ? (count === 1 ? "1 room left" : `${count} rooms left`) : "",
    chooseRoomOffer: "Choose",
    breakfastIncluded: "Breakfast included",
    roomOnly: "Room only",
    soldOut: "Sold out on these dates",
    tooManyGuests: "Doesn't fit this many guests",
    tooFewNights: (count) => `Minimum stay ${count} nights`,
    tooManyNights: (count) => `Maximum stay ${count} nights`,
    closedNights: "Not on sale for some of these nights",
    closedToArrival: "No check-ins on this date",
    closedToDeparture: "No check-outs on this date",
    outsideBookingWindow: "Not on sale for this arrival date",
    notSold: "Not on sale for these dates",
    arrivalClosedHint: "No check-ins on this date. Choose another.",
    departureClosedHint: "No check-outs on this date. Choose another.",
    soldOutHint: "Fully booked this night",
    minimumStayHint: (count) => `Arriving this day, stay at least ${count} nights`,
    promotionApplied: (code, name) => `Code ${code} applied: ${name}`,
    promotionInvalid: "This code isn't valid",
    promotionNotStarted: "This code can't be used yet",
    promotionEnded: "This code has ended",
    promotionUsedUp: "This code has been fully used",
    promotionNotForThisStay: "This code doesn't apply to these dates or rooms",
    priceBeforeCode: "Price before the code",
    promotionLine: (code) => `Promotion ${code}`,
    wasNow: (was, now) => `Was ${was}, now ${now}`,
    promotionUsed: (code) => `Code ${code}`,
    noRoomOffers: "No rooms are available on these dates. Try other dates.",
    yourStay: "Your stay",
    roomAmount: "Room",
    total: "Total",
    taxesIncluded: "Taxes and fees included",
    payWhenBooking: "Pay when you book",
    payAtHotel: "Pay at the hotel",
    paid: "Paid",
    guestDetails: "Guest details",
    guestName: "Full name",
    guestPhone: "Phone",
    guestEmail: "Email (optional)",
    guestNote: "Message to the hotel (optional)",
    guestNotePlaceholder: "Such as when you'll arrive",
    confirmBooking: "Confirm booking",
    confirmingBooking: "Booking…",
    back: "Back",
    acceptPolicies: "By confirming, you accept the hotel's policies above.",
    policies: "Hotel policies",
    about: "About",
    amenities: "Amenities",
    contact: "Contact the hotel",
    openMap: "Open map",
    directions: "Getting here",
    yourBookings: "Your bookings",
    notTakingBookings: "This hotel doesn't take online bookings yet. Please contact the hotel.",
    awaitingPayment: "Waiting for payment",
    holdExplanation: "Your room is held for 1 hour. Transfer and attach the slip in that time, or the booking is cancelled.",
    holdExplanationCard: "Your room is held for 1 hour. Pay in that time, or the booking is cancelled.",
    timeLeft: (time) => `${time} left`,
    scanToPay: "Scan with any Thai banking app; the amount fills in for you.",
    saveQRCode: "Press and hold the QR code to save it, then open it in your banking app.",
    transferTo: "Transfer to",
    bankName: "Bank",
    accountName: "Account name",
    accountNumber: "Account number",
    attachPaymentSlip: "Attach your transfer slip",
    sendPaymentSlip: "Send slip",
    sendingPaymentSlip: "Sending…",
    choosePaymentSlipAgain: "Choose another picture",
    awaitingApproval: "Waiting for the hotel to confirm",
    awaitingApprovalExplanation: "The hotel looks at your booking and confirms it. This page updates by itself. Nothing to pay now.",
    paymentSlipSent: "Slip sent. Waiting for the hotel",
    paymentSlipSentExplanation: "The hotel confirms once the money arrives. This page updates by itself.",
    confirmed: "Booking confirmed",
    confirmedExplanation: "Keep this page's link to see your booking any time.",
    checkedIn: "Checked in",
    checkedOut: "Checked out",
    cancelled: "Booking cancelled",
    cancelledExplanation: "Please contact the hotel with any questions.",
    paymentDeadlinePassed: "Payment time ran out. The booking was cancelled",
    paymentDeadlinePassedExplanation: "The room is back on sale. Book again if it's still free.",
    bookAgain: "Book again",
    cancelBooking: "Cancel this booking",
    confirmCancellingBooking: "Cancel this booking?",
    bookingNumber: "Booking number",
    keepThisLink: "Bookmark this page to come back to your booking and send the slip.",
    sentPaymentSlip: "The slip you sent",
    tryAgain: "Try again",
    hotelApprovesFirst: "The hotel checks and confirms this booking first. It's complete once the hotel confirms; the next page shows when.",
    network: "Can't connect. Check your internet and try again.",
    server_error: "Something went wrong. Please try again.",
    booking_page_not_found: "This booking page doesn't exist, or the hotel has closed online booking.",
    booking_page_not_ready: "This hotel doesn't take online bookings yet. Please contact the hotel.",
    invalid_dates: "Choose your check-in and check-out dates again.",
    invalid_guests: "The number of guests isn't valid.",
    missing_guest_name: "Enter the guest's name.",
    invalid_guest_phone: "Enter a phone number the hotel can reach.",
    invalid_guest_email: "This email isn't valid.",
    room_offer_changed: "The price or the room changed. See available rooms again.",
    invalid_promo_code: "This promo code isn't valid.",
    too_many_promo_code_attempts: "Too many codes tried. Try again in an hour.",
    promotion_used_up: "You've used this code as many times as it allows.",
    room_type_sold_out: "This room just sold out. Try another room or dates.",
    too_many_unpaid_bookings: "You have several unpaid bookings. Pay or cancel them before booking more.",
    guest_blocked: "Online booking isn't available. Please contact the hotel directly.",
    prepayment_unavailable: "The hotel can't take online payments yet. Please contact the hotel.",
    booking_not_found: "No booking matches this link.",
    invalid_payment_slip_image: "This picture can't be used. Choose your slip again.",
    booking_not_awaiting_payment: "This booking isn't waiting for payment any more.",
    booking_not_cancellable: "Only the hotel can cancel this booking now. Please contact the hotel.",
    booking_cancel_after_slip: "The slip is sent, so only the hotel can cancel. Please contact the hotel.",
    booking_already_confirmed: "The hotel has confirmed this booking, so only the hotel can cancel. Please contact the hotel.",
    payment_deadline_passed: "Payment time ran out, so this booking is already cancelled.",
    body_too_large: "This picture is too large. Choose your slip again.",
  },
};

const featureNames = {
  th: {
    amenity: {
      wifi: "Wi-Fi ฟรี", airConditioning: "เครื่องปรับอากาศ", pool: "สระว่ายน้ำ", breakfast: "อาหารเช้า",
      airportShuttle: "รถรับส่งสนามบิน", restaurant: "ร้านอาหาร", bar: "บาร์", roomService: "รูมเซอร์วิส",
      kitchen: "ครัวรวม", frontDesk24Hours: "แผนกต้อนรับ 24 ชั่วโมง", luggageStorage: "รับฝากกระเป๋า",
      laundry: "บริการซักรีด", tourDesk: "บริการทัวร์", carRental: "เช่ารถหรือมอเตอร์ไซค์", fitness: "ห้องฟิตเนส",
      spa: "สปาหรือนวด", garden: "สวน", beachfront: "ติดชายหาด", kidsClub: "มุมเด็กเล่น", elevator: "ลิฟต์",
      wheelchairAccessible: "รองรับรถเข็น", evCharging: "ที่ชาร์จรถไฟฟ้า", meetingRoom: "ห้องประชุม",
      fan: "พัดลม", tv: "ทีวี", desk: "โต๊ะทำงาน", wardrobe: "ตู้เสื้อผ้า", safe: "ตู้เซฟ", balcony: "ระเบียง",
      fridge: "ตู้เย็น", minibar: "มินิบาร์", kettle: "กาต้มน้ำ", coffeeMaker: "เครื่องชงกาแฟ", kitchenette: "ครัวเล็ก",
      microwave: "ไมโครเวฟ", shower: "ฝักบัว", bathtub: "อ่างอาบน้ำ", hotWater: "น้ำอุ่น", hairDryer: "ไดร์เป่าผม",
      toiletries: "ของใช้ในห้องน้ำ", towels: "ผ้าเช็ดตัว", bathrobe: "เสื้อคลุมอาบน้ำ", washingMachine: "เครื่องซักผ้า",
    },
    bed: { king: "เตียงคิงไซซ์", queen: "เตียงควีนไซซ์", double: "เตียงดับเบิล", single: "เตียงเดี่ยว", bunk: "เตียงสองชั้น", sofaBed: "โซฟาเบด" },
    view: { sea: "วิวทะเล", beach: "วิวชายหาด", mountain: "วิวภูเขา", river: "วิวแม่น้ำ", lake: "วิวทะเลสาบ", garden: "วิวสวน", pool: "วิวสระว่ายน้ำ", city: "วิวเมือง" },
  },
  en: {
    amenity: {
      wifi: "Free Wi-Fi", airConditioning: "Air conditioning", pool: "Swimming pool", breakfast: "Breakfast",
      airportShuttle: "Airport shuttle", restaurant: "Restaurant", bar: "Bar", roomService: "Room service",
      kitchen: "Shared kitchen", frontDesk24Hours: "24-hour front desk", luggageStorage: "Luggage storage",
      laundry: "Laundry", tourDesk: "Tour desk", carRental: "Car or scooter rental", fitness: "Fitness room",
      spa: "Spa or massage", garden: "Garden", beachfront: "Beachfront", kidsClub: "Kids' play area", elevator: "Lift",
      wheelchairAccessible: "Wheelchair access", evCharging: "EV charging", meetingRoom: "Meeting room",
      fan: "Fan", tv: "TV", desk: "Desk", wardrobe: "Wardrobe", safe: "Safe", balcony: "Balcony", fridge: "Fridge",
      minibar: "Minibar", kettle: "Kettle", coffeeMaker: "Coffee maker", kitchenette: "Kitchenette",
      microwave: "Microwave", shower: "Shower", bathtub: "Bathtub", hotWater: "Hot water", hairDryer: "Hair dryer",
      toiletries: "Toiletries", towels: "Towels", bathrobe: "Bathrobe", washingMachine: "Washing machine",
    },
    bed: { king: "king bed", queen: "queen bed", double: "double bed", single: "single bed", bunk: "bunk bed", sofaBed: "sofa bed" },
    view: { sea: "Sea view", beach: "Beach view", mountain: "Mountain view", river: "River view", lake: "Lake view", garden: "Garden view", pool: "Pool view", city: "City view" },
  },
};

const savedLanguage = localStorage.getItem("inn.language");
let pageLanguage = savedLanguage === "th" || savedLanguage === "en" ? savedLanguage
  : (navigator.language || "th").toLowerCase().startsWith("th") ? "th" : "en";

function localizedText(key, ...values) {
  const text = localizedStrings[pageLanguage][key] ?? localizedStrings.en[key] ?? key;
  return typeof text === "function" ? text(...values) : text;
}

function localizedFeatureName(kind, key) {
  return featureNames[pageLanguage][kind][key] ?? key;
}

// MARK: - Building the page

/** Makes an element. Text is always set as text, so nothing an owner or guest typed becomes markup. */
function makeElement(tagName, attributes = {}, ...children) {
  const element = document.createElement(tagName);
  for (const [name, value] of Object.entries(attributes)) {
    if (value === null || value === undefined || value === false) continue;
    if (name.startsWith("on")) element.addEventListener(name.slice(2), value);
    else if (name === "className") element.className = value;
    else element.setAttribute(name, value === true ? "" : value);
  }
  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false || child === "") continue;
    element.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return element;
}

function replacePageContent(...children) {
  pageContent.replaceChildren(...children.flat(Infinity).filter(Boolean));
  window.scrollTo({ top: 0 });
}

function formattedMoney(amount, currencyCode) {
  const isWholeAmount = Math.round(amount * 100) % 100 === 0;
  return new Intl.NumberFormat(pageLanguage === "th" ? "th-TH" : "en", {
    style: "currency", currency: currencyCode,
    minimumFractionDigits: isWholeAmount ? 0 : 2, maximumFractionDigits: 2,
  }).format(amount);
}

function formattedStayDate(date) {
  return new Intl.DateTimeFormat(pageLanguage === "th" ? "th-TH" : "en-GB", {
    weekday: "short", day: "numeric", month: "short", timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

function formattedStayDates(checkIn, checkOut) {
  return `${formattedStayDate(checkIn)} – ${formattedStayDate(checkOut)}`;
}

/** Today on this device, plus `days`, as "2026-11-25". */
function todayPlusDays(days = 0) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function dateByAddingDays(date, days) {
  const moved = new Date(`${date}T00:00:00Z`);
  moved.setUTCDate(moved.getUTCDate() + days);
  return moved.toISOString().slice(0, 10);
}

function numberOfNightsBetween(checkIn, checkOut) {
  return Math.round((Date.parse(`${checkOut}T00:00:00Z`) - Date.parse(`${checkIn}T00:00:00Z`)) / 86_400_000);
}

// MARK: - The booking engine

class BookingEngineRequestError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

async function requestBookingEngine(method, path, { query, body, accessToken } = {}) {
  const url = new URL(bookingEngineURL + path);
  for (const [name, value] of Object.entries(query ?? {})) url.searchParams.set(name, value);
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  let response;
  try {
    response = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new BookingEngineRequestError("network");
  }
  const result = await response.json().catch(() => ({ code: "server_error" }));
  if (!response.ok) throw new BookingEngineRequestError(result.code || "server_error");
  return result;
}

function errorMessage(error) {
  const code = error instanceof BookingEngineRequestError ? error.code : "server_error";
  return localizedStrings[pageLanguage][code] ? localizedText(code) : localizedText("server_error");
}

/** The error's message and, when the request never reached the booking engine or it failed, a button to try again. */
function errorWithRetry(error, retry) {
  const canRetry = error instanceof BookingEngineRequestError && ["network", "server_error"].includes(error.code);
  return makeElement("div", { className: "error", role: "alert" },
    makeElement("p", {}, errorMessage(error)),
    canRetry && makeElement("button", { type: "button", onclick: retry }, localizedText("tryAgain")));
}

// MARK: - What this device remembers

/** A random id this browser keeps, which the hotel's limits and blocks count as "this device". */
function deviceIdentifier() {
  let identifier = localStorage.getItem("inn.device");
  if (!identifier || !/^[a-z0-9-]{16,64}$/.test(identifier)) {
    identifier = crypto.randomUUID
      ? crypto.randomUUID()
      : [...crypto.getRandomValues(new Uint8Array(16))].map((byte) => byte.toString(16).padStart(2, "0")).join("");
    localStorage.setItem("inn.device", identifier);
  }
  return identifier;
}

function bookingsSavedOnThisDevice() {
  try {
    const bookings = JSON.parse(localStorage.getItem("inn.bookings") || "[]");
    return Array.isArray(bookings) ? bookings : [];
  } catch {
    return [];
  }
}

function saveBookingOnThisDevice(savedBooking) {
  const bookings = bookingsSavedOnThisDevice().filter((booking) => booking.id !== savedBooking.id);
  bookings.unshift(savedBooking);
  localStorage.setItem("inn.bookings", JSON.stringify(bookings.slice(0, 20)));
}

// MARK: - Shared parts

function displayedHotelName(name, nameEn) {
  return pageLanguage === "en" && nameEn ? nameEn : name;
}

function pageHeader() {
  return makeElement("div", { className: "top" },
    makeElement("span", { className: "muted" }, localizedText("title")),
    makeElement("button", {
      className: "secondary",
      lang: pageLanguage === "th" ? "en" : "th",
      onclick: () => {
        pageLanguage = pageLanguage === "th" ? "en" : "th";
        localStorage.setItem("inn.language", pageLanguage);
        rememberTypedGuestDetails();
        showCurrentPageAgain();
      },
    }, localizedText("otherLanguage")));
}

function stickyActionBar(summary, button) {
  return makeElement("div", { className: "bar" },
    makeElement("div", {}, makeElement("div", { className: "summary" }, summary), button));
}

/** Shows the page on screen again, in the new language: the guest details form stays the form. */
function showCurrentPageAgain() {
  if (document.getElementById("guest-details") && bookingState.chosenRoomOffer) return showGuestDetailsForm();
  return showPageForCurrentLocation();
}

/** Keeps what the guest typed in the details form, if it's on screen. */
function rememberTypedGuestDetails() {
  const field = (id) => document.getElementById(id)?.value;
  if (!document.getElementById("guest-details")) return;
  Object.assign(bookingState.guest, {
    name: field("guest-name") ?? "", phone: field("guest-phone") ?? "",
    email: field("guest-email") ?? "", note: field("guest-note") ?? "",
  });
}

// MARK: - The booking page

const bookingState = {
  // Codes are lowercase; a link typed or shared in capitals still works.
  bookingPageCode: pageParameters.get("h")?.toLowerCase() ?? null,
  bookingPage: null,
  stay: {
    check_in: todayPlusDays(0), check_out: todayPlusDays(1), adults: 2, children: 0, infants: 0,
    // A hotel may share a link with its code: ?h=…&promo=SONGKRAN10.
    promo_code: (pageParameters.get("promo") ?? "").trim().slice(0, 30),
  },
  roomOffers: null,
  chosenRoomOffer: null,
  chosenPromotion: null,
  // Per date, from the booking engine's calendar: closed to arrival or departure, minimum stay, sold out.
  calendar: null,
  guest: { name: "", phone: "", email: "", note: "" },
};

async function showBookingPage() {
  if (!bookingState.bookingPageCode) {
    return replacePageContent(pageHeader(), makeElement("p", {}, localizedText("booking_page_not_found")));
  }
  if (!bookingState.bookingPage) {
    try {
      bookingState.bookingPage =
        (await requestBookingEngine("GET", `/booking-pages/${encodeURIComponent(bookingState.bookingPageCode)}`)).booking_page;
    } catch (error) {
      return replacePageContent(pageHeader(), errorWithRetry(error, () => showBookingPage()));
    }
  }
  const page = bookingState.bookingPage;
  const hotel = page.hotel;
  document.title = `${displayedHotelName(hotel.name, hotel.name_en)} · ${localizedText("title")}`;
  replacePageContent(
    pageHeader(),
    hotel.photos.length > 0 && makeElement("div", { className: "photos" },
      hotel.photos.map((photo, index) => makeElement("img", {
        src: photo.url, width: photo.width, height: photo.height, alt: "", loading: index > 1 ? "lazy" : "eager",
      }))),
    makeElement("h1", {}, displayedHotelName(hotel.name, hotel.name_en)),
    hotel.star_rating && makeElement("p", { className: "stars", "aria-label": `${hotel.star_rating}★` }, "★".repeat(hotel.star_rating)),
    makeElement("p", {}, makeElement("a", { href: hotel.map_url, target: "_blank", rel: "noopener" }, localizedText("openMap"))),
    savedBookingsCard(),
    page.takes_bookings ? staySearchForm() : makeElement("p", { className: "notice" }, localizedText("notTakingBookings")),
    makeElement("div", { id: "room-offers" }),
    hotelInfoSections(hotel),
    policiesSection(page),
  );
  if (bookingState.roomOffers) showRoomOffers();
}

function savedBookingsCard() {
  const bookings = bookingsSavedOnThisDevice().filter((booking) => booking.booking_page_code === bookingState.bookingPageCode);
  if (bookings.length === 0) return null;
  return makeElement("div", { className: "card" },
    makeElement("h3", {}, localizedText("yourBookings")),
    makeElement("ul", {}, bookings.map((booking) => makeElement("li", {},
      makeElement("a", { href: `#b=${booking.id}.${booking.access_token}` },
        `${formattedStayDates(booking.check_in, booking.check_out)} · ${booking.room_type_name ?? ""}`)))));
}

function numberPicker(id, selectedNumber, firstNumber, lastNumber) {
  const picker = makeElement("select", { id });
  for (let number = firstNumber; number <= lastNumber; number++) {
    picker.append(makeElement("option", { value: number, selected: number === selectedNumber }, number));
  }
  return picker;
}

function staySearchForm() {
  const stay = bookingState.stay;
  const checkIn = makeElement("input", {
    type: "date", id: "check-in", value: stay.check_in, min: todayPlusDays(0), required: true,
    "aria-describedby": "check-in-hint",
  });
  const checkOut = makeElement("input", {
    type: "date", id: "check-out", value: stay.check_out, min: dateByAddingDays(stay.check_in, 1), required: true,
    "aria-describedby": "check-out-hint",
  });
  const checkInHint = makeElement("p", { className: "muted small", id: "check-in-hint", "aria-live": "polite" });
  const checkOutHint = makeElement("p", { className: "muted small", id: "check-out-hint", "aria-live": "polite" });
  const showDateHints = () => {
    checkInHint.textContent = arrivalHint(checkIn.value);
    checkOutHint.textContent = departureHint(checkOut.value);
  };
  checkIn.addEventListener("change", () => {
    if (!checkIn.value) return;
    checkOut.min = dateByAddingDays(checkIn.value, 1);
    if (!checkOut.value || checkOut.value <= checkIn.value) checkOut.value = dateByAddingDays(checkIn.value, 1);
    showDateHints();
  });
  checkOut.addEventListener("change", showDateHints);
  loadCalendar().then(showDateHints);
  const adults = numberPicker("adults", stay.adults, 1, 10);
  const children = numberPicker("children", stay.children, 0, 10);
  const infants = numberPicker("infants", stay.infants ?? 0, 0, 4);
  const promoCode = makeElement("input", {
    id: "promo-code", value: stay.promo_code ?? "", maxlength: 30, autocomplete: "off", autocapitalize: "characters",
    spellcheck: "false", autocorrect: "off",
  });
  const searchButton = makeElement("button", { type: "submit", className: "block" }, localizedText("searchRoomOffers"));
  return makeElement("form", {
    className: "card",
    onsubmit: async (event) => {
      event.preventDefault();
      bookingState.stay = {
        check_in: checkIn.value, check_out: checkOut.value, adults: Number(adults.value), children: Number(children.value),
        infants: Number(infants.value), promo_code: promoCode.value.trim(),
      };
      await searchRoomOffers(searchButton);
    },
  },
  makeElement("div", { className: "row" },
    makeElement("div", { className: "field" }, makeElement("label", { for: "check-in" }, localizedText("checkIn")), checkIn,
      checkInHint),
    makeElement("div", { className: "field" }, makeElement("label", { for: "check-out" }, localizedText("checkOut")), checkOut,
      checkOutHint)),
  makeElement("div", { className: "row" },
    makeElement("div", { className: "field" }, makeElement("label", { for: "adults" }, localizedText("adults")), adults),
    makeElement("div", { className: "field" }, makeElement("label", { for: "children" }, localizedText("children")), children)),
  makeElement("div", { className: "row" },
    makeElement("div", { className: "field" }, makeElement("label", { for: "infants" }, localizedText("infants")), infants),
    makeElement("div", { className: "field" }, makeElement("label", { for: "promo-code" }, localizedText("promoCode")), promoCode)),
  searchButton);
}

/** The booking engine's calendar for the next 92 days, once; with an older booking engine, or when the request fails,
 * the page simply shows no hints. */
async function loadCalendar() {
  if (bookingState.calendar) return;
  try {
    const { calendar } = await requestBookingEngine(
      "GET", `/booking-pages/${encodeURIComponent(bookingState.bookingPageCode)}/calendar`,
      { query: { from: todayPlusDays(0), to: todayPlusDays(91) } });
    bookingState.calendar = new Map((calendar ?? []).map((day) => [day.stay_date, day]));
  } catch {
    bookingState.calendar = new Map();
  }
}

/** What the guest should know about arriving on a date: sold out, closed to arrival, or a minimum stay. */
function arrivalHint(date) {
  const day = bookingState.calendar?.get(date);
  if (!day) return "";
  if (day.is_sold_out) return localizedText("soldOutHint");
  if (day.closed_to_arrival) return localizedText("arrivalClosedHint");
  return day.minimum_nights > 1 ? localizedText("minimumStayHint", day.minimum_nights) : "";
}

function departureHint(date) {
  return bookingState.calendar?.get(date)?.closed_to_departure ? localizedText("departureClosedHint") : "";
}

async function searchRoomOffers(searchButton) {
  const offersSection = document.getElementById("room-offers");
  searchButton.disabled = true;
  searchButton.textContent = localizedText("searchingRoomOffers");
  try {
    const { promo_code: code, ...stay } = bookingState.stay;
    // A code is sent only when there is one, with this device's id: the booking engine limits how many codes a device
    // may try.
    const query = code ? { ...stay, promo_code: code, device_id: deviceIdentifier() } : stay;
    bookingState.roomOffers = await requestBookingEngine(
      "GET", `/booking-pages/${encodeURIComponent(bookingState.bookingPageCode)}/room-offers`, { query });
    showRoomOffers();
    offersSection.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    // The stay on screen is the new one; offers for the old one must not stay behind it.
    bookingState.roomOffers = null;
    bookingState.chosenRoomOffer = null;
    offersSection.replaceChildren(errorWithRetry(error, () => searchRoomOffers(searchButton)));
  } finally {
    searchButton.disabled = false;
    searchButton.textContent = localizedText("searchRoomOffers");
  }
}

function roomTypeSummary(roomType) {
  const isThai = pageLanguage === "th";
  const facts = [];
  for (const [kind, count] of Object.entries(roomType.beds || {})) {
    const bedName = localizedFeatureName("bed", kind);
    facts.push(isThai ? `${bedName} ${count} เตียง` : `${count} ${bedName}${count > 1 ? "s" : ""}`);
  }
  if (roomType.size_square_meters) facts.push(isThai ? `${roomType.size_square_meters} ตร.ม.` : `${roomType.size_square_meters} m²`);
  if (roomType.view) facts.push(localizedFeatureName("view", roomType.view));
  facts.push(isThai ? `พักได้ ${roomType.max_guests} คน` : `Sleeps ${roomType.max_guests}`);
  if (!roomType.has_private_bathroom) facts.push(isThai ? "ห้องน้ำรวม" : "Shared bathroom");
  if (roomType.is_accessible) facts.push(isThai ? "รองรับรถเข็น" : "Wheelchair accessible");
  facts.push(roomType.allows_smoking ? (isThai ? "สูบบุหรี่ได้" : "Smoking allowed") : (isThai ? "ห้องปลอดบุหรี่" : "Non-smoking"));
  return facts.join(" · ");
}

function unavailabilityMessage(unavailableRoomType) {
  switch (unavailableRoomType.reason) {
    case "sold_out": return localizedText("soldOut");
    case "too_many_guests": return localizedText("tooManyGuests");
    case "too_few_nights": return localizedText("tooFewNights", unavailableRoomType.minimum_nights);
    case "too_many_nights": return localizedText("tooManyNights", unavailableRoomType.maximum_nights);
    case "closed":
    case "closed_by_yield_rule": return localizedText("closedNights");
    case "closed_to_arrival": return localizedText("closedToArrival");
    case "closed_to_departure": return localizedText("closedToDeparture");
    case "outside_booking_window": return localizedText("outsideBookingWindow");
    default: return localizedText("notSold");
  }
}

function showRoomOffers() {
  const offersSection = document.getElementById("room-offers");
  if (!offersSection || !bookingState.roomOffers) return;
  const page = bookingState.bookingPage;
  const { room_offers: roomOffers, unavailable_room_types: unavailableRoomTypes, promotion } = bookingState.roomOffers;
  const stay = bookingState.stay;
  const heading = makeElement("h2", {},
    `${formattedStayDates(stay.check_in, stay.check_out)} · ${localizedText("nightCount", numberOfNightsBetween(stay.check_in, stay.check_out))}`);
  const roomTypeCards = page.room_types.map((roomType) => {
    const offersOfRoomType = roomOffers.filter((offer) => offer.room_type_id === roomType.id);
    const unavailable = unavailableRoomTypes.find((item) => item.room_type_id === roomType.id);
    if (offersOfRoomType.length === 0 && !unavailable) return null;
    return makeElement("div", { className: "card" },
      makeElement("h3", {}, roomType.name),
      makeElement("p", { className: "muted small" }, roomTypeSummary(roomType)),
      roomType.description && makeElement("p", { className: "small" }, roomType.description),
      roomType.amenities?.length > 0 && makeElement("ul", { className: "chips" },
        roomType.amenities.map((key) => makeElement("li", {}, localizedFeatureName("amenity", key)))),
      offersOfRoomType.length === 0
        ? makeElement("p", { className: "muted" }, unavailabilityMessage(unavailable))
        : offersOfRoomType.map((offer) => makeElement("div", { className: "offer" },
          makeElement("div", {},
            makeElement("div", {}, offer.rate_plan_name),
            makeElement("div", { className: "muted small" },
              offer.includes_breakfast ? localizedText("breakfastIncluded") : localizedText("roomOnly"),
              localizedText("roomsLeft", offer.rooms_left) && ` · ${localizedText("roomsLeft", offer.rooms_left)}`),
            showsOriginalPrice(offer, promotion)
              ? makeElement("div", {
                className: "price", role: "text",
                "aria-label": localizedText("wasNow", formattedMoney(offer.total_before_discount, page.currency_code),
                  formattedMoney(offer.total, page.currency_code)),
              },
              makeElement("s", { className: "muted", "aria-hidden": "true" },
                formattedMoney(offer.total_before_discount, page.currency_code)), " ",
              makeElement("span", { "aria-hidden": "true" }, formattedMoney(offer.total, page.currency_code)))
              : makeElement("div", { className: "price" }, formattedMoney(offer.total, page.currency_code)),
            makeElement("div", { className: "muted small" }, localizedText("taxesIncluded"))),
          makeElement("button", {
            type: "button",
            onclick: () => {
              bookingState.chosenRoomOffer = offer;
              bookingState.chosenPromotion = offer.promotion_applied ? promotion : null;
              showGuestDetailsForm();
            },
          }, localizedText("chooseRoomOffer")))));
  }).filter(Boolean);
  offersSection.replaceChildren(
    heading,
    roomOffers.length > 0 || !["not_for_this_stay"].includes(promotion?.status) ? promotionNotice(promotion) : "",
    roomOffers.length === 0 ? makeElement("p", { className: "notice" }, localizedText("noRoomOffers")) : "",
    ...roomTypeCards,
  );
}

/** What became of the code the guest typed; nothing when there was none (or the booking engine is older). */
function promotionNotice(promotion) {
  if (!promotion) return "";
  const messages = {
    applied: () => localizedText("promotionApplied", promotion.code, promotion.name),
    not_started: () => localizedText("promotionNotStarted"),
    ended: () => localizedText("promotionEnded"),
    used_up: () => localizedText("promotionUsedUp"),
    not_for_this_stay: () => localizedText("promotionNotForThisStay"),
  };
  const message = (messages[promotion.status] ?? (() => localizedText("promotionInvalid")))();
  return makeElement("p", { className: promotion.status === "applied" ? "notice" : "error", role: "status" }, message);
}

/** Whether to show the price without the code, crossed out: the hotel's choice for each code. */
function showsOriginalPrice(offer, promotion) {
  return Boolean(offer.promotion_applied && promotion?.shows_original_price && offer.total_before_discount > offer.total);
}

function hotelInfoSections(hotel) {
  const contactItems = [
    hotel.phone && makeElement("li", {}, makeElement("a", { href: `tel:${hotel.phone.replace(/[^\d+]/g, "")}` }, hotel.phone)),
    hotel.email && makeElement("li", {}, makeElement("a", { href: `mailto:${hotel.email}` }, hotel.email)),
    hotel.line_id && makeElement("li", {}, `LINE: ${hotel.line_id}`),
    /^https?:\/\//.test(hotel.website) && makeElement("li", {},
      makeElement("a", { href: hotel.website, target: "_blank", rel: "noopener" }, hotel.website.replace(/^https?:\/\//, ""))),
  ].filter(Boolean);
  return [
    hotel.description && [makeElement("h2", {}, localizedText("about")),
      makeElement("p", { style: "white-space: pre-line" }, hotel.description)],
    hotel.amenities.length > 0 && [makeElement("h2", {}, localizedText("amenities")),
      makeElement("ul", { className: "chips" }, hotel.amenities.map((key) => makeElement("li", {}, localizedFeatureName("amenity", key))))],
    hotel.directions && [makeElement("h2", {}, localizedText("directions")),
      makeElement("p", { style: "white-space: pre-line" }, hotel.directions)],
    contactItems.length > 0 && [makeElement("h2", {}, localizedText("contact")), makeElement("ul", {}, contactItems)],
  ];
}

/** The hotel's policies as sentences, in the order a guest needs them. */
function policySentences(page) {
  const policies = page.policies;
  const currencyCode = page.currency_code;
  const isThai = pageLanguage === "th";
  const sentences = [];
  if (policies.check_in_from) {
    sentences.push(isThai
      ? `เช็กอินตั้งแต่ ${policies.check_in_from} น. เช็กเอาต์ก่อน ${policies.check_out_until} น.`
      : `Check-in from ${policies.check_in_from}, check-out by ${policies.check_out_until}.`);
  }
  if (policies.cancellation === "non_refundable") {
    sentences.push(isThai ? "ยกเลิกแล้วไม่คืนเงิน" : "Non-refundable: no refund if you cancel.");
  } else if (policies.cancellation === "partial_refund") {
    sentences.push(isThai
      ? `ยกเลิกก่อนวันเข้าพัก ${policies.free_cancellation_days} วัน ได้เงินคืน ${policies.refund_percent}% หลังจากนั้นไม่คืนเงิน`
      : `Cancel ${policies.free_cancellation_days} days or more before arrival for a ${policies.refund_percent}% refund; no refund after that.`);
  } else {
    const days = policies.free_cancellation_days ?? 1;
    sentences.push(isThai
      ? `ยกเลิกฟรีก่อนวันเข้าพัก ${days} วัน หลังจากนั้นไม่คืนเงิน`
      : `Free cancellation until ${days} ${days === 1 ? "day" : "days"} before arrival; no refund after that.`);
  }
  if (policies.cancellation !== "non_refundable") {
    sentences.push(policies.no_show_charge === "first_night"
      ? (isThai ? "ถ้าไม่มาเข้าพักโดยไม่แจ้ง คิดค่าคืนแรก" : "If you don't arrive and haven't told the hotel, the first night is charged.")
      : (isThai ? "ถ้าไม่มาเข้าพักโดยไม่แจ้ง คิดค่าห้องเต็มจำนวน" : "If you don't arrive and haven't told the hotel, the whole stay is charged."));
  }
  const prepayment = policies.prepayment;
  if (prepayment.kind === "percentage") {
    sentences.push(isThai
      ? `จ่ายมัดจำ ${prepayment.percent}% ตอนจอง ที่เหลือจ่ายที่โรงแรม`
      : `Pay ${prepayment.percent}% when you book, the rest at the hotel.`);
  } else if (prepayment.kind === "full_amount") {
    sentences.push(isThai ? "จ่ายเต็มจำนวนตอนจอง" : "Pay the full amount when you book.");
  } else {
    sentences.push(isThai ? "ไม่ต้องจ่ายล่วงหน้า จ่ายที่โรงแรม" : "No payment needed now; pay at the hotel.");
  }
  if (policies.security_deposit) {
    const deposit = formattedMoney(policies.security_deposit, currencyCode);
    sentences.push(isThai
      ? `เงินประกันความเสียหาย ${deposit} จ่ายตอนเช็กอิน ได้คืนตอนเช็กเอาต์`
      : `Security deposit of ${deposit} at check-in, refunded at check-out.`);
  }
  sentences.push(isThai
    ? `ผู้เช็กอินต้องอายุ ${policies.minimum_check_in_age} ปีขึ้นไป${policies.requires_photo_id ? " และแสดงบัตรประชาชนหรือพาสปอร์ต" : ""}`
    : `The guest checking in must be ${policies.minimum_check_in_age} or older${policies.requires_photo_id ? " and show an ID card or passport" : ""}.`);
  const freeUnder = policies.children_stay_free_under_age;
  sentences.push(isThai
    ? `อายุ ${policies.adult_from_age} ปีขึ้นไปนับเป็นผู้ใหญ่${freeUnder ? ` เด็กอายุต่ำกว่า ${freeUnder} ปีพักฟรีกับเตียงที่มีอยู่` : ""}`
    : `Guests ${policies.adult_from_age} and older count as adults.${freeUnder ? ` Children under ${freeUnder} stay free in existing beds.` : ""}`);
  if (policies.pets === "not_allowed") sentences.push(isThai ? "ไม่อนุญาตสัตว์เลี้ยง" : "No pets.");
  if (policies.pets === "allowed") sentences.push(isThai ? "นำสัตว์เลี้ยงมาได้" : "Pets are welcome.");
  if (policies.pets === "allowed_with_fee") {
    const fee = formattedMoney(policies.pet_fee, currencyCode);
    sentences.push(isThai ? `นำสัตว์เลี้ยงมาได้ ค่าบริการ ${fee}` : `Pets are welcome for ${fee}.`);
  }
  if (policies.smoking === "not_allowed") sentences.push(isThai ? "ห้ามสูบบุหรี่" : "No smoking.");
  if (policies.smoking === "designated_areas") sentences.push(isThai ? "สูบบุหรี่ได้เฉพาะที่ที่จัดไว้" : "Smoking in designated areas only.");
  if (policies.quiet_hours_from) {
    sentences.push(isThai
      ? `ช่วงเวลางดเสียงดัง ${policies.quiet_hours_from}–${policies.quiet_hours_until} น.`
      : `Quiet hours ${policies.quiet_hours_from}–${policies.quiet_hours_until}.`);
  }
  if (policies.allows_parties === false) sentences.push(isThai ? "ห้ามจัดปาร์ตี้" : "No parties or events.");
  return sentences;
}

function policiesSection(page) {
  return [makeElement("h2", {}, localizedText("policies")),
    makeElement("ul", {}, policySentences(page).map((sentence) => makeElement("li", {}, sentence)))];
}

// MARK: - Booking a room

function priceBreakdownTable(offer, currencyCode) {
  const row = (label, amount, className) =>
    makeElement("tr", { className }, makeElement("td", {}, label), makeElement("td", {}, formattedMoney(amount, currencyCode)));
  const amountDueAtHotel = offer.total - offer.prepayment_amount;
  const promotion = bookingState.chosenPromotion;
  const showsDiscount = showsOriginalPrice(offer, promotion);
  return makeElement("table", { className: "lines" }, makeElement("tbody", {},
    showsDiscount && row(localizedText("priceBeforeCode"), offer.total_before_discount, "muted"),
    showsDiscount && row(localizedText("promotionLine", promotion.code),
      -Math.round((offer.total_before_discount - offer.total) * 100) / 100, "muted"),
    row(`${localizedText("roomAmount")} · ${localizedText("nightCount", offer.nights.length)}`, offer.room_amount),
    offer.charges.map((charge) => row(charge.name, charge.amount)),
    row(localizedText("total"), offer.total, "total"),
    offer.prepayment_amount > 0 && row(localizedText("payWhenBooking"), offer.prepayment_amount),
    amountDueAtHotel > 0 && row(localizedText("payAtHotel"), amountDueAtHotel, "muted")));
}

function labeledField(id, label, input) {
  return makeElement("div", { className: "field" }, makeElement("label", { for: id }, label), input);
}

function showGuestDetailsForm() {
  const page = bookingState.bookingPage;
  const offer = bookingState.chosenRoomOffer;
  const roomType = page.room_types.find((type) => type.id === offer.room_type_id);
  const stay = bookingState.stay;
  const guest = bookingState.guest;
  const nameField = makeElement("input", { id: "guest-name", autocomplete: "name", value: guest.name, required: true, maxlength: 120 });
  const phoneField = makeElement("input", { id: "guest-phone", type: "tel", autocomplete: "tel", value: guest.phone, required: true, maxlength: 40 });
  const emailField = makeElement("input", { id: "guest-email", type: "email", autocomplete: "email", value: guest.email, maxlength: 254 });
  const noteField = makeElement("textarea", { id: "guest-note", maxlength: 1000, placeholder: localizedText("guestNotePlaceholder") });
  noteField.value = guest.note;
  const errorParagraph = makeElement("p", { className: "error", role: "alert" });
  const confirmButton = makeElement("button", { type: "submit", form: "guest-details" }, localizedText("confirmBooking"));
  const rememberGuestDetails = () => Object.assign(bookingState.guest, {
    name: nameField.value, phone: phoneField.value, email: emailField.value, note: noteField.value,
  });

  const guestDetailsForm = makeElement("form", {
    id: "guest-details",
    onsubmit: async (event) => {
      event.preventDefault();
      rememberGuestDetails();
      errorParagraph.textContent = "";
      confirmButton.disabled = true;
      confirmButton.textContent = localizedText("confirmingBooking");
      try {
        const { booking, guest_access_token: accessToken } = await requestBookingEngine("POST", "/bookings", {
          body: {
            booking_page_code: bookingState.bookingPageCode,
            room_type_id: offer.room_type_id,
            rate_plan_id: offer.rate_plan_id,
            ...stay,
            // The code goes with the booking only on an offer it discounted; the booking engine checks it again.
            promo_code: offer.promotion_applied ? stay.promo_code : undefined,
            guest: bookingState.guest,
            device_id: deviceIdentifier(),
          },
        });
        saveBookingOnThisDevice({
          id: booking.id, access_token: accessToken, booking_page_code: bookingState.bookingPageCode,
          check_in: booking.check_in, check_out: booking.check_out, room_type_name: booking.room_type_name,
        });
        bookingState.roomOffers = null;
        location.hash = `b=${booking.id}.${accessToken}`;
      } catch (error) {
        errorParagraph.textContent = errorMessage(error);
        confirmButton.disabled = false;
        confirmButton.textContent = localizedText("confirmBooking");
      }
    },
  },
  makeElement("h2", {}, localizedText("guestDetails")),
  labeledField("guest-name", localizedText("guestName"), nameField),
  labeledField("guest-phone", localizedText("guestPhone"), phoneField),
  labeledField("guest-email", localizedText("guestEmail"), emailField),
  labeledField("guest-note", localizedText("guestNote"), noteField),
  errorParagraph);

  const amountDueNow = offer.prepayment_amount > 0 ? offer.prepayment_amount : offer.total;
  replacePageContent(
    pageHeader(),
    makeElement("button", {
      className: "secondary",
      onclick: () => {
        rememberGuestDetails();
        showBookingPage();
      },
    }, `‹ ${localizedText("back")}`),
    makeElement("h1", {}, displayedHotelName(page.hotel.name, page.hotel.name_en)),
    makeElement("div", { className: "card" },
      makeElement("h3", {}, localizedText("yourStay")),
      makeElement("p", {}, `${roomType?.name ?? ""} · ${offer.rate_plan_name}`),
      makeElement("p", { className: "muted small" },
        `${formattedStayDates(stay.check_in, stay.check_out)} · ${localizedText("guestCount", stay.adults, stay.children, stay.infants)} · `,
        offer.includes_breakfast ? localizedText("breakfastIncluded") : localizedText("roomOnly")),
      priceBreakdownTable(offer, page.currency_code)),
    // Nothing to pay now: the booking waits for the hotel, and the guest knows before confirming.
    page.approves_bookings && !(offer.prepayment_amount > 0) &&
      makeElement("p", { className: "notice" }, localizedText("hotelApprovesFirst")),
    guestDetailsForm,
    policiesSection(page),
    makeElement("p", { className: "muted small" }, localizedText("acceptPolicies")),
    stickyActionBar(
      [makeElement("strong", {}, formattedMoney(amountDueNow, page.currency_code)), makeElement("br"),
        offer.prepayment_amount > 0 ? localizedText("payWhenBooking") : localizedText("payAtHotel")],
      confirmButton),
  );
}

// MARK: - A guest's booking

let bookingRefreshTimer = null;
let paymentCountdownTimer = null;
/** A slip picture the guest chose but hasn't sent; while there is one, the page isn't redrawn under them. */
let unsentPaymentSlip = null;

function stopRefreshTimers() {
  clearTimeout(bookingRefreshTimer);
  clearInterval(paymentCountdownTimer);
  window.InnCheckout?.stopCheckoutPolling();
}

async function showGuestBooking(bookingID, accessToken) {
  stopRefreshTimers();
  // A redraw makes a new slip form, so a slip chosen in the old one is gone with it.
  unsentPaymentSlip = null;
  let booking;
  try {
    booking = (await requestBookingEngine("GET", `/bookings/${bookingID}`, { accessToken })).booking;
  } catch (error) {
    return replacePageContent(pageHeader(), errorWithRetry(error, () => showGuestBooking(bookingID, accessToken)));
  }
  // The guest may have moved on while this loaded.
  if (location.hash !== `#b=${bookingID}.${accessToken}`) return;
  if (booking.booking_page_code) bookingState.bookingPageCode = booking.booking_page_code;
  const hotelName = displayedHotelName(booking.hotel_name, booking.hotel_name_en);
  document.title = `${hotelName} · ${localizedText("title")}`;
  const currencyCode = booking.currency_code;
  const isPaid = ["confirmed", "checked_in", "checked_out"].includes(booking.state);
  // A cancelled booking owes nothing, so it shows no money, only what was booked.
  const isCancelled = ["cancelled", "payment_deadline_passed"].includes(booking.state);
  const moneyRow = (label, amount, className) => makeElement("tr", { className },
    makeElement("td", {}, label), makeElement("td", {}, formattedMoney(amount, currencyCode)));

  const stayCard = makeElement("div", { className: "card" },
    makeElement("h3", {}, hotelName),
    makeElement("p", {}, [booking.room_type_name, booking.rate_plan_name].filter(Boolean).join(" · ")),
    makeElement("p", { className: "muted small" },
      `${formattedStayDates(booking.check_in, booking.check_out)} · ` +
      `${localizedText("nightCount", numberOfNightsBetween(booking.check_in, booking.check_out))} · ` +
      localizedText("guestCount", booking.adults, booking.children, booking.infants)),
    booking.promotion_code && makeElement("p", { className: "muted small" }, localizedText("promotionUsed", booking.promotion_code)),
    !isCancelled && makeElement("table", { className: "lines" }, makeElement("tbody", {},
      moneyRow(localizedText("total"), booking.total, "total"),
      booking.prepayment_amount > 0 &&
        moneyRow(localizedText(isPaid ? "paid" : "payWhenBooking"), booking.prepayment_amount),
      booking.amount_due_at_hotel > 0 && moneyRow(localizedText("payAtHotel"), booking.amount_due_at_hotel, "muted"))),
    makeElement("p", { className: "muted small" }, `${localizedText("bookingNumber")}: ${booking.booking_number}`));

  const sentSlipCard = booking.payment_slip_url && makeElement("div", { className: "card" },
    makeElement("h3", {}, localizedText("sentPaymentSlip")),
    makeElement("img", { className: "slip-preview", src: booking.payment_slip_url, alt: localizedText("sentPaymentSlip") }));
  const bookAgainLink = booking.booking_page_code && makeElement("p", {},
    makeElement("a", { className: "button secondary", href: bookingPageLink(booking.booking_page_code) }, localizedText("bookAgain")));
  const stateHeading = (key, tone) => makeElement("p", { className: `state ${tone}` }, localizedText(key));
  const explanation = (key) => makeElement("p", {}, localizedText(key));

  switch (booking.state) {
    case "awaiting_payment":
      return replacePageContent(pageHeader(), stateHeading("awaitingPayment", "warn"),
        paymentCard(booking, bookingID, accessToken), stayCard,
        makeElement("p", { className: "muted small" }, localizedText("keepThisLink")),
        cancelBookingButton(bookingID, accessToken));
    case "awaiting_approval":
      bookingRefreshTimer = setTimeout(() => showGuestBooking(bookingID, accessToken), 20_000);
      return replacePageContent(pageHeader(), stateHeading("awaitingApproval", "warn"),
        explanation("awaitingApprovalExplanation"), stayCard, cancelBookingButton(bookingID, accessToken));
    case "payment_slip_sent":
      bookingRefreshTimer = setTimeout(() => showGuestBooking(bookingID, accessToken), 20_000);
      return replacePageContent(pageHeader(), stateHeading("paymentSlipSent", "warn"),
        explanation("paymentSlipSentExplanation"), stayCard, sentSlipCard);
    case "confirmed":
      return replacePageContent(pageHeader(), stateHeading("confirmed", "good"), explanation("confirmedExplanation"),
        stayCard, sentSlipCard, window.InnCheckout?.confirmedBookingActions(booking, bookingID, accessToken), bookAgainLink);
    case "checked_in":
    case "checked_out":
      return replacePageContent(pageHeader(),
        stateHeading(booking.state === "checked_in" ? "checkedIn" : "checkedOut", "good"), stayCard, bookAgainLink);
    case "payment_deadline_passed":
      return replacePageContent(pageHeader(), stateHeading("paymentDeadlinePassed", "bad"),
        explanation("paymentDeadlinePassedExplanation"), stayCard, bookAgainLink);
    default:
      return replacePageContent(pageHeader(), stateHeading("cancelled", "bad"), explanation("cancelledExplanation"),
        stayCard, bookAgainLink);
  }
}

function timeLeftUntil(deadline) {
  const seconds = Math.max(0, Math.floor((Date.parse(deadline) - Date.now()) / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

/** The QR code as a PNG picture, so the guest can press and hold to save it, then open it in a banking app. */
function savableQRCodeImage(svgText) {
  const image = makeElement("img", { className: "qr", alt: "PromptPay QR" });
  const vectorImage = new Image();
  vectorImage.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 720;
    const context = canvas.getContext("2d");
    context.fillStyle = "#fff";
    context.fillRect(0, 0, 720, 720);
    context.imageSmoothingEnabled = false;
    context.drawImage(vectorImage, 0, 0, 720, 720);
    image.src = canvas.toDataURL("image/png");
  };
  vectorImage.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`;
  return image;
}

function paymentCard(booking, bookingID, accessToken) {
  const countdown = makeElement("p", { className: "countdown muted" }, localizedText("timeLeft", timeLeftUntil(booking.payment_deadline)));
  paymentCountdownTimer = setInterval(() => {
    // Only the slip deadline matters while one is chosen; the redraw it causes would drop the slip.
    if (unsentPaymentSlip && Date.parse(booking.payment_deadline) <= Date.now()) return;
    countdown.textContent = localizedText("timeLeft", timeLeftUntil(booking.payment_deadline));
    if (Date.parse(booking.payment_deadline) <= Date.now()) showGuestBooking(bookingID, accessToken);
  }, 1000);

  const instructions = booking.payment_instructions;
  let howToPay = null;
  if (instructions?.method === "promptpay" && instructions.qr_code_svg) {
    howToPay = [makeElement("p", { className: "small" }, localizedText("scanToPay")),
      savableQRCodeImage(instructions.qr_code_svg),
      makeElement("p", { className: "muted small" }, localizedText("saveQRCode"))];
  } else if (instructions?.method === "bank_transfer") {
    const detailRow = (label, value) => value &&
      makeElement("tr", {}, makeElement("td", {}, label), makeElement("td", {}, value));
    howToPay = [makeElement("h3", {}, localizedText("transferTo")), makeElement("table", { className: "lines" }, makeElement("tbody", {},
      detailRow(localizedText("bankName"), instructions.bank_name),
      detailRow(localizedText("accountName"), instructions.account_name),
      detailRow(localizedText("accountNumber"), instructions.account_number),
      instructions.other_details &&
        makeElement("tr", {}, makeElement("td", { colspan: 2, className: "muted small" }, instructions.other_details))))];
  }

  return makeElement("div", { className: "card" },
    makeElement("p", { className: "amount" }, formattedMoney(booking.prepayment_amount, booking.currency_code)),
    countdown,
    // A hotel that takes deposits only through its card gateway has no transfer details and takes no slip.
    makeElement("p", { className: "small" }, localizedText(howToPay ? "holdExplanation" : "holdExplanationCard")),
    // Card, Apple Pay, Google Pay and PromptPay through the hotel's gateway, when it has one (checkout.js).
    window.InnCheckout?.gatewayPaymentSection(booking, bookingID, accessToken),
    howToPay,
    howToPay && paymentSlipForm(bookingID, accessToken));
}

function paymentSlipForm(bookingID, accessToken) {
  const fileInput = makeElement("input", { type: "file", accept: "image/*", id: "payment-slip", style: "display:none" });
  const slipPreview = makeElement("img", { className: "slip-preview", alt: "", hidden: true });
  const errorParagraph = makeElement("p", { className: "error", role: "alert" });
  const chooseButton = makeElement("button", { type: "button", className: "block", onclick: () => fileInput.click() },
    localizedText("attachPaymentSlip"));
  const sendButton = makeElement("button", { type: "button", className: "block", hidden: true }, localizedText("sendPaymentSlip"));
  let slipDataURL = null;

  fileInput.addEventListener("change", async () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    errorParagraph.textContent = "";
    try {
      slipDataURL = await resizedJPEGDataURL(file);
      unsentPaymentSlip = slipDataURL;
      slipPreview.src = slipDataURL;
      slipPreview.hidden = false;
      sendButton.hidden = false;
      chooseButton.className = "secondary block";
      chooseButton.textContent = localizedText("choosePaymentSlipAgain");
    } catch {
      errorParagraph.textContent = localizedText("invalid_payment_slip_image");
    }
  });

  sendButton.addEventListener("click", async () => {
    if (!slipDataURL) return;
    sendButton.disabled = chooseButton.disabled = true;
    sendButton.textContent = localizedText("sendingPaymentSlip");
    errorParagraph.textContent = "";
    try {
      await requestBookingEngine("POST", `/bookings/${bookingID}/payment-slips`, {
        accessToken, body: { image: slipDataURL.split(",")[1] },
      });
      unsentPaymentSlip = null;
      showGuestBooking(bookingID, accessToken);
    } catch (error) {
      errorParagraph.textContent = errorMessage(error);
      sendButton.disabled = chooseButton.disabled = false;
      sendButton.textContent = localizedText("sendPaymentSlip");
    }
  });

  return makeElement("div", {}, fileInput, slipPreview, errorParagraph, sendButton, chooseButton);
}

/** The picture as a JPEG data URL no wider or taller than 1,600 pixels, so it uploads quickly on a phone. */
function resizedJPEGDataURL(file) {
  return new Promise((resolve, reject) => {
    const objectURL = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(image.naturalWidth * scale);
      canvas.height = Math.round(image.naturalHeight * scale);
      canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectURL);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectURL);
      reject(new Error("unreadable_image"));
    };
    image.src = objectURL;
  });
}

function cancelBookingButton(bookingID, accessToken) {
  return makeElement("button", {
    type: "button",
    className: "danger",
    onclick: async (event) => {
      if (!confirm(localizedText("confirmCancellingBooking"))) return;
      event.target.disabled = true;
      try {
        await requestBookingEngine("POST", `/bookings/${bookingID}/cancel`, { accessToken });
      } catch (error) {
        alert(errorMessage(error));
      }
      showGuestBooking(bookingID, accessToken);
    },
  }, localizedText("cancelBooking"));
}

// MARK: - Which page to show

function showPageForCurrentLocation() {
  stopRefreshTimers();
  document.documentElement.lang = pageLanguage;
  // Back from a card payment, or a payment link the hotel sent (checkout.js).
  if (window.InnCheckout?.showsCheckoutPageForLocation()) return;
  const bookingLink = location.hash.match(/^#b=([0-9a-f-]{36})\.([0-9a-f]{48})$/);
  if (bookingLink) return showGuestBooking(bookingLink[1], bookingLink[2]);
  return showBookingPage();
}

window.addEventListener("hashchange", () => {
  unsentPaymentSlip = null;
  showPageForCurrentLocation();
});
// Back from the banking app, the booking may have moved on; a slip chosen but not sent is kept instead.
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && location.hash.startsWith("#b=") && !unsentPaymentSlip) {
    showPageForCurrentLocation();
  }
});
showPageForCurrentLocation();
