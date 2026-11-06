# JavaScript Numeric Separators: Readability Without Precision

**Date:** 2026-11-06

**Category:** JavaScript

**Tags:** `numeric-separators` `es2021` `ieee-754` `floating-point` `money` `json`

**Status:** ✅ Verified (Node.js v22.23.1, V8 12.4.254.21) · 📖 Documented (TC39, MDN, RFC 8259, Stripe)

---

## 1. Introduction

JavaScript lets you put underscores inside numeric literals:

```js
const amount = 2_000;
```

It evaluates to `2000`. The underscore is a **source-level formatting character**, stripped during tokenization. It is not an operator, not a digit, and it never reaches runtime.

The motivation behind it is mundane and practical: a long run of digits has no landmarks, so counting zeros by eye is unreliable — and in a timeout, a byte limit, or a money amount, one misplaced zero changes the magnitude silently. That was the actual trigger for this entry (§2).

So the syntax itself is a one-minute discovery. What makes it worth writing down is what the feature *doesn't* do — and the trap it hides for anyone writing financial code. This entry is about the gap between **how a number looks** and **how a computer stores it**.

## 2. Why I Explored This

The trigger wasn't curiosity about syntax. It was a counting problem.

Whenever I read or type a large precision number — a millisecond timeout, a byte limit, a `NUMERIC(12,2)` column, an amount in paise — I have to count zeros to work out the scale:

```js
1000000
10000000
100000000
```

Three literals, one extra zero each, and nothing visually anchors where the run of zeros ends. I kept losing my place mid-count and re-reading from the start to be sure I had it right.

The counting problem gets worse as the number grows, because each step adds no new visual landmark:

| Raw literal | Digits | Zeros | Separated | Reads as |
|---|---|---|---|---|
| `1000` | 4 | 3 | `1_000` | one thousand |
| `10000` | 5 | 4 | `10_000` | ten thousand |
| `100000` | 6 | 5 | `100_000` | one hundred thousand |
| `1000000` | 7 | 6 | `1_000_000` | one million |
| `10000000` | 8 | 7 | `10_000_000` | ten million |
| `100000000` | 9 | 8 | `100_000_000` | one hundred million |
| `1000000000` | 10 | 9 | `1_000_000_000` | one billion |

A miscount is not a cosmetic bug. Being one zero short on a timeout literal changes the unit entirely:

```js
console.log(86_400_000 === 24 * 60 * 60 * 1000);  // true — one day in milliseconds
console.log(86_400_00 / 1000 / 60);               // 144 minutes, not one day
```

Same digits, one fewer zero, and the value quietly means something else. Nothing throws. That is exactly the failure mode a visual grouping removes.

Then I noticed the language already had an answer:

```bash
$ node -e "console.log(2_000)"
2000

$ node -e "console.log(2000)"
2000
```

Identical output. So the underscore costs nothing at runtime — which reframed the whole question. It isn't "what does this feature do?" but **where exactly is the underscore ignored, and where does it stop working?**

That boundary turned out to be the interesting part: it holds inside literals, and fails the moment the same digits arrive as a string or as JSON.

## 3. Understanding the Concept

**What is it?** A lexical feature, standardised as part of ES2021, that permits `_` (U+005F) between digits of a numeric literal.

**Why does it exist?** Long digit runs are hard to parse by eye. The TC39 proposal's own motivation is blunt about it:

```js
1000000000   // Is this a billion? a hundred million? ten million?
101475938.38 // What scale is this?
```

Worse, the proposal notes, digit runs hide *unit* information. In financial code the grouping itself is semantic:

```js
// From the TC39 proposal's motivation section
const smallFee    = 123_00;    // $123 — 12,300 cents
const largeFee    = 12_300;    // $12,300 — a rather large fee
const totalAmount = 12345_00;  // 12,345 — 1,234,500 cents
```

The separator carries meaning to a human reader that raw digits cannot.

**The one-line mental model:** the lexer deletes the underscores while forming the token, then converts the remaining digit sequence to a `Number` (or `BigInt`) exactly as if you had typed it without them. `2_000` and `2000` are the *same token value*, not two values that happen to compare equal.

## 4. How It Works Internally

### The pipeline

1. **Lexing.** The scanner walks the source left to right and matches `NumericLiteral`, whose grammar allows `NumericLiteralSeparator` between digits. The separator is consumed here — it is part of the token's *text*, not its *value*.
2. **Mathematical value (MV).** The spec associates the token with an exact mathematical value. `1_000` and `1000` have the identical MV of one thousand.
3. **Number conversion.** For ordinary `Number` literals, the MV is converted to the nearest IEEE 754 binary64 value. This step is where precision is decided — and the separator has already been discarded, so it cannot influence the result.
4. **Runtime.** Only the binary64 value exists. `typeof 2_000 === "number"`.

### The literal is one token, not an expression

The strongest evidence is that it is not evaluated as arithmetic. If `_` were an operator or a digit, something would break:

```js
console.log(2_000 === 2000);   // true
console.log(typeof 2_000);     // "number"
console.log(2_000 + "");       // "2000"
```

An operator would also break precedence-sensitive contexts. It doesn't — `2_000 * 3` is `6000`, not a parse error or `2 * 2000`.

### Where separators are legal

Verified against Node v22.23.1:

| Form | Example | Value | Legal |
|---|---|---|---|
| Integer | `1_000` | `1000` | ✅ |
| Integer part | `1_000.50` | `1000.5` | ✅ |
| Fractional part | `1_000.25_50` | `1000.255` | ✅ |
| Fraction, leading zero | `0.0_1` | `0.01` | ✅ |
| Exponent | `1e1_0` | `10000000000` (1e10) | ✅ |
| Exponent with sign | `1e+1_0`, `1e-1_0` | `1e10`, `1e-10` | ✅ |
| Both parts + exponent | `1_0e1_0` | `100000000000` (1e11) | ✅ |
| Binary | `0b1010_1010` | `170` | ✅ |
| Octal | `0o7_7` | `63` | ✅ |
| Hex | `0xFF_FF` | `65535` | ✅ |
| BigInt | `1_000n` | `1000n` | ✅ |
| BigInt, hex | `0xFF_FFn` | `65535n` | ✅ |

| Illegal form | Example | Error |
|---|---|---|
| Leading underscore | `_1000` | *not a SyntaxError* — it's an identifier (see §6) |
| Trailing underscore | `1000_` | `SyntaxError: Numeric separators are not allowed at the end of numeric literals` |
| Consecutive | `1__000` | `SyntaxError: Only one underscore is allowed as numeric separator` |
| Adjacent to point (left) | `1_.000` | `SyntaxError: Numeric separators are not allowed at the end of numeric literals` |
| Adjacent to point (right) | `1._0` | `SyntaxError: Invalid or unexpected token` |
| Adjacent to exponent marker | `1_e3` | `SyntaxError: Numeric separators are not allowed at the end of numeric literals` |
| After radix prefix | `0x_FF` | `SyntaxError: Invalid or unexpected token` |
| After leading zero | `0_1` | `SyntaxError: Numeric separator can not be used after leading 0.` |
| Before `n` suffix | `1_000_n` | `SyntaxError: Numeric separators are not allowed at the end of numeric literals` |

**The rule, stated precisely:** the underscore must sit between two digits *within a single numeric literal* — where "digit" means any digit valid for that radix (so `a`–`f` in hex). The looser phrasing "`_` goes between digit characters" fails to predict `0_1` and `0x_FF`, which are rejected even though `_` sits between characters that look like digits. Those two errors come from the radix grammar, not the separator grammar.

### Source text survives in one place

The runtime value has no underscore, but `Function.prototype.toString()` returns *source text*, so the separator persists in serialised functions:

```js
console.log((function f() { return 2_000; }).toString());
// function f() { return 2_000; }
```

This is a curiosity rather than a leak — nothing downstream parses that string as a number. But it does mean "the underscore is always gone" is only true of the *value*.

## 5. Practical Examples

### Example 1 — separators are ignored in every part of a decimal literal

```js
console.log(1_000.50);          // 1000.5
console.log(1_000.25_50);       // 1000.255
console.log(0.1_0);             // 0.1
console.log(12_345.67_89);      // 12345.6789
console.log(1_000_000.99);      // 1000000.99
```

Note `1000.50` prints as `1000.5` — trailing zeros are not part of a `Number`'s value. `console.log` prints the shortest string that round-trips, so if you need exactly two decimal places for display, that is a *formatting* concern (see §7), not a value concern.

It is also worth being precise about what "the literal value" means. `1000.255` *prints* as `1000.255`, but the stored binary64 is not exactly that decimal:

```js
console.log((1000.255).toPrecision(20));  // 1000.2549999999999955
```

The printer hides the error; the arithmetic does not. This is the same phenomenon as §Example 3, one magnitude larger.

### Example 2 — the separators do not touch precision

```js
console.log(0.1 + 0.2);          // 0.30000000000000004
console.log(0.1_0 + 0.2_0);      // 0.30000000000000004

console.log(1_000.10 + 1_000.20); // 2000.3000000000002
console.log(1000.10 + 1000.20);   // 2000.3000000000002
```

Identical, because the separators are gone before the arithmetic happens. The discrepancy originates in binary64 representation of the decimal literals, and both versions hit it equally.

### Example 3 — proving where the error comes from

`0.1`, `0.2`, and `0.3` cannot be represented exactly in binary64. Inspecting the raw bits:

```js
const bits = (n) => {
  const b = new ArrayBuffer(8);
  new DataView(b).setFloat64(0, n);
  return Buffer.from(b).toString("hex");
};

console.log(bits(0.1));        // 3fb999999999999a
console.log(bits(0.2));        // 3fc999999999999a
console.log(bits(0.3));        // 3fd3333333333333
console.log(bits(0.1 + 0.2));  // 3fd3333333333334
```

The sum is one unit in the last place (1 ULP) *above* the stored `0.3`. At that magnitude one ULP is about `5.55e-17`. So:

```js
console.log(0.1 + 0.2 === 0.3);          // false
console.log(0.1 + 0.2 - 0.3);            // 5.551115123125783e-17
```

The separator cannot help here because the problem is the *conversion from decimal to binary*, which happens identically with or without underscores.

### Example 4 — strings do not participate

Separators are lexer syntax. Once you are inside a string, you are calling a *parser* for text, and those parsers follow their own rules:

```js
console.log(Number("2_000"));        // NaN
console.log(parseInt("2_000"));      // 2
console.log(parseFloat("2_000.5"));  // 2
console.log(+"2_000");               // NaN
console.log(Number("0x1_0"));        // NaN
```

Why they differ:

- `Number()` uses the **StringNumericLiteral** grammar, which has no separator production — the whole string fails, producing `NaN`.
- `parseInt()` does not validate the whole string. It reads the longest valid prefix and stops at the first invalid character. `_` is invalid, so it stops after `2`.
- `parseFloat()` behaves the same way, stopping at `_` — which is why `"2_000.5"` yields `2`, discarding the fraction too.

`parseInt` is especially dangerous because it reports **no error** — it silently returns a wrong, smaller number. `parseInt("1_000.50")` is `1`, not `1000`.

One more: `BigInt("1_000")` throws rather than returning a sentinel.

```js
BigInt("1_000");
// SyntaxError: Cannot convert 1_000 to a BigInt
```

### Example 5 — JSON does not support separators

RFC 8259 defines a JSON number as `int frac? exp?`, where `int` is `0` or a non-zero digit followed by digits. `_` appears nowhere in the grammar.

```js
JSON.parse('{ "amount": 2_000 }');
// SyntaxError: Expected ',' or '}' after property value in JSON at position 13

JSON.parse('{ "amount": 2000 }');  // { amount: 2000 }
```

The reverse direction is a silent trap: `JSON.stringify` *emits* plain digits, so separators never appear in JSON you generate. The inconsistency only bites when a human hand-edits a JSON fixture, config file, or request body with `_` and it fails at parse time — or worse, when the JSON is assembled by string templates from source literals.

## 6. Edge Cases and Common Mistakes

### Mistake 1 — assuming `_1000` is a syntax error

`_1000` is not an invalid number; it is a **valid identifier**. JavaScript is allowed to start identifiers with `_`.

```js
console.log(_1000);
// ReferenceError: _1000 is not defined
```

This matters for diagnosis: a `ReferenceError` means "unknown variable", a `SyntaxError` means "malformed source". If you see `ReferenceError` on `_1000`, the lexer never saw a number at all. `_1000` is even usable as a statement label, which confirms it lexes as an identifier:

```js
_1000: for (;;) break _1000;  // valid
```

### Mistake 2 — `1_000.toString()` throws

```js
1_000.toString();
// SyntaxError: Invalid or unexpected token

(1_000).toString();   // "1000"
1_000..toString();    // "1000"
(1_000).toString(2);  // "1111101000"
```

This looks like a separator bug but isn't. After a digit run, `.` is read as the start of a *fractional part*, not member access — so `1000.toString()` fails identically without separators. The separator merely makes long literals more common in code that then hits it. The fix is parentheses (clearest) or a second dot.

### Mistake 3 — treating `toFixed()` as decimal rounding

`toFixed()` rounds the *binary64 value* to a fixed number of decimal places, and binary64 already carries the error from conversion. Verified:

```js
console.log((1.005).toFixed(2));  // "1.00"   — expected "1.01" in decimal arithmetic
console.log((2.675).toFixed(2));  // "2.67"   — expected "2.68"
console.log(Math.round(1.005 * 100) / 100); // 1  — the same error, via a different route
```

Both `1.005` and `2.675` are stored slightly *below* their decimal value, so round-half-up acts on the wrong input. This is not a `toFixed` defect; it is correctly rounding the wrong number. Rounding money is a decimal operation and needs decimal arithmetic.

### Mistake 4 — mixing `BigInt` and `Number`

`1_000n` is a `BigInt`, a different type. Arithmetic across the two types is a hard error, not a coercion:

```js
console.log(typeof 1_000);   // "number"
console.log(typeof 1_000n);  // "bigint"

1_000n + 1;
// TypeError: Cannot mix BigInt and other types, use explicit conversions
```

And `BigInt` does not serialise:

```js
JSON.stringify({ amount: 1_000n });
// TypeError: Do not know how to serialize a BigInt
```

If amounts are `BigInt` in your domain model, your API layer needs an explicit string conversion. Making that a silent `Number()` call reintroduces exactly the precision loss `BigInt` was chosen to avoid.

### Mistake 5 — assuming all currencies have two decimals

This is the conceptual error hiding in "store money in paise/cents". Two decimal places is a common case, not a universal rule:

| Currency | Minor-unit exponent | `100` means | Source |
|---|---|---|---|
| USD, EUR, INR | 2 | 1.00 | ISO 4217; Stripe & Razorpay docs |
| JPY, KRW | 0 | 100 | Stripe zero-decimal list; Razorpay |
| KWD, BHD, OMR | 3 | 0.100 | ISO 4217; Razorpay three-decimal list |

Confirmed via `Intl`, which encodes the same table:

```js
const digits = (c) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: c })
    .resolvedOptions().maximumFractionDigits;

console.log(digits("INR"), digits("JPY"), digits("KWD"));  // 2 0 3
```

Hard-coding `× 100` silently corrupts JPY by 100× and truncates KWD by 10×. The minor-unit exponent belongs in your currency metadata, keyed by ISO code — not in a constant.

### Mistake 6 — ignoring the safe-integer ceiling

Minor units are integers, but they are still binary64 integers once they are `Number` values. `Number.MAX_SAFE_INTEGER` is `9007199254740991` (2⁵³ − 1), so the largest safely representable amount in 2-decimal minor units is:

```js
console.log(Number.MAX_SAFE_INTEGER);        // 9007199254740991
console.log(Number.MAX_SAFE_INTEGER / 100);  // 90071992547409.9
```

Above that, integers stop being distinct:

```js
console.log(9007199254740993);              // 9007199254740992 — silently off by one
console.log(2 ** 53 === 2 ** 53 + 1);       // true
```

For a payment gateway this ceiling is irrelevant in practice — Stripe caps INR at 9 digits of minor units (`999999999`, i.e. ₹9,999,999.99), roughly seven orders of magnitude below the limit. The real risk is **rounding and accumulation**, not overflow. Still, ledger aggregation across millions of rows can approach limits that a single charge never would.

## 7. Real-World Applications

### Payment gateways: two separate problems, two separate tools

Stripe's API documents what this whole entry has been circling: `amount` is an integer in the **currency's minor unit**. Razorpay uses the same convention and spells out the multi-exponent cases explicitly.

```
Stripe:
  1000  → charge 10 USD (two-decimal currency)
  10    → charge 10 JPY (zero-decimal currency)

Razorpay:
  29900   → ₹299        (two-decimal)
  295     → ¥295        (zero-decimal)
  295990  → KWD 295.991 (three-decimal)
```

So the correct framing is a **boundary**, not a preference:

| Layer | Representation | Rule |
|---|---|---|
| Source code | `110_030` | separators allowed and encouraged |
| Domain / DB | integer minor units + ISO currency code | exact, no floats |
| Gateway API | integer minor units | matches Stripe/Razorpay convention |
| Display | `Intl.NumberFormat` | locale-aware, never hand-formatted |
| JSON / API I/O | decimal string or integer | never `_`, never a float |

The integer path is exact by construction:

```js
const amountInPaise = 110_030;
const taxInPaise    = 0;        // keep the shape visible
const totalInPaise  = amountInPaise + taxInPaise;

console.log(totalInPaise);  // 110030
```

And display is a formatting step, not an arithmetic one:

```js
const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });
console.log(inr.format(110_030 / 100));  // ₹1,100.30
```

Note the `/100` appears only at the display boundary and never feeds back into stored values.

### Why float arithmetic fails at scale, not at first

Single operations often *look* fine, which is what makes this class of bug expensive:

```js
let sum = 0;
for (const x of [0.10, 0.20, 0.30, 0.40]) sum += x;
console.log(sum, sum === 1);  // 1 true   ← looks fine!

let tenths = 0;
for (let i = 0; i < 10; i++) tenths += 0.1;
console.log(tenths, tenths === 1);  // 0.9999999999999999 false   ← the same code shape fails
```

The failure is **order- and count-dependent**. A unit test with four items passes; the reconciliation run over 10,000 ledger entries produces a one-paisa drift that nobody can trace. That asymmetry is the strongest argument for integers in the domain model: not that floats are always visibly wrong, but that they fail non-deterministically with respect to data volume and summation order.

### When a decimal library is genuinely warranted

Integer minor units handle addition, subtraction, and exact comparison. They do **not** handle:

- **Percentage tax and discount allocation** at arbitrary precision
- **Multi-currency FX conversion** where intermediate precision exceeds the target currency's exponent
- **Proration and rounding allocation** where remainders must be distributed without losing a unit
- **Currencies with 3 decimals** used in intermediate calculations

For those, `decimal.js` or `big.js` provide decimal arithmetic with explicit rounding modes. The trade-off: decimal values are objects, not primitives — they do not survive `JSON.parse`, do not compare with `===`, and add allocation cost. The pragmatic pattern is integers for storage and transport, a decimal library for the computation that must round, and `Intl` for output.

### Beyond payments

- **Code review.** Separators reduce magnitude misreads in timeouts (`86_400_000`), byte thresholds (`1_048_576`), and large IDs. It is a readability win with no runtime cost, since the stripped token is identical either way. This is the problem that started this entry (§2): counting zeros by eye is unreliable, and the grouping turns an invisible mistake into a visible one.
- **Binary and hex literals.** Grouping by nibble (`0b1010_0001`, `0xFF_EC_DE_5E`) makes bitmask constants reviewable, which is where off-by-one-shift bugs get caught.
- **Transpilation.** TypeScript shipped support in 2.7 (2018) and Babel maintains `@babel/plugin-transform-numeric-separator`. Neither is needed for a Node release that supports ES2021, but they matter if you still emit to an ES2019 target.

## 8. Important Takeaways

- **Separators are lexical, not semantic.** The lexer strips `_` while forming the token; the value is identical to the unseparated literal, and `typeof` is unchanged.
- **They solve a reading problem, not a memory problem.** Zeros are hard to count (`86_400_000` vs `86_400_00`); the separator breaks the run into groups your eye can verify at a glance. It changes nothing about how the number is stored.
- **They cannot affect precision.** Precision is decided when the decimal literal is converted to binary64 — a step that runs *after* the separator has been discarded. `0.1_0 + 0.2_0` is `0.30000000000000004` for the same reason `0.1 + 0.2` is.
- **String parsers do not know about them.** `Number("2_000")` is `NaN`, `parseInt("2_000")` is silently `2`. Silent truncation is the dangerous failure mode.
- **JSON rejects them** (RFC 8259), and `JSON.stringify` never emits them. Any `_` reaching a JSON parser is a hand-written-config bug.
- **Readability and correctness are orthogonal concerns.** Separators fix the first; integer minor units and decimal arithmetic fix the second. Conflating them is the actual misconception.
- **"Cents" is a two-decimal assumption.** JPY has 0 decimals, KWD and BHD have 3. Derive the exponent from currency metadata.

## 9. Further Things to Explore

- **Rounding modes.** `Intl.NumberFormat` v3 (ES2023) supports `roundingMode: "halfExpand"`, which gives `$1.01` for `1.005` where `toFixed` gives `"1.00"` — verify whether that is decimal-exact or merely better-compensated.
- **`BigInt` for ledgers.** Which databases and drivers handle `BIGINT` cleanly across JS boundaries, and where does the `number` coercion sneak back in?
- **Stripe/Razorpay reconciliation.** How do settlement reports express rounding, and where do paise-level differences legitimately appear?
- **The `Intl` currency table.** Is `maximumFractionDigits` a reliable runtime source of truth for ISO 4217 exponents, or should it be treated as display-only?
- **Minifier behaviour.** Do terser/esbuild preserve or strip separators in output, and does that change source maps?

## 10. References

- [MDN — Lexical grammar: Numeric separators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#numeric_separators) — the authoritative legality table, including the `0_1` and `100__000` rejections.
- [TC39 — Numeric Separator proposal](https://github.com/tc39/proposal-numeric-separator) — motivation, spec design, prior art across Java/Rust/Kotlin, and shipping versions (V8 v7.5, Firefox 70, Safari 13).
- [ECMA-262 — NumericLiteralSeparator production](https://tc39.es/ecma262/multipage/ecmascript-language-lexical-grammar.html#prod-NumericLiteralSeparator) — the normative grammar.
- [RFC 8259 §6 — Numbers](https://www.rfc-editor.org/rfc/rfc8259#section-6) — why JSON has no separator production.
- [MDN — Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) — binary64, `MAX_SAFE_INTEGER`, `EPSILON`.
- [MDN — parseInt()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseInt) — the "longest valid prefix" rule behind `parseInt("2_000") === 2`.
- [MDN — BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt) — mixing rules and serialisation limits.
- [Stripe — Supported currencies](https://docs.stripe.com/currencies#zero-decimal) — minor-unit amounts, zero-decimal list, and per-currency charge ceilings.
- [Razorpay — Create an Order](https://razorpay.com/docs/api/orders/create/) — `amount` as smallest sub-unit, explicit 0/2/3-decimal handling (JPY vs KWD/BHD/OMR), and integer-type validation.
- [MDN — Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat) — locale-aware currency formatting.
- [TypeScript 2.7 release notes](https://devblogs.microsoft.com/typescript/announcing-typescript-2-7/) — the transpiler-era support timeline.
