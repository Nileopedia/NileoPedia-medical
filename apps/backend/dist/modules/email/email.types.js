"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailStatus = exports.EmailType = void 0;
var EmailType;
(function (EmailType) {
    EmailType["VALIDATOR_OTP"] = "VALIDATOR_OTP";
    EmailType["PASSWORD_RESET"] = "PASSWORD_RESET";
    EmailType["WELCOME"] = "WELCOME";
    EmailType["ACCOUNT_ACTIVATED"] = "ACCOUNT_ACTIVATED";
    EmailType["ACCOUNT_DEACTIVATED"] = "ACCOUNT_DEACTIVATED";
    EmailType["SYSTEM_ANNOUNCEMENT"] = "SYSTEM_ANNOUNCEMENT";
    EmailType["SECURITY_ALERT"] = "SECURITY_ALERT";
})(EmailType || (exports.EmailType = EmailType = {}));
var EmailStatus;
(function (EmailStatus) {
    EmailStatus["PENDING"] = "PENDING";
    EmailStatus["SENT"] = "SENT";
    EmailStatus["FAILED"] = "FAILED";
})(EmailStatus || (exports.EmailStatus = EmailStatus = {}));
//# sourceMappingURL=email.types.js.map