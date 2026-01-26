# AI Flow Patterns

AI development patterns using OpenAI SDK v6 with Zod validation.

---

## Pure TypeScript Flow Structure

All AI flows use pure TypeScript + OpenAI SDK v6:

```typescript
// src/ai/flows/analyze-user-flow-pure.ts

import OpenAI from 'openai';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';

// 1. Input schema
const AnalyzeUserInputSchema = z.object({
  userId: z.string().uuid(),
  context: z.string().optional(),
});

type AnalyzeUserInput = z.infer<typeof AnalyzeUserInputSchema>;

// 2. Output schema
const AnalyzeUserOutputSchema = z.object({
  insights: z.array(z.string()),
  sentiment: z.enum(['positive', 'neutral', 'negative']),
  confidence: z.number().min(0).max(1),
});

type AnalyzeUserOutput = z.infer<typeof AnalyzeUserOutputSchema>;

// 3. Prompt builder
function buildAnalyzePrompt(input: AnalyzeUserInput): string {
  return `Analyze the following user data and provide insights.

User ID: ${input.userId}
${input.context ? `Context: ${input.context}` : ''}

Provide structured analysis with sentiment and confidence score.`;
}

// 4. Core flow function
async function analyzeUserCore(
  client: OpenAI,
  input: AnalyzeUserInput,
  model: string = 'gpt-4o-2024-11-20'
): Promise<AnalyzeUserOutput> {
  const response = await client.beta.chat.completions.parse({
    model,
    messages: [
      {
        role: 'system',
        content: 'You are an expert user behavior analyst.',
      },
      {
        role: 'user',
        content: buildAnalyzePrompt(input),
      },
    ],
    response_format: zodResponseFormat(AnalyzeUserOutputSchema, 'analysis'),
    temperature: 0.3,
  });

  const parsed = response.choices[0]?.message?.parsed;
  if (!parsed) {
    throw new Error('Failed to parse AI response');
  }

  return parsed;
}

// 5. Server action wrapper
export async function analyzeUser(
  rawInput: unknown
): Promise<{ ok: true; data: AnalyzeUserOutput } | { ok: false; error: string }> {
  try {
    const input = AnalyzeUserInputSchema.parse(rawInput);
    const client = new OpenAI();
    const result = await analyzeUserCore(client, input);
    return { ok: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { ok: false, error: `Validation error: ${error.message}` };
    }
    return { ok: false, error: (error as Error).message };
  }
}
```

---

## zodResponseFormat Usage

The `zodResponseFormat` helper ensures structured, validated AI responses:

```typescript
import { zodResponseFormat } from 'openai/helpers/zod';

const OutputSchema = z.object({
  title: z.string(),
  items: z.array(z.object({
    name: z.string(),
    score: z.number(),
  })),
  metadata: z.object({
    processingTime: z.number(),
    version: z.string(),
  }).optional(),
});

const response = await client.beta.chat.completions.parse({
  model: 'gpt-4o-2024-11-20',
  messages: [...],
  response_format: zodResponseFormat(OutputSchema, 'result'),
});

// response.choices[0].message.parsed is typed as z.infer<typeof OutputSchema>
```

**Schema naming**: The second argument is a name for the schema used in error messages.

---

## Prompt Builder Functions

Separate prompt construction from API calls:

```typescript
interface ExtractEntitiesInput {
  text: string;
  entityTypes: string[];
  language?: string;
}

function buildSystemPrompt(entityTypes: string[]): string {
  return `You are an expert entity extraction system.
Extract the following entity types: ${entityTypes.join(', ')}.
Return only entities found in the text with high confidence.`;
}

function buildUserPrompt(input: ExtractEntitiesInput): string {
  const lines = [`Text to analyze:\n${input.text}`];

  if (input.language) {
    lines.push(`\nLanguage: ${input.language}`);
  }

  lines.push('\nExtract all relevant entities.');

  return lines.join('\n');
}

async function extractEntities(
  client: OpenAI,
  input: ExtractEntitiesInput
): Promise<ExtractedEntities> {
  const response = await client.beta.chat.completions.parse({
    model: 'gpt-4o-2024-11-20',
    messages: [
      { role: 'system', content: buildSystemPrompt(input.entityTypes) },
      { role: 'user', content: buildUserPrompt(input) },
    ],
    response_format: zodResponseFormat(ExtractedEntitiesSchema, 'entities'),
  });

  return response.choices[0].message.parsed!;
}
```

---

## Error Handling for AI Flows

Handle AI-specific errors gracefully:

```typescript
import OpenAI from 'openai';
import { z } from 'zod';

type FlowResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code: string };

async function runFlow<T>(
  fn: () => Promise<T>
): Promise<FlowResult<T>> {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (error) {
    // Zod validation errors
    if (error instanceof z.ZodError) {
      return {
        ok: false,
        error: error.errors.map(e => e.message).join(', '),
        code: 'VALIDATION_ERROR',
      };
    }

    // OpenAI API errors
    if (error instanceof OpenAI.APIError) {
      if (error.status === 429) {
        return {
          ok: false,
          error: 'Rate limit exceeded. Please try again later.',
          code: 'RATE_LIMIT',
        };
      }
      if (error.status === 401) {
        return {
          ok: false,
          error: 'Authentication failed.',
          code: 'AUTH_ERROR',
        };
      }
      return {
        ok: false,
        error: error.message,
        code: 'API_ERROR',
      };
    }

    // Parse failures
    if (error instanceof Error && error.message.includes('parse')) {
      return {
        ok: false,
        error: 'Failed to parse AI response.',
        code: 'PARSE_ERROR',
      };
    }

    // Unknown errors
    return {
      ok: false,
      error: 'An unexpected error occurred.',
      code: 'UNKNOWN_ERROR',
    };
  }
}

// Usage
const result = await runFlow(() => analyzeUserCore(client, input));
if (!result.ok) {
  console.error(`[${result.code}] ${result.error}`);
}
```

---

## Server Action Wrapper Pattern

Wrap AI flows for safe use in server actions:

```typescript
'use server';

import { z } from 'zod';
import OpenAI from 'openai';

const InputSchema = z.object({
  query: z.string().min(1).max(1000),
  options: z.object({
    temperature: z.number().min(0).max(2).default(0.7),
    maxTokens: z.number().int().positive().max(4000).default(1000),
  }).optional(),
});

type Input = z.infer<typeof InputSchema>;
type Output = { response: string; usage: { tokens: number } };

export async function processQuery(
  rawInput: unknown
): Promise<{ success: true; data: Output } | { success: false; error: string }> {
  // 1. Validate input
  const parseResult = InputSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.errors[0]?.message ?? 'Invalid input',
    };
  }

  const input = parseResult.data;

  try {
    // 2. Initialize client
    const client = new OpenAI();

    // 3. Call API
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-2024-11-20',
      messages: [{ role: 'user', content: input.query }],
      temperature: input.options?.temperature ?? 0.7,
      max_tokens: input.options?.maxTokens ?? 1000,
    });

    // 4. Extract and return result
    const response = completion.choices[0]?.message?.content ?? '';
    const tokens = completion.usage?.total_tokens ?? 0;

    return {
      success: true,
      data: { response, usage: { tokens } },
    };
  } catch (error) {
    // 5. Handle errors
    console.error('AI flow error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
```

---

## Flow with Tools

For flows that need tool calling:

```typescript
import OpenAI from 'openai';
import { z } from 'zod';

const tools: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'search_database',
      description: 'Search the database for relevant records',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
          limit: { type: 'number', description: 'Max results' },
        },
        required: ['query'],
      },
    },
  },
];

async function executeWithTools(
  client: OpenAI,
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  toolHandlers: Record<string, (args: unknown) => Promise<string>>
): Promise<string> {
  let response = await client.chat.completions.create({
    model: 'gpt-4o-2024-11-20',
    messages,
    tools,
  });

  while (response.choices[0]?.message?.tool_calls?.length) {
    const toolCalls = response.choices[0].message.tool_calls;

    messages.push(response.choices[0].message);

    for (const call of toolCalls) {
      const handler = toolHandlers[call.function.name];
      if (!handler) {
        throw new Error(`Unknown tool: ${call.function.name}`);
      }

      const args = JSON.parse(call.function.arguments);
      const result = await handler(args);

      messages.push({
        role: 'tool',
        tool_call_id: call.id,
        content: result,
      });
    }

    response = await client.chat.completions.create({
      model: 'gpt-4o-2024-11-20',
      messages,
      tools,
    });
  }

  return response.choices[0]?.message?.content ?? '';
}
```

---

## Best Practices

1. **Validate inputs** with Zod before calling AI
2. **Use structured outputs** via `zodResponseFormat` when possible
3. **Separate concerns**: prompt building, API calls, error handling
4. **Handle all error types**: validation, API, parsing
5. **Wrap for server actions** with clean Result types
6. **Set appropriate temperature**: 0-0.3 for factual, 0.7+ for creative
7. **Log errors** with context for debugging
