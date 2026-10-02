export interface ParsedRecipe {
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
}

const BULLET_RE = /^[•\-*○☐◦‣·]+\s*|^\d+[.)]\s*/;

function cleanLine(line: string): string {
  return line.replace(BULLET_RE, '').trim();
}

const HEADER_RE = /^(ingredients?|steps?|recipe|method|instructions|directions):?$/i;

function isIngredientsHeader(line: string): boolean {
  return /^ingredients?:?$/i.test(line.trim());
}

function isStepsHeader(line: string): boolean {
  return /^(steps?|recipe|method|instructions|directions):?$/i.test(line.trim());
}

const MEASURE_WORDS = [
  'cup', 'cups', 'tsp', 'tbsp', 'tspn', 'tbspn', 'tablespoon', 'teaspoon', 'oz', 'lb', 'lbs', 'kg', 'g',
  'gram', 'grams', 'ml', 'pinch', 'clove', 'cloves', 'can', 'cans', 'bunch', 'slice', 'slices', 'piece',
  'pieces', 'packet', 'carton', 'stick', 'sticks',
];

const COOKING_VERBS = [
  'add', 'heat', 'cook', 'mix', 'stir', 'cover', 'bring', 'let', 'wash', 'cut', 'chop', 'marinate', 'fry',
  'saute', 'sauté', 'bake', 'boil', 'simmer', 'pour', 'whisk', 'blend', 'mash', 'drain', 'remove', 'set',
  'turn', 'serve', 'garnish', 'sprinkle', 'place', 'arrange', 'combine', 'preheat', 'roast', 'grill',
  'keep', 'make', 'wait', 'take', 'squeeze', 'dish', 'done', 'enjoy', 'repeat', 'once', 'now',
];

function startsWithCookingVerb(line: string): boolean {
  const firstWord = line.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '');
  return COOKING_VERBS.includes(firstWord ?? '');
}

function looksLikeIngredient(line: string): boolean {
  const words = line.split(/\s+/).filter(Boolean);
  if (words.length === 0 || words.length > 12) return false;
  if (/^\d/.test(line) || /^[½¼¾⅓⅔]/.test(line)) return true;
  const lower = line.toLowerCase();
  if (MEASURE_WORDS.some((w) => lower.includes(w))) return true;
  return words.length <= 6 && !startsWithCookingVerb(line);
}

function looksLikeStep(line: string): boolean {
  return startsWithCookingVerb(line) || line.split(/\s+/).filter(Boolean).length > 12;
}

function looksLikeProse(line: string): boolean {
  return line.length > 25 && line.split(/\s+/).filter(Boolean).length > 6;
}

export function parseRecipeText(rawText: string, fallbackTitle = ''): ParsedRecipe {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { title: fallbackTitle, description: '', ingredients: [], steps: [] };
  }

  const title = cleanLine(lines[0]) || fallbackTitle || 'Untitled Recipe';
  let rest = lines.slice(1);

  let description = '';
  if (rest.length > 0 && looksLikeProse(rest[0]) && !HEADER_RE.test(rest[0].trim())) {
    description = cleanLine(rest[0]);
    rest = rest.slice(1);
  }

  const ingredientsHeaderIdx = rest.findIndex(isIngredientsHeader);
  const stepsHeaderIdx = rest.findIndex(isStepsHeader);

  let ingredients: string[] = [];
  let steps: string[] = [];

  if (ingredientsHeaderIdx !== -1) {
    const afterIngredients = rest.slice(ingredientsHeaderIdx + 1);
    const relativeStepsIdx = stepsHeaderIdx !== -1 && stepsHeaderIdx > ingredientsHeaderIdx
      ? stepsHeaderIdx - ingredientsHeaderIdx - 1
      : -1;
    const ingredientLines = relativeStepsIdx !== -1 ? afterIngredients.slice(0, relativeStepsIdx) : afterIngredients;
    const stepLines = relativeStepsIdx !== -1 ? rest.slice(stepsHeaderIdx + 1) : [];
    ingredients = ingredientLines.map(cleanLine).filter(Boolean);
    steps = stepLines.map(cleanLine).filter(Boolean);
  } else if (stepsHeaderIdx !== -1) {
    ingredients = rest.slice(0, stepsHeaderIdx).map(cleanLine).filter(Boolean);
    steps = rest.slice(stepsHeaderIdx + 1).map(cleanLine).filter(Boolean);
  } else {
    let splitIndex = 0;
    while (splitIndex < rest.length && looksLikeIngredient(rest[splitIndex]) && !looksLikeStep(rest[splitIndex])) {
      splitIndex++;
    }
    ingredients = rest.slice(0, splitIndex).map(cleanLine).filter(Boolean);
    steps = rest.slice(splitIndex).map(cleanLine).filter(Boolean);
  }

  if (!description) {
    description = `${title}: imported from your recipe notes.`;
  }

  return { title, description, ingredients, steps };
}
