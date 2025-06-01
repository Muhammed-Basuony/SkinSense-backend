"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfilePhoto = exports.updateProfile = exports.getProfile = void 0;
const userUtils_1 = require("../utils/userUtils");
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const email = (_a = req.user) === null || _a === void 0 ? void 0 : _a.email;
        if (!email) {
            res.status(400).json({ error: "Missing user context" });
            return;
        }
        const user = yield (0, userUtils_1.getUserByEmail)(email);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        const { password: _ } = user, profileWithoutPassword = __rest(user, ["password"]);
        res.status(200).json({ profile: profileWithoutPassword });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch profile" });
    }
});
exports.getProfile = getProfile;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const email = (_b = req.user) === null || _b === void 0 ? void 0 : _b.email;
        const updates = req.body;
        if (!email) {
            res.status(400).json({ error: "Missing user context" });
            return;
        }
        const updated = yield (0, userUtils_1.updateUserProfile)(email, updates);
        res.status(200).json({ message: "Profile updated", profile: updated });
    }
    catch (err) {
        res.status(500).json({ error: err.message || "Failed to update profile" });
    }
});
exports.updateProfile = updateProfile;
const updateProfilePhoto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        const email = (_c = req.user) === null || _c === void 0 ? void 0 : _c.email;
        const file = req.file;
        if (!email || !file) {
            res.status(400).json({ error: "Missing email or photo" });
            return;
        }
        const photoUrl = file.location;
        const updated = yield (0, userUtils_1.updateUserProfile)(email, { photoUrl });
        res.status(200).json({
            message: "Photo updated",
            photoUrl,
            profile: updated,
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message || "Upload failed" });
    }
});
exports.updateProfilePhoto = updateProfilePhoto;
