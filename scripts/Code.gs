function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["เวลา", "ชื่อ", "ลอยกับ", "กระทง", "คำอธิษฐาน"]);
  }
  const data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    new Date(),
    data.name || "",
    data.partner || "",
    data.krathong || "",
    data.wish || ""
  ]);
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(
    ContentService.MimeType.JSON
  );
}

function doGet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const values = sheet.getDataRange().getValues();
  const rows = [];
  for (let i = 1; i < values.length; i++) {
    const time = values[i][0];
    rows.push({
      time: time instanceof Date ? time.toISOString() : String(time || ""),
      name: String(values[i][1] || ""),
      partner: String(values[i][2] || ""),
      krathong: String(values[i][3] || ""),
      wish: String(values[i][4] || "")
    });
  }
  return ContentService.createTextOutput(
    JSON.stringify({ ok: true, rows: rows.reverse() })
  ).setMimeType(ContentService.MimeType.JSON);
}
