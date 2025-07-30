// Import core components
import { wqInput } from "./class.input.js";
import { wqPopup } from "./class.popup.js";
import { wqDateTime } from "./class.datetime.js";
import { wqSex } from "./class.sex.js";
import { wqForm } from "./class.form.js";

// Create the module object
const WenQu = {
  wqInput,
  wqPopup,
  wqDateTime,
  wqSex,
  wqForm
};

// Export the module
export default WenQu;

// For backwards compatibility and browser global usage
if (typeof globalThis !== 'undefined') {
  globalThis.WenQu = WenQu;
}
