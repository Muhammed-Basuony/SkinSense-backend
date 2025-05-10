import { Request, Response } from "express";
import {
  DynamoDBClient,
  PutItemCommand,
  ScanCommand,
  GetItemCommand
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const client = new DynamoDBClient({ region: "eu-north-1" });
const DOCTOR_TABLE = "Doctors";


export const listDoctors = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await client.send(new ScanCommand({ TableName: DOCTOR_TABLE }));
    const doctors = result.Items?.map((item) => {
      const { id, name, rating, phoneNumber, location, photoUrl } = unmarshall(item);
      return { id, name, rating, phoneNumber, location, photoUrl };
    }) || [];
    res.json(doctors);
  } catch (err) {
    console.error("Error listing doctors:", err);
    res.status(500).json({ error: "Could not fetch doctors" });
  }
};


export const getDoctorById = async (req: Request, res: Response): Promise<void> => {
  const { id, name } = req.params;

  if (!id || !name) {
    res.status(400).json({ error: "Missing id or name in request" });
    return;
  }

  try {
    const result = await client.send(new GetItemCommand({
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

    const doctor = unmarshall(result.Item);
    res.json(doctor);
  } catch (err) {
    console.error("Error getting doctor:", err);
    res.status(500).json({ error: "Could not fetch doctor profile" });
  }
};
