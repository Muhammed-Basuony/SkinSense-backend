"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const validate = (schema) => (req, res, next) => {
    var _a, _b;
    try {
        schema.parse(req.body);
        next();
    }
    catch (err) {
        return res.status(400).json({
            error: ((_b = (_a = err.errors) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) || "Invalid request",
        });
    }
};
exports.validate = validate;
