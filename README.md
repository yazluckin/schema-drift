# schema-drift

> Detect runtime mismatches between TypeScript interfaces and incoming JSON payloads.

---

## Installation

```bash
npm install schema-drift
```

---

## Usage

Define your expected interface, then validate any incoming JSON payload against it at runtime.

```typescript
import { createValidator } from "schema-drift";

interface User {
  id: number;
  name: string;
  email: string;
}

const validate = createValidator<User>();

const payload = JSON.parse('{"id": 1, "name": "Alice"}');

const result = validate(payload);

if (!result.valid) {
  console.error("Schema drift detected:", result.errors);
  // Schema drift detected: [ "Missing required field: email" ]
} else {
  console.log("Payload matches schema.");
}
```

### Result Shape

```typescript
{
  valid: boolean;
  errors: string[];
}
```

---

## Why schema-drift?

TypeScript types are erased at runtime. When external APIs or data sources evolve unexpectedly, silent mismatches can cause hard-to-debug failures. **schema-drift** gives you a lightweight safety net without requiring a full schema definition language like JSON Schema or Zod.

---

## Contributing

Pull requests are welcome. Please open an issue first to discuss any major changes.

---

## License

[MIT](./LICENSE)