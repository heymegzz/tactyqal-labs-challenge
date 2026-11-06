# Journal API

Public reads need no credentials. Successful reads return JSON. Errors use `{"error":{"code":"...","message":"..."}}`. Public responses are uncached for immediate editorial updates.

| Method and path | Result |
| --- | --- |
| GET /api/posts | `{posts,page,limit,total}`. Defaults to page 1, limit 6. Limit maximum 50. Supports q (title/excerpt), category and tag. |
| GET /api/posts/:slug | Published post or 404. Draft status cannot be overridden through query parameters. |
| POST /api/session | JSON object with key. Returns 200 and a session cookie or 401. |
| GET /api/session · DELETE /api/session | Session status / clear cookie. |
| GET /api/admin/posts | Same pagination and filters, includes drafts. Editor session required. |
| GET /api/admin/posts/:id | Individual editorial record. |
| POST /api/admin/posts | Create one post; returns 201 and the record. |
| PUT /api/admin/posts/:id | Full replacement of editable fields. Send current numeric version in If-Match. |
| DELETE /api/admin/posts/:id | Delete with If-Match; returns 204. |

```sh
curl 'http://127.0.0.1:8787/api/posts?category=Research&page=1&limit=3'
```

For local API experimentation, the editor UI or `tests/api.mjs` demonstrates login and cookie handling without printing secrets. Example request after authentication:

```http
POST /api/admin/posts
Content-Type: application/json
Cookie: tl_editor=<session from sign-in>

{"title":"Test one decision","slug":"test-one-decision","excerpt":"A short prototype exercise.","content":"Draw a first screen and a result screen.","cover":"/art/shape.svg","category":"Design","tags":["prototype"],"status":"draft"}
```

To publish, PUT the same fields with status published and If-Match: 1 (or the version the last response returned). Refresh the saved record after a conflict. Created and updated timestamps are generated on the server. Publishing sets the publication timestamp; returning to draft clears it.

Typical errors: 400 malformed JSON; 401 missing credentials; 403 disallowed origin; 404 missing/private article; 405 unsupported method; 409 duplicate slug/stale version; 413 oversized body; 415 wrong content type; 422 invalid data or pagination; 428 missing version; 503 database or configuration unavailable.
