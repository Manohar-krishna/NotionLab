/**
 * Google Drive Index Endpoint for Notion Search Widget.
 *
 * Configure the Drive folder in ANY of these 3 ways:
 * 1. Paste your folder ID into DEFAULT_FOLDER_ID below.
 * 2. Or run setupScriptProperty() from the Apps Script editor menu.
 * 3. Or go to Project Settings (gear icon) > Script Properties > Add:
 *    Property: DRIVE_FOLDER_ID | Value: <YOUR_FOLDER_ID>
 */

// OPTION 1: Paste your Google Drive Folder ID here (from drive.google.com/drive/folders/<FOLDER_ID>)
var DEFAULT_FOLDER_ID = "";

/**
 * OPTION 2: Run this function once from the Apps Script editor toolbar
 * after putting your folder ID inside the quotes.
 */
function setupScriptProperty() {
  var folderId = "PASTE_YOUR_FOLDER_ID_HERE";
  if (!folderId || folderId === "PASTE_YOUR_FOLDER_ID_HERE") {
    Logger.log("Please replace PASTE_YOUR_FOLDER_ID_HERE with your actual folder ID first.");
    return;
  }
  PropertiesService.getScriptProperties().setProperty("DRIVE_FOLDER_ID", folderId);
  Logger.log("Successfully set DRIVE_FOLDER_ID script property to: " + folderId);
}

function doGet(e) {
  try {
    // Check query parameter (?folderId=...), Script Properties, or DEFAULT_FOLDER_ID
    var folderId = (e && e.parameter && e.parameter.folderId)
      || PropertiesService.getScriptProperties().getProperty("DRIVE_FOLDER_ID")
      || DEFAULT_FOLDER_ID;

    if (!folderId) {
      return jsonResponse_({
        error: "Missing DRIVE_FOLDER_ID",
        message: "No Google Drive folder ID configured. Set DEFAULT_FOLDER_ID in Code.gs, run setupScriptProperty(), or set DRIVE_FOLDER_ID in Script Properties.",
        items: []
      });
    }

    var folder = DriveApp.getFolderById(folderId);
    var files = folder.getFiles();
    var items = [];

    while (files.hasNext()) {
      var file = files.next();
      var name = file.getName();
      var ext = (name.match(/\.([^.]+)$/) || [])[1] || "";
      var mime = file.getMimeType();

      items.push({
        id: file.getId(),
        title: name,
        path: name,
        category: categoryFor_(ext.toLowerCase()),
        summary: file.getDescription() || (mime + " · " + Math.max(1, Math.round(file.getSize() / 1024)) + " KB"),
        tags: ext ? [ext.toUpperCase()] : ["FILE"],
        status: Utilities.formatDate(file.getLastUpdated(), "UTC", "yyyy-MM-dd"),
        mimeType: mime,
        url: file.getUrl()
      });
    }

    var payload = {
      version: 1,
      generatedAt: new Date().toISOString(),
      source: folder.getName(),
      items: items
    };

    return jsonResponse_(payload);

  } catch (err) {
    return jsonResponse_({
      error: err.name || "Error",
      message: err.message || String(err),
      items: []
    });
  }
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function categoryFor_(ext) {
  if (["js", "ts", "py", "html", "css", "json"].indexOf(ext) >= 0) return "Development & Code";
  if (["md", "txt", "doc", "docx"].indexOf(ext) >= 0) return "Documentation";
  if (["pdf"].indexOf(ext) >= 0) return "Research & Specs";
  if (["png", "jpg", "jpeg", "svg"].indexOf(ext) >= 0) return "Architecture & Design";
  return "General";
}
