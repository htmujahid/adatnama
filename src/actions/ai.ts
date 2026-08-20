import { chat, maxIterations, toolDefinition } from "@tanstack/ai"
import { createOpenaiChat } from "@tanstack/ai-openai"
import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { env } from "cloudflare:workers"
import { z } from "zod"

import { auth } from "@/lib/auth"

const AI_MODEL = "gpt-5-nano"

const habitPlanSchema = z.object({
  title: z.string().min(1).describe("A short, appealing title for this habit."),
  description: z
    .string()
    .min(1)
    .describe(
      "One sentence describing what doing this habit looks like day to day.",
    ),
  target: z
    .string()
    .min(1)
    .describe(
      "A concrete, measurable target for one check-in, e.g. '5 km', '20 pages', '10 minutes'.",
    ),
  schedule: z
    .enum(["daily", "weekdays", "weekends"])
    .describe("Best-fit check-in cadence."),
})

export type HabitPlan = z.infer<typeof habitPlanSchema>

export const suggestHabitPlan = createServerFn({ method: "POST" })
  .validator((data: { topic: string }) => data)
  .handler(
    async ({
      data,
    }): Promise<{
      error: { message: string } | null
      plan: HabitPlan | null
    }> => {
      const headers = getRequestHeaders()
      const session = await auth.api.getSession({ headers })
      if (!session) {
        return { error: { message: "You must be signed in." }, plan: null }
      }

      const topic = data.topic.trim()
      if (!topic) {
        return {
          error: { message: "Tell me what you want to build first." },
          plan: null,
        }
      }

      if (!env.OPENAI_API_KEY) {
        return {
          error: { message: "The AI assistant isn't configured yet." },
          plan: null,
        }
      }

      const result: { plan: HabitPlan | null } = { plan: null }

      const proposeHabitPlan = toolDefinition({
        name: "propose_habit_plan",
        description:
          "Propose a plan for turning the user's stated goal into a trackable habit.",
        inputSchema: habitPlanSchema,
      }).server(async (input) => {
        result.plan = input
        return { acknowledged: true }
      })

      const stream = chat({
        adapter: createOpenaiChat(AI_MODEL, env.OPENAI_API_KEY),
        systemPrompts: [
          "You turn a user's stated goal into a trackable habit plan for a habit-tracking app, including a concrete measurable target for one check-in. Always call propose_habit_plan exactly once with your best suggestions. Never respond with plain text.",
        ],
        messages: [{ role: "user", content: topic }],
        tools: [proposeHabitPlan],
        modelOptions: {
          tool_choice: "required",
          max_output_tokens: 1000,
          reasoning: { effort: "minimal" },
        },
        agentLoopStrategy: maxIterations(1),
      })

      for await (const _chunk of stream) {
      }

      if (!result.plan) {
        return {
          error: { message: "The assistant didn't return a plan. Try again." },
          plan: null,
        }
      }

      return { error: null, plan: result.plan }
    },
  )
