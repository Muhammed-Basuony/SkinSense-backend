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
exports.getDoctorById = exports.listDoctors = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const util_dynamodb_1 = require("@aws-sdk/util-dynamodb");
const client = new client_dynamodb_1.DynamoDBClient({ region: "eu-north-1" });
const DOCTOR_TABLE = "Doctors";
const listDoctors = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const result = yield client.send(new client_dynamodb_1.ScanCommand({ TableName: DOCTOR_TABLE }));
        const doctors = ((_a = result.Items) === null || _a === void 0 ? void 0 : _a.map((item) => {
            const { id, name, rating, phoneNumber, location, photoUrl } = (0, util_dynamodb_1.unmarshall)(item);
            return { id, name, rating, phoneNumber, location, photoUrl };
        })) || [];
        res.json(doctors);
    }
    catch (err) {
        console.error("Error listing doctors:", err);
        res.status(500).json({ error: "Could not fetch doctors" });
    }
});
exports.listDoctors = listDoctors;
const getDoctorById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, name } = req.params;
    if (!id || !name) {
        res.status(400).json({ error: "Missing id or name in request" });
        return;
    }
    try {
        const result = yield client.send(new client_dynamodb_1.GetItemCommand({
            TableName: DOCTOR_TABLE,
            Key: {
                id: { S: id },
                name: { S: name }
            }
        }));
        if (!result.Item) {
            res.status(404).json({ error: "Doctor not found" });
            return;
        }
        const doctor = (0, util_dynamodb_1.unmarshall)(result.Item);
        res.json(doctor);
    }
    catch (err) {
        console.error("Error getting doctor:", err);
        res.status(500).json({ error: "Could not fetch doctor profile" });
    }
});
exports.getDoctorById = getDoctorById;
