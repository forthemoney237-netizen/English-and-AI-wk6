# Word Vector Lab

A small Vercel app that performs word-vector arithmetic with the same model
used in the reference notebook:

```python
import gensim.downloader as gd
glove = gd.load("glove-wiki-gigaword-50")
```

Enter additions and subtractions as comma-separated words. For example,
`king, woman` in **Add words** and `man` in **Remove words** asks for the words
closest to `king + woman - man`.

## Project layout

- `public/` — a dependency-free browser interface served by Vercel.
- `api/index.py` — Flask API deployed as a Python Vercel Function at `/api`.
- `requirements.txt` — Python packages used by the function.

## Run locally

Use Python 3.12, create an environment, install the requirements, then start
the Flask app:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
flask --app api.index:app run
```

Open the static page through the Vercel development server, or serve `public/`
from another local static server and send requests to the Flask endpoint.

## Deploy to Vercel

1. Create a new GitHub repository and upload this project (not its parent
   folder).
2. In Vercel, choose **New Project**, import that repository, and click
   **Deploy**. No environment variables are needed.
3. Open the generated site. Its first calculation on a fresh server may be
   slow because Gensim downloads the GloVe model to Vercel's temporary storage.

Vercel automatically exposes `api/index.py` as `/api` and serves `public/` as
static content. The function configuration permits a 60-second invocation so
the first model download has a chance to finish.

## Production note

This is a good demonstration app, but not ideal for high-traffic production:
Vercel's temporary storage and warm function memory can disappear at any time,
forcing a new download. For a durable production service, put the model in
object storage or bake a compatible model artifact into a separate inference
service, then load it from there.
