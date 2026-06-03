"""
DevMirror — Phi-4 agentic loop via GitHub Models (OpenAI-compatible endpoint).
Uses the openai SDK pointed at models.inference.ai.azure.com with a GitHub PAT.
"""

import json
import logging
import os
from datetime import datetime
from typing import Any, Optional

from openai import OpenAI

logger = logging.getLogger(__name__)

# ── Tool declarations (OpenAI function-calling format) ─────────────────────────

_TOOL_DECLARATIONS = [
    {
        "type": "function",
        "function": {
            "name": "fetch_github_stats",
            "description": (
                "Fetch live GitHub statistics for a developer: repos, commits this week, "
                "top repository, languages, followers, contribution grid."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "username": {"type": "string", "description": "GitHub username"}
                },
                "required": ["username"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "fetch_leetcode_stats",
            "description": (
                "Fetch LeetCode statistics: total problems solved, difficulty breakdown "
                "(easy/medium/hard), current streak, acceptance rate, ranking."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "username": {"type": "string", "description": "LeetCode username"}
                },
                "required": ["username"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "fetch_codeforces_stats",
            "description": (
                "Fetch Codeforces stats: rating, rank, max rating, problems solved, "
                "recent submission verdicts."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "handle": {"type": "string", "description": "Codeforces handle"}
                },
                "required": ["handle"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "fetch_gitlab_stats",
            "description": (
                "Fetch GitLab statistics: total projects, commits this week, open merge "
                "requests, top project, languages used."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "username": {"type": "string", "description": "GitLab username"},
                    "token":    {"type": "string", "description": "GitLab personal access token"},
                },
                "required": ["username", "token"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "fetch_gmail_opportunities",
            "description": (
                "Fetch filtered Gmail emails about internships, hackathons, and scholarships "
                "for the authenticated user."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "user_id": {"type": "integer", "description": "DevMirror user ID"}
                },
                "required": ["user_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "fetch_calendar_events",
            "description": "Fetch upcoming Google Calendar events for the authenticated user.",
            "parameters": {
                "type": "object",
                "properties": {
                    "user_id": {"type": "integer", "description": "DevMirror user ID"}
                },
                "required": ["user_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "schedule_calendar_event",
            "description": "Create a new Google Calendar event for the user.",
            "parameters": {
                "type": "object",
                "properties": {
                    "user_id":     {"type": "integer"},
                    "summary":     {"type": "string", "description": "Event title"},
                    "description": {"type": "string", "description": "Event description"},
                    "start_time":  {"type": "string", "description": "ISO 8601 start datetime"},
                    "end_time":    {"type": "string", "description": "ISO 8601 end datetime"},
                },
                "required": ["user_id", "summary", "start_time", "end_time"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_user_profile",
            "description": "Get the user's goals, handles, and linked account info from DevMirror.",
            "parameters": {
                "type": "object",
                "properties": {
                    "user_id": {"type": "integer", "description": "DevMirror user ID"}
                },
                "required": ["user_id"],
            },
        },
    },
]


# ── System prompt ──────────────────────────────────────────────────────────────

_SYSTEM_PROMPT = """You are DevMirror Coach — an elite AI agent for software engineers and CS students, powered by Microsoft Phi-4 via GitHub Models.

You have access to tools that fetch LIVE data from the user's developer accounts: GitHub, GitLab, LeetCode, Codeforces, Gmail, and Google Calendar.

AGENT RULES:
1. Always fetch relevant live data using tools before answering questions about the user's progress.
2. For scheduling requests, use schedule_calendar_event and confirm what was created.
3. Be specific — reference actual numbers, repo names, problem titles from the fetched data.
4. Be motivating, never shame. Celebrate wins. Give ONE concrete next action.
5. Use markdown for formatting: **bold**, ## headers, bullet points. Max 400 words.
6. Never be vague. If data isn't available, say so and recommend what to set up.

Today is {today}. The user's goals are:
  • Goal 1: {goal_1}
  • Goal 2: {goal_2}
  • Goal 3: {goal_3}
"""


# ── Agent context ──────────────────────────────────────────────────────────────

class AgentContext:
    def __init__(
        self,
        user_id: int,
        goal_1: str,
        goal_2: str,
        goal_3: str,
        fetch_github_fn,
        fetch_leetcode_fn,
        fetch_codeforces_fn,
        fetch_gitlab_fn,
        fetch_gmail_fn,
        fetch_calendar_fn,
        create_calendar_fn,
        get_user_fn,
        gitlab_username: str = "",
        gitlab_token: str = "",
    ):
        self.user_id          = user_id
        self.goal_1           = goal_1
        self.goal_2           = goal_2
        self.goal_3           = goal_3
        self.fetch_github     = fetch_github_fn
        self.fetch_leetcode   = fetch_leetcode_fn
        self.fetch_codeforces = fetch_codeforces_fn
        self.fetch_gitlab_raw = fetch_gitlab_fn
        self.fetch_gmail      = fetch_gmail_fn
        self.fetch_calendar   = fetch_calendar_fn
        self.create_calendar  = create_calendar_fn
        self.get_user         = get_user_fn
        self.gitlab_username  = gitlab_username
        self.gitlab_token     = gitlab_token

    def execute_tool(self, name: str, args: dict) -> Any:
        try:
            if name == "fetch_github_stats":
                return self.fetch_github(args["username"])
            if name == "fetch_leetcode_stats":
                return self.fetch_leetcode(args["username"])
            if name == "fetch_codeforces_stats":
                return self.fetch_codeforces(args["handle"])
            if name == "fetch_gitlab_stats":
                return self.fetch_gitlab_raw(
                    args.get("username", self.gitlab_username),
                    args.get("token", self.gitlab_token),
                )
            if name == "fetch_gmail_opportunities":
                return self.fetch_gmail(args["user_id"])
            if name == "fetch_calendar_events":
                return self.fetch_calendar(args["user_id"])
            if name == "schedule_calendar_event":
                event = {
                    "summary":     args.get("summary", "DevMirror Task"),
                    "description": args.get("description", ""),
                    "start_time":  args["start_time"],
                    "end_time":    args["end_time"],
                }
                result = self.create_calendar(args["user_id"], event)
                return {"created": True, "event_id": result.get("id", ""), **event}
            if name == "get_user_profile":
                return self.get_user(args["user_id"])
        except Exception as e:
            logger.error(f"Tool {name} failed: {e}")
            return {"error": str(e)}
        return {"error": f"Unknown tool: {name}"}


# ── Phi-4 agentic loop via GitHub Models ──────────────────────────────────────

def run_agent(
    question: str,
    ctx: AgentContext,
    max_turns: int = 6,
) -> dict[str, Any]:
    api_key = os.getenv("GITHUB_MODELS_TOKEN", "")
    model   = os.getenv("GITHUB_MODELS_MODEL", "Phi-4")

    if not api_key:
        return {
            "response":         "GitHub Models token not configured.",
            "tool_calls":       [],
            "is_schedule":      False,
            "scheduled_events": [],
        }

    client = OpenAI(
        base_url="https://models.inference.ai.azure.com",
        api_key=api_key,
    )

    system_prompt = _SYSTEM_PROMPT.format(
        today=datetime.utcnow().strftime("%Y-%m-%d"),
        goal_1=ctx.goal_1 or "Not set",
        goal_2=ctx.goal_2 or "Not set",
        goal_3=ctx.goal_3 or "Not set",
    )

    messages: list[dict] = [
        {"role": "system", "content": system_prompt},
        {"role": "user",   "content": question},
    ]

    all_tool_calls: list[dict] = []
    scheduled_events: list[dict] = []
    is_schedule = False

    for turn in range(max_turns):
        try:
            response = client.chat.completions.create(
                model=model,
                messages=messages,
                tools=_TOOL_DECLARATIONS,
                tool_choice="auto",
                temperature=0.7,
                max_tokens=1024,
            )
        except Exception as e:
            logger.error(f"[Agent] API error turn {turn}: {e}")
            return {
                "response":         "Could not reach AI service. Check your connection.",
                "tool_calls":       all_tool_calls,
                "is_schedule":      False,
                "scheduled_events": [],
            }

        msg = response.choices[0].message

        # Append assistant turn to history
        assistant_turn: dict = {"role": "assistant", "content": msg.content or ""}
        if msg.tool_calls:
            assistant_turn["tool_calls"] = [
                {
                    "id":       tc.id,
                    "type":     "function",
                    "function": {"name": tc.function.name, "arguments": tc.function.arguments},
                }
                for tc in msg.tool_calls
            ]
        messages.append(assistant_turn)

        # No tool calls → final answer
        if not msg.tool_calls:
            return {
                "response":         msg.content or "I couldn't generate a response. Please try again.",
                "tool_calls":       all_tool_calls,
                "is_schedule":      is_schedule,
                "scheduled_events": scheduled_events,
            }

        # Execute each tool and append results
        for tc in msg.tool_calls:
            tool_name = tc.function.name
            try:
                tool_args = json.loads(tc.function.arguments)
            except json.JSONDecodeError:
                tool_args = {}

            logger.info(f"[Agent] calling tool: {tool_name}({list(tool_args.keys())})")
            all_tool_calls.append({"tool": tool_name, "args": list(tool_args.keys())})

            result = ctx.execute_tool(tool_name, tool_args)

            if tool_name == "schedule_calendar_event" and isinstance(result, dict) and result.get("created"):
                is_schedule = True
                scheduled_events.append({
                    "summary": result.get("summary", ""),
                    "start":   result.get("start_time", ""),
                    "end":     result.get("end_time", ""),
                })

            messages.append({
                "role":         "tool",
                "tool_call_id": tc.id,
                "content":      json.dumps(_safe_json(result)),
            })

    # Max turns reached — return last assistant content we have
    last_text = ""
    for m in reversed(messages):
        if m.get("role") == "assistant" and m.get("content"):
            last_text = m["content"]
            break

    return {
        "response":         last_text or "I've processed your request.",
        "tool_calls":       all_tool_calls,
        "is_schedule":      is_schedule,
        "scheduled_events": scheduled_events,
    }


# ── Helpers ────────────────────────────────────────────────────────────────────

def _safe_json(obj: Any) -> Any:
    try:
        json.dumps(obj)
        return obj
    except (TypeError, ValueError):
        return str(obj)
