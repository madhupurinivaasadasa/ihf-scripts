/**
 * Koti Japa Yagna — Dashboard Apps Script
 * ----------------------------------------
 * Reads the Jotform-connected submissions sheet and computes:
 *   - total names offered (toward 1 Koti)
 *   - total rounds, chanters joined, cities chanting (+ today's deltas)
 *   - a "just offered" ticker line
 *   - leaderboards: today / overall / by city
 *
 * COUNTING LOGIC (matches what we designed for the site):
 *   - Each person's daily rounds DEFAULT to their committed vow, starting
 *     the day they joined, through today.
 *   - If they submitted a "Log today's rounds" entry for a given day, that
 *     ACTUAL number overrides the assumed commitment for that day —
 *     whether it's less, equal to, or more than their vow.
 *   - Mobile Number is the join key between a person's "Join" row and all
 *     their "Log" rows. Mobile numbers and email are NEVER included in the
 *     JSON/CSV this script outputs — only name, city, and round counts.
 *
 * SETUP:
 *   1. Extensions > Apps Script on the submissions spreadsheet.
 *   2. Paste this whole file in as Code.gs (replace the default content).
 *   3. Update SPREADSHEET_ID and SHEET_NAME below if needed (defaults to
 *      the active/bound spreadsheet + its first sheet).
 *   4. Deploy > New deployment > type: Web app.
 *        - Execute as: Me
 *        - Who has access: Anyone
 *   5. Copy the Web app URL it gives you (ends in /exec) and paste it into
 *      DASHBOARD_API_URL near the top of the <script> block in
 *      koti-japa-yagna.html.
 *   6. Whenever you edit this script, you must create a NEW deployment
 *      version (or "Manage deployments" > edit > New version) for changes
 *      to take effect on the existing /exec URL.
 */

// ---------- CONFIG ----------
var SPREADSHEET_ID = ''; // leave blank to use the spreadsheet this script is bound to
var SHEET_NAME = '';     // leave blank to use the first sheet in the spreadsheet
var NAMES_PER_ROUND = 1728; // 108 beads x 16 words
var KOTI = 10000000;        // 1 Koti = 1,00,00,000 names
var LEADERBOARD_SIZE = 15;

// Column header names as they appear in row 1 of the sheet (from Jotform).
// Update these if you rename/re-add fields in Jotform.
var COL = {
  submissionDate: 'Submission Date',
  mobile: 'Mobile Number',
  action: 'What would you like to do?',
  firstName: 'Full Name - First Name',
  lastName: 'Full Name - Last Name',
  email: 'Email',
  city: 'City',
  commitment: 'Rounds per day you vow to chant',
  experience: 'Have you chanted japa before?',
  consent: 'I consent to receive WhatsApp/email updates from Sri Krishna Balaram Mandir about the Koti Japa Yagna.',
  logDate: 'Date',
  logRounds: 'Rounds chanted today',
  submissionId: 'Submission ID'
};

var JOIN_ACTION_PREFIX = 'Join the Yagna';
var LOG_ACTION_PREFIX = 'Log today';

// ---------- ENTRY POINT ----------
function doGet(e) {
  var format = (e && e.parameter && e.parameter.format) || 'json';
  var data = buildDashboard_();

  if (format === 'csv') {
    var csv = dashboardToCsv_(data);
    return ContentService.createTextOutput(csv).setMimeType(ContentService.MimeType.CSV);
  }

  var json = JSON.stringify(data);
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

// ---------- CORE LOGIC ----------
function buildDashboard_() {
  var rows = readRows_();
  var todayStr = formatDate_(new Date());

  var registrants = {};   // mobile -> {name, city, commitment, joinDateStr, joinSubmissionDateStr}
  var logsByMobileDate = {}; // "mobile|date" -> roundsActual (last write wins)
  var latestEvent = null; // most recent submission, for the ticker

  rows.forEach(function (row) {
    var mobile = normalizeMobile_(row[COL.mobile]);
    if (!mobile) return;

    var action = String(row[COL.action] || '');
    var submissionDateRaw = row[COL.submissionDate];
    var submissionDateStr = formatDate_(submissionDateRaw);

    if (action.indexOf(JOIN_ACTION_PREFIX) === 0) {
      var name = joinName_(row[COL.firstName], row[COL.lastName]);
      var city = String(row[COL.city] || '').trim();
      var commitment = toNumber_(row[COL.commitment]);

      var existing = registrants[mobile];
      registrants[mobile] = {
        name: name || (existing && existing.name) || 'A devotee',
        city: city || (existing && existing.city) || '',
        commitment: commitment || (existing && existing.commitment) || 0,
        // Keep the EARLIEST join date if they somehow submitted "Join" more than once
        joinDateStr: (existing && existing.joinDateStr && existing.joinDateStr < submissionDateStr)
          ? existing.joinDateStr : submissionDateStr
      };

      trackLatest_(latestEvent, {
        kind: 'join', dateStr: submissionDateStr, name: name, city: city, commitment: commitment
      }, function (updated) { latestEvent = updated; });

    } else if (action.indexOf(LOG_ACTION_PREFIX) === 0) {
      var logDateStr = formatDate_(row[COL.logDate]) || submissionDateStr;
      var roundsActual = toNumber_(row[COL.logRounds]);
      logsByMobileDate[mobile + '|' + logDateStr] = roundsActual;

      trackLatest_(latestEvent, {
        kind: 'log', dateStr: submissionDateStr, mobile: mobile, rounds: roundsActual
      }, function (updated) { latestEvent = updated; });
    }
  });

  // Resolve the ticker's name/city for a "log" event via the registrants map
  var latest = null;
  if (latestEvent) {
    if (latestEvent.kind === 'log') {
      var who = registrants[latestEvent.mobile];
      latest = {
        name: (who && who.name) || 'A devotee',
        city: (who && who.city) || '',
        rounds: latestEvent.rounds
      };
    } else {
      latest = {
        name: latestEvent.name || 'A devotee',
        city: latestEvent.city || '',
        rounds: latestEvent.commitment,
        justJoined: true
      };
    }
  }

  // Walk each registrant from their join date through today, applying
  // logged overrides where they exist, assumed commitment otherwise.
  var totalRounds = 0;
  var roundsToday = 0;
  var chantersToday = 0;
  var citiesSet = {};
  var leaderboardToday = [];
  var leaderboardOverall = [];
  var cityTotals = {};

  Object.keys(registrants).forEach(function (mobile) {
    var r = registrants[mobile];
    if (r.city) citiesSet[r.city.toLowerCase()] = true;
    if (r.joinDateStr === todayStr) chantersToday++;

    var personTotal = 0;
    var cursor = parseDate_(r.joinDateStr);
    var end = parseDate_(todayStr);
    while (cursor <= end) {
      var dStr = formatDate_(cursor);
      var key = mobile + '|' + dStr;
      var roundsForDay = logsByMobileDate.hasOwnProperty(key) ? logsByMobileDate[key] : r.commitment;
      if (roundsForDay < 0) roundsForDay = 0;
      personTotal += roundsForDay;
      if (dStr === todayStr) roundsToday += roundsForDay;
      cursor = addDays_(cursor, 1);
    }
    totalRounds += personTotal;

    leaderboardOverall.push({ name: r.name, city: r.city, rounds: personTotal });

    var todayKey = mobile + '|' + todayStr;
    var todayRounds = logsByMobileDate.hasOwnProperty(todayKey) ? logsByMobileDate[todayKey] : r.commitment;
    leaderboardToday.push({ name: r.name, city: r.city, rounds: todayRounds });

    if (r.city) {
      var cKey = r.city;
      cityTotals[cKey] = (cityTotals[cKey] || 0) + personTotal;
    }
  });

  leaderboardOverall.sort(function (a, b) { return b.rounds - a.rounds; });
  leaderboardToday.sort(function (a, b) { return b.rounds - a.rounds; });
  var cityLeaderboard = Object.keys(cityTotals).map(function (c) {
    return { city: c, rounds: cityTotals[c] };
  }).sort(function (a, b) { return b.rounds - a.rounds; });

  return {
    generatedAt: new Date().toISOString(),
    namesOffered: totalRounds * NAMES_PER_ROUND,
    namesTarget: KOTI,
    percentIntoKoti: Math.min((totalRounds * NAMES_PER_ROUND / KOTI) * 100, 100),
    totalRounds: totalRounds,
    roundsToday: roundsToday,
    chanters: Object.keys(registrants).length,
    chantersToday: chantersToday,
    cities: Object.keys(citiesSet).length,
    latest: latest,
    leaderboard: {
      today: leaderboardToday.slice(0, LEADERBOARD_SIZE),
      overall: leaderboardOverall.slice(0, LEADERBOARD_SIZE),
      cities: cityLeaderboard.slice(0, LEADERBOARD_SIZE)
    }
  };
}

function trackLatest_(current, candidate, setter) {
  if (!current || candidate.dateStr >= current.dateStr) setter(candidate);
  else setter(current);
}

// ---------- SHEET READING ----------
function readRows_() {
  var ss = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  var sheet = SHEET_NAME ? ss.getSheetByName(SHEET_NAME) : ss.getSheets()[0];
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  var headers = values[0];
  var rows = [];
  for (var i = 1; i < values.length; i++) {
    var rowObj = {};
    for (var j = 0; j < headers.length; j++) {
      rowObj[headers[j]] = values[i][j];
    }
    rows.push(rowObj);
  }
  return rows;
}

// ---------- HELPERS ----------
function normalizeMobile_(val) {
  if (!val) return '';
  return String(val).replace(/\D/g, '');
}

function joinName_(first, last) {
  var f = String(first || '').trim();
  var l = String(last || '').trim();
  return (f + ' ' + l).trim();
}

function toNumber_(val) {
  var n = parseFloat(val);
  return isNaN(n) ? 0 : n;
}

function formatDate_(val) {
  if (!val) return '';
  var d;
  if (Object.prototype.toString.call(val) === '[object Date]') {
    d = val;
  } else {
    d = new Date(val);
    if (isNaN(d.getTime())) return '';
  }
  var y = d.getFullYear();
  var m = String(d.getMonth() + 1).padStart(2, '0');
  var day = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}

function parseDate_(dateStr) {
  var parts = dateStr.split('-');
  return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
}

function addDays_(date, days) {
  var d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function dashboardToCsv_(data) {
  var lines = [];
  lines.push('Metric,Value');
  lines.push('Names Offered,' + data.namesOffered);
  lines.push('Names Target (1 Koti),' + data.namesTarget);
  lines.push('Percent Into Koti,' + data.percentIntoKoti.toFixed(2));
  lines.push('Total Rounds,' + data.totalRounds);
  lines.push('Rounds Today,' + data.roundsToday);
  lines.push('Chanters Joined,' + data.chanters);
  lines.push('Chanters Joined Today,' + data.chantersToday);
  lines.push('Cities Chanting,' + data.cities);
  lines.push('');
  lines.push('Leaderboard (Overall),Name,City,Rounds');
  data.leaderboard.overall.forEach(function (row, i) {
    lines.push((i + 1) + ',' + csvEscape_(row.name) + ',' + csvEscape_(row.city) + ',' + row.rounds);
  });
  lines.push('');
  lines.push('Leaderboard (Today),Name,City,Rounds');
  data.leaderboard.today.forEach(function (row, i) {
    lines.push((i + 1) + ',' + csvEscape_(row.name) + ',' + csvEscape_(row.city) + ',' + row.rounds);
  });
  lines.push('');
  lines.push('Leaderboard (Cities),City,Rounds');
  data.leaderboard.cities.forEach(function (row, i) {
    lines.push((i + 1) + ',' + csvEscape_(row.city) + ',' + row.rounds);
  });
  return lines.join('\n');
}

function csvEscape_(val) {
  var s = String(val == null ? '' : val);
  if (s.indexOf(',') > -1 || s.indexOf('"') > -1) {
    s = '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}
