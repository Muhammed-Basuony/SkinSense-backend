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
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadSkinScan = exports.uploadProfilePic = void 0;
const uploadProfilePic = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const email = (_a = req.user) === null || _a === void 0 ? void 0 : _a.email;
        const file = req.file;
        if (!email || !file) {
            res.status(400).json({ error: "Missing email or file" });
            return;
        }
        const photoUrl = file.location;
        res.status(200).json({ message: "Profile picture uploaded", photoUrl });
    }
    catch (err) {
        res.status(500).json({ error: err.message || "Failed to upload profile picture" });
    }
});
exports.uploadProfilePic = uploadProfilePic;
const uploadSkinScan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const email = (_b = req.user) === null || _b === void 0 ? void 0 : _b.email;
        const files = req.files;
        if (!email || !files || files.length === 0) {
            res.status(400).json({ error: "Missing email or files" });
            return;
        }
        const scanUrls = files.map(f => f.location);
        res.status(200).json({ message: "Scans uploaded", scanUrls });
    }
    catch (err) {
        res.status(500).json({ error: err.message || "Failed to upload scans" });
    }
});
exports.uploadSkinScan = uploadSkinScan;
