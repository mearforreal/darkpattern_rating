# Dark Pattern Rating Tool

A web application for human raters to annotate UI screenshots for dark pattern research.

## Setup

```bash
npm install
```

## Adding images

Drop screenshots into `public/images/`. Supported formats: `.png`, `.jpg`, `.jpeg`, `.webp`, `.gif`.

Files are ordered alphabetically, so prefix filenames with numbers for a specific order:
```
public/images/
  001_amazon_checkout.png
  002_booking_urgency.png
  003_linkedin_settings.png
  ...
```

Then run the seed script to register them in the database:

```bash
npm run seed
```

Re-running seed is safe — it upserts images by filename and updates their order.

## Running

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database

SQLite database is stored at `dev.db` in the project root.

To apply schema changes after editing `prisma/schema.prisma`:

```bash
npm run db:migrate
```

To browse the database visually:

```bash
npm run db:studio
```

## Exporting results

Go to [http://localhost:3000/admin](http://localhost:3000/admin) to:
- See all raters and their progress
- Download **CSV** (one row per rating)
- Download **JSON** (full structured export)

Or fetch directly:
```
GET /api/export/csv
GET /api/export/json
```

## CSV format

```
rater_name, rater_email, image_filename, is_dark_pattern, confidence, comment, created_at, updated_at
```

- `is_dark_pattern`: `yes` | `no` | `unsure`
- `confidence`: 1 (not confident) – 5 (very confident)

## Keyboard shortcuts (rating page)

| Key | Action |
|-----|--------|
| `Y` | Mark as dark pattern |
| `N` | Mark as not a dark pattern |
| `U` | Mark as unsure |
| `1–5` | Set confidence level |
| `Enter` | Next image |
| `←` | Previous image |

## Multi-rater setup

Each rater identifies themselves by name + email on the landing page. The same email resumes an existing session. Multiple raters can rate the same images independently — ratings are keyed by `(rater, image)`.

For inter-rater agreement analysis (Cohen's Kappa, Gwet's AC1), export the data and analyze with your preferred statistics tool.
