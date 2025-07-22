/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

admin.initializeApp();

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

exports.getLogs = onRequest(async (request, response) => {
  const areaId = request.body.areaId;
  if (areaId && Boolean(areaId)) {
    try {
      const logsRef = admin.firestore().collection("audits").doc(areaId).get();
      const snapshot = await logsRef.get();
      if (snapshot.empty) {
        response.status(404).send("No logs found for the specified area.");
        return;
      }
      response.status(200).json([...snapshot.data()]);

      const logs = [];
      snapshot.forEach((doc) => {
        logs.push(doc.data());
      });

      response.status(200).json(logs);
    } catch (error) {
      logger.error("Error fetching logs:", error);
      response.status(500).send("Error fetching logs");
    }
  } else {
    try {
      const logsRef = admin.firestore().collection("audits").get();
      const snapshot = await logsRef;
      if (snapshot.empty) {
        response.status(404).send("No logs found.");
        return;
      }
      const logs = [];
      snapshot.forEach((doc) => {
        logs.push(doc.data());
      });
      response.status(200).json(logs);
    } catch (error) {
      logger.error("Error fetching logs:", error);
      response.status(500).send("Error fetching logs");
    }
  }
  logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
});
