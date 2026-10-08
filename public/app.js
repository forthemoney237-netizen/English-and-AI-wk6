const form = document.querySelector("#similarity-form");
const positiveInput = document.querySelector("#positive");
const negativeInput = document.querySelector("#negative");
const expression = document.querySelector("#expression");
const submitButton = document.querySelector("#submit");
const status = document.querySelector("#status");
const message = document.querySelector("#message");
const results = document.querySelector("#results");

function splitWords(value) {
  return value
    .split(",")
    .map((word) => word.trim())
    .filter(Boolean);
}

function updateExpression() {
  const positive = splitWords(positiveInput.value);
  const negative = splitWords(negativeInput.value);
  const chunks = [
    ...positive.map((word, index) => (index === 0 ? word : `+ ${word}`)),
    ...negative.map((word) => `− ${word}`),
  ];
  expression.textContent = chunks.length ? chunks.join(" ") : "Add a word to begin";
}

function showError(text) {
  message.textContent = text;
  results.replaceChildren();
  status.textContent = "Needs attention";
  status.dataset.state = "error";
}

function showResults(items) {
  const rows = items.map(({ word, similarity }) => {
    const item = document.createElement("li");
    const label = document.createElement("span");
    const score = document.createElement("span");
    label.textContent = word;
    score.textContent = similarity.toFixed(4);
    item.append(label, score);
    return item;
  });

  results.replaceChildren(...rows);
  message.textContent = `${items.length} closest matches, ranked by cosine similarity.`;
  status.textContent = "Complete";
  status.dataset.state = "success";
}

async function calculate(event) {
  event.preventDefault();
  const positive = splitWords(positiveInput.value);
  const negative = splitWords(negativeInput.value);

  if (!positive.length && !negative.length) {
    showError("Add at least one word first.");
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Finding matches…";
  status.textContent = "Loading model";
  status.dataset.state = "loading";
  message.textContent = "The first request on a new server can take a moment.";
  results.replaceChildren();

  try {
    const response = await fetch("/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ positive, negative, topN: 5 }),
    });
    const data = await response.json();

    if (!response.ok) {
      const unknown = data.unknown?.length ? ` Not found: ${data.unknown.join(", ")}.` : "";
      throw new Error(`${data.error || "The calculation failed."}${unknown}`);
    }
    showResults(data.results);
  } catch (error) {
    showError(error.message || "Unable to reach the API. Please try again.");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Find similar words";
  }
}

[positiveInput, negativeInput].forEach((input) => input.addEventListener("input", updateExpression));
form.addEventListener("submit", calculate);
updateExpression();

