# Premium Digital Wedding Invitation

Mobile-first invitation website with a burgundy, ivory, and champagne-gold theme.

## Project files
- `index.html` — page sections, invitation forms
- `style.css` — responsive styling
- `config.js` — **all editable wedding information** and Google Apps Script URL
- `script.js` — countdown, calendar, maps, RSVP, wishes, optional music
- `google-apps-script/Code.gs` — Sheets backend
- `assets/` — add your own optimized photos and optional music

## Edit wedding data
Open `config.js` and replace all `XXX` values.
Set `dateISO` to a date with timezone offset, such as `2027-03-20T10:00:00+07:00`.
This assumes wedding dates are in Asia/Jakarta (WIB).

## Connect Google Sheets
1. Create a new spreadsheet under your Google account.
2. Choose **Extensions → Apps Script**.
3. Paste `google-apps-script/Code.gs` into `Code.gs`, then run `setup()` and approve permissions.
4. **Deploy → New deployment → Web app**. Select **Execute as: Me** and **Who has access: Anyone**. Only do this after reviewing the privacy/spam implications below.
5. Copy the `/exec` URL into `scriptURL` in `config.js`.
6. Deploy a new Apps Script version whenever you edit backend code.
7. Submit a test RSVP on the published site and confirm a row appears in sheet `RSVP`; test public wishes after submission.

Columns: Timestamp | Submission ID | Full Name | Attendance | Number of Guests | Wishes & Messages.

## GitHub Pages deployment
1. Open GitHub repository **Settings → Pages**.
2. Under **Build and deployment**, select **Deploy from a branch**.
3. Choose **main** and **/(root)**, then Save.
4. The site should publish to `https://ardi08193.github.io/wedding-invitation/` once GitHub Pages has successfully deployed.
5. Check the Pages deployment status in GitHub before sharing.

## Add media
Upload `assets/cover.webp`, `assets/groom.webp`, `assets/bride.webp`, and optionally `assets/music.mp3`. See `assets/README.md`. Background music only plays after the user taps the music button.

## Share with a named guest
Append `?to=Guest%20Name` to the website URL to personalize the invitation cover. This is cosmetic; it does not identify or authenticate the guest.

## Security, privacy, and maintenance
- **Public repository**: do not upload secrets, private files, API keys, guest lists, or private Google Sheets URLs.
- Apps Script Web App is public. It is subject to spam and abuse; the supplied version has lightweight input validation and a honeypot but no robust rate limit or CAPTCHA. Review access/security before wide distribution.
- Guests' names and wishes are displayed publicly; disclose this and obtain appropriate consent. Attendance and guest counts are not published in the wishes section.
- This implementation uses Apps Script JSONP for cross-origin public GET, and an opaque POST with subsequent ID verification. It is designed for a small personal invitation, not a high-volume or sensitive-data service.
- Save routine backups of the Sheet with **File → Download → Microsoft Excel (.xlsx)** or CSV.
- Edit `config.js` for wedding details. Replace files in `assets/` for media. Update CSS for styles.
- Always test mobile view, location links, calendar, RSVP writes and wishes after each substantial change.
