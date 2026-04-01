// Google Apps Script Code for Google Sheets Backend
// Follow these steps to set up:

/*
STEP 1: Create Google Apps Script
1. Go to https://script.google.com
2. Click "New Project"
3. Delete the default code and paste the code below
4. Save the project (Ctrl+S)

STEP 2: Deploy as Web App
1. Click "Deploy" → "New deployment"
2. Click "Select type" → "Web app"
3. Description: "Wedding Guestbook Backend"
4. Execute as: "Me"
5. Who has access: "Anyone"
6. Click "Deploy"
7. Copy the Web App URL
8. Paste it in script.js replacing 'YOUR_SCRIPT_ID'

STEP 3: Authorize
1. Click "Authorize access"
2. Select your Google account
3. Click "Advanced" → "Go to [Your Project]"
4. Click "Allow"
*/

// CODE TO PASTE IN GOOGLE APPS SCRIPT:
/*
function doPost(e) {
  try {
    // Open the spreadsheet by URL
    var sheet = SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/1ZzYdfgcFePICqaHSVW7ChpeuYavGTcf439ho2YtmdxQ/edit');
    var sheet1 = sheet.getSheets()[0];
    
    // Get data from form parameters
    var name = e.parameter.name || 'Khách mờii';
    var message = e.parameter.message || '';
    var date = e.parameter.date || new Date().toLocaleDateString('vi-VN');
    
    // Append data to sheet
    sheet1.appendRow([
      new Date(),           // Timestamp (Column A)
      name,                 // Sender Name (Column B)
      message,              // Message (Column C)
      date                  // Formatted Date (Column D)
    ]);
    
    // Return success response with CORS headers
    return ContentService.createTextOutput(JSON.stringify({
      'result': 'success',
      'message': 'Wish saved successfully'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      'result': 'error',
      'message': error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    // Check if this is a fetch request
    if (e.parameter.action === 'get') {
      // Open the spreadsheet by URL
      var sheet = SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/1ZzYdfgcFePICqaHSVW7ChpeuYavGTcf439ho2YtmdxQ/edit');
      var sheet1 = sheet.getSheets()[0];
      
      // Get all data from sheet
      var data = sheet1.getDataRange().getValues();
      var wishes = [];
      
      // Read all rows including first row (index 0)
      for (var i = 1; i < data.length; i++) {
        var row = data[i];
        if (row[1] && row[2]) { // Check if name and message exist
          wishes.push({
            timestamp: row[0] ? row[0].toString() : '',
            name: row[1],
            message: row[2],
            date: row[3] ? row[3] : ''
          });
        }
      }
      
      // Create JSONP response for CORS workaround
      var callback = e.parameter.callback;
      var output = JSON.stringify({
        'result': 'success',
        'wishes': wishes
      });
      
      if (callback) {
        // JSONP response
        output = callback + '(' + output + ')';
        return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JAVASCRIPT);
      } else {
        // Regular JSON with CORS headers
        return ContentService.createTextOutput(output)
          .setMimeType(ContentService.MimeType.JSON)
          .setHeader('Access-Control-Allow-Origin', '*')
          .setHeader('Access-Control-Allow-Methods', 'GET, POST')
          .setHeader('Access-Control-Allow-Headers', 'Content-Type');
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      'result': 'error',
      'message': 'Invalid action'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      'result': 'error',
      'message': error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
*/

// After deployment, your URL will look like:
// https://script.google.com/macros/s/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/exec
// Replace YOUR_SCRIPT_ID in script.js with the XXXX part
