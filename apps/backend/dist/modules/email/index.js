"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailStatus = exports.EmailType = exports.securityAlertSchema = exports.accountStatusSchema = exports.welcomeSchema = exports.passwordResetSchema = exports.validatorOtpSchema = exports.validateEmail = exports.emailConstants = exports.emailTemplates = exports.EmailService = void 0;
var email_service_1 = require("./email.service");
Object.defineProperty(exports, "EmailService", { enumerable: true, get: function () { return email_service_1.EmailService; } });
var email_templates_1 = require("./email.templates");
Object.defineProperty(exports, "emailTemplates", { enumerable: true, get: function () { return email_templates_1.emailTemplates; } });
Object.defineProperty(exports, "emailConstants", { enumerable: true, get: function () { return email_templates_1.emailConstants; } });
var email_utils_1 = require("./email.utils");
Object.defineProperty(exports, "validateEmail", { enumerable: true, get: function () { return email_utils_1.validateEmail; } });
Object.defineProperty(exports, "validatorOtpSchema", { enumerable: true, get: function () { return email_utils_1.validatorOtpSchema; } });
Object.defineProperty(exports, "passwordResetSchema", { enumerable: true, get: function () { return email_utils_1.passwordResetSchema; } });
Object.defineProperty(exports, "welcomeSchema", { enumerable: true, get: function () { return email_utils_1.welcomeSchema; } });
Object.defineProperty(exports, "accountStatusSchema", { enumerable: true, get: function () { return email_utils_1.accountStatusSchema; } });
Object.defineProperty(exports, "securityAlertSchema", { enumerable: true, get: function () { return email_utils_1.securityAlertSchema; } });
var email_types_1 = require("./email.types");
Object.defineProperty(exports, "EmailType", { enumerable: true, get: function () { return email_types_1.EmailType; } });
Object.defineProperty(exports, "EmailStatus", { enumerable: true, get: function () { return email_types_1.EmailStatus; } });
//# sourceMappingURL=index.js.map