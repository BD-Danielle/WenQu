// Import core components
import { EventManager } from "./event.manager.js";
import { wqInput } from "./class.input.js";
import { wqPopup } from "./class.popup.js";
import { wqDateTime } from "./class.datetime.js";
import { wqSex } from "./class.sex.js";
import { wqRadio } from "./class.radio.js";
import { wqForm } from "./class.form.js";

// Create the module object
const WenQu = {
  EventManager,
  wqInput,
  wqPopup,
  wqDateTime,
  wqSex,
  wqRadio,
  wqForm
};

// Export the module
export default WenQu;

// For backwards compatibility and browser global usage
if (typeof globalThis !== 'undefined') {
  globalThis.WenQu = WenQu;
}
