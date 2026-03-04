const tokenList = document.querySelector("#tokenList");
const tokenTemplate = document.querySelector("#tokenTemplate");
const regexOutput = document.querySelector("#regexOutput");
const testInput = document.querySelector("#testInput");
const testResult = document.querySelector("#testResult");
const copyRegexButton = document.querySelector("#copyRegex");
const clearAllButton = document.querySelector("#clearAll");
const flagInputs = Array.from(document.querySelectorAll(".flag"));
const blockButtons = Array.from(document.querySelectorAll(".block"));
const customForm = document.querySelector("#customForm");
const customType = document.querySelector("#customType");
const customValue = document.querySelector("#customValue");
const customName = document.querySelector("#customName");
const customNameLabel = document.querySelector("#customNameLabel");

const definitions = {
  digit: {
    label: "Digit",
    pattern: "\\d",
    quantifiable: true,
    needsGrouping: false,
  },
  word: {
    label: "Word character",
    pattern: "\\w",
    quantifiable: true,
    needsGrouping: false,
  },
  whitespace: {
    label: "Whitespace",
    pattern: "\\s",
    quantifiable: true,
    needsGrouping: false,
  },
  any: {
    label: "Any character",
    pattern: ".",
    quantifiable: true,
    needsGrouping: false,
  },
  start: {
    label: "Start",
    pattern: "^",
    quantifiable: false,
    needsGrouping: false,
  },
  end: {
    label: "End",
    pattern: "$",
    quantifiable: false,
    needsGrouping: false,
  },
  alternation: {
    label: "Alternation",
    pattern: "|",
    quantifiable: false,
    needsGrouping: false,
  },
};

let nextId = 1;
let tokens = [];

function escapeLiteral(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sanitizeCharClass(value) {
  return value.replace(/([\\\]])/g, "\\$1");
}

function needsGroupingForLiteral(value) {
  return value.length > 1;
}

function createToken({ label, pattern, quantifiable, needsGrouping, meta }) {
  return {
    id: nextId++,
    label,
    pattern,
    quantifier: "",
    quantifiable,
    needsGrouping,
    meta,
  };
}

function addTokenFromDefinition(key) {
  if (key === "literal") {
    const value = window.prompt("Enter a literal you want to match:");
    if (!value) {
      return;
    }

    const escaped = escapeLiteral(value);
    tokens.push(
      createToken({
        label: `Literal: ${value}`,
        pattern: escaped,
        quantifiable: true,
        needsGrouping: needsGroupingForLiteral(escaped),
        meta: { type: "literal", value },
      }),
    );
    updatePreview();
    return;
  }

  if (key === "group") {
    const value = window.prompt(
      "Enter the group content (raw regex, e.g. [a-z]+):",
      "[a-z]+",
    );
    if (!value) {
      return;
    }

    tokens.push(
      createToken({
        label: "Group",
        pattern: `(?:${value})`,
        quantifiable: true,
        needsGrouping: false,
        meta: { type: "group", value },
      }),
    );
    updatePreview();
    return;
  }

  const definition = definitions[key];
  if (!definition) {
    return;
  }

  tokens.push(
    createToken({
      label: definition.label,
      pattern: definition.pattern,
      quantifiable: definition.quantifiable,
      needsGrouping: definition.needsGrouping,
      meta: { type: key },
    }),
  );
  updatePreview();
}

function applyQuantifier(token) {
  if (!token.quantifier) {
    return token.pattern;
  }

  const base = token.needsGrouping ? `(?:${token.pattern})` : token.pattern;
  return `${base}${token.quantifier}`;
}

function buildPattern() {
  return tokens.map(applyQuantifier).join("");
}

function getFlags() {
  return flagInputs
    .filter((input) => input.checked)
    .map((input) => input.value)
    .join("");
}

function buildRegexString(pattern, flags) {
  if (!pattern) {
    return "/ /";
  }
  return `/${pattern}/${flags}`;
}

function describeMatch(match) {
  const snippet = match.length > 40 ? `${match.slice(0, 37)}…` : match;
  return `"${snippet}"`;
}

function runTester(pattern, flags) {
  const text = testInput.value;
  testResult.className = "test-result";

  if (!pattern) {
    testResult.textContent = "Add blocks to build a regex.";
    return;
  }

  let regex;
  try {
    regex = new RegExp(pattern, flags);
  } catch (error) {
    testResult.classList.add("error");
    testResult.textContent = `Regex error: ${error.message}`;
    return;
  }

  if (!text) {
    testResult.textContent = "Enter text in the tester to see matches.";
    return;
  }

  const matches = flags.includes("g")
    ? Array.from(text.matchAll(regex), (m) => m[0])
    : (() => {
        const single = regex.exec(text);
        return single ? [single[0]] : [];
      })();

  if (matches.length === 0) {
    testResult.classList.add("fail");
    testResult.textContent = "No matches found.";
    return;
  }

  const preview = matches.slice(0, 4).map(describeMatch).join(", ");
  const suffix = matches.length > 4 ? " …" : "";
  testResult.classList.add("success");
  testResult.textContent = `Matches: ${matches.length}. ${preview}${suffix}`;
}

function renderTokens() {
  tokenList.innerHTML = "";

  tokens.forEach((token, index) => {
    const fragment = tokenTemplate.content.cloneNode(true);
    const item = fragment.querySelector(".token-item");
    const label = fragment.querySelector(".token-label");
    const pattern = fragment.querySelector(".token-pattern");
    const quantifier = fragment.querySelector(".token-quantifier");
    const up = fragment.querySelector(".token-up");
    const down = fragment.querySelector(".token-down");
    const remove = fragment.querySelector(".token-remove");

    label.textContent = token.label;
    pattern.textContent = applyQuantifier(token);
    quantifier.value = token.quantifier;
    quantifier.disabled = !token.quantifiable;

    up.disabled = index === 0;
    down.disabled = index === tokens.length - 1;

    quantifier.addEventListener("change", (event) => {
      token.quantifier = event.target.value;
      updatePreview();
    });

    up.addEventListener("click", () => {
      if (index === 0) {
        return;
      }
      [tokens[index - 1], tokens[index]] = [tokens[index], tokens[index - 1]];
      updatePreview();
    });

    down.addEventListener("click", () => {
      if (index === tokens.length - 1) {
        return;
      }
      [tokens[index + 1], tokens[index]] = [tokens[index], tokens[index + 1]];
      updatePreview();
    });

    remove.addEventListener("click", () => {
      tokens = tokens.filter((entry) => entry.id !== token.id);
      updatePreview();
    });

    tokenList.appendChild(item);
  });
}

function updatePreview() {
  renderTokens();
  const pattern = buildPattern();
  const flags = getFlags();
  regexOutput.textContent = buildRegexString(pattern, flags);
  runTester(pattern, flags);
}

function addCustomToken(event) {
  event.preventDefault();
  const type = customType.value;
  const value = customValue.value.trim();

  if (!value) {
    customValue.focus();
    return;
  }

  if (type === "literal") {
    const escaped = escapeLiteral(value);
    tokens.push(
      createToken({
        label: `Literal: ${value}`,
        pattern: escaped,
        quantifiable: true,
        needsGrouping: needsGroupingForLiteral(escaped),
        meta: { type, value },
      }),
    );
  }

  if (type === "charClass") {
    const sanitized = sanitizeCharClass(value);
    tokens.push(
      createToken({
        label: `Character class: [${value}]`,
        pattern: `[${sanitized}]`,
        quantifiable: true,
        needsGrouping: false,
        meta: { type, value },
      }),
    );
  }

  if (type === "namedGroup") {
    const name = customName.value.trim();
    if (!name) {
      customName.focus();
      return;
    }

    tokens.push(
      createToken({
        label: `Named group: ${name}`,
        pattern: `(?<${name}>${value})`,
        quantifiable: true,
        needsGrouping: false,
        meta: { type, value, name },
      }),
    );
  }

  customForm.reset();
  customType.value = type;
  toggleCustomName();
  updatePreview();
}

function toggleCustomName() {
  const showName = customType.value === "namedGroup";
  customNameLabel.classList.toggle("hidden", !showName);
  customName.required = showName;
}

async function copyRegex() {
  const pattern = buildPattern();
  const flags = getFlags();
  const regexString = buildRegexString(pattern, flags);

  if (!pattern) {
    regexOutput.animate(
      [
        { transform: "scale(1)", filter: "brightness(1)" },
        { transform: "scale(1.01)", filter: "brightness(1.2)" },
        { transform: "scale(1)", filter: "brightness(1)" },
      ],
      { duration: 400, easing: "ease" },
    );
    return;
  }

  await navigator.clipboard.writeText(regexString).catch(() => null);
  copyRegexButton.textContent = "Copied!";
  copyRegexButton.disabled = true;

  window.setTimeout(() => {
    copyRegexButton.textContent = "Copy regex";
    copyRegexButton.disabled = false;
  }, 1200);
}

function clearAll() {
  tokens = [];
  updatePreview();
}

blockButtons.forEach((button) => {
  button.addEventListener("click", () => addTokenFromDefinition(button.dataset.token));
});

flagInputs.forEach((input) => input.addEventListener("change", updatePreview));
customType.addEventListener("change", toggleCustomName);
customForm.addEventListener("submit", addCustomToken);
copyRegexButton.addEventListener("click", copyRegex);
clearAllButton.addEventListener("click", clearAll);
testInput.addEventListener("input", updatePreview);

toggleCustomName();
updatePreview();
