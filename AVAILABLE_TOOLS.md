# Available Tools

## `web` namespace
- `web.run`
  - Supports: `search_query`, `open`, `click`, `find`, `screenshot`, `image_query`, `sports`, `finance`, `weather`, `time`

## `functions` namespace
- `functions.exec_command` — run shell commands
- `functions.write_stdin` — interact with running command sessions
- `functions.update_plan` — update task plan state
- `functions.request_user_input` — collect structured user choices (not available in current Default collaboration mode)
- `functions.view_image` — view a local image by absolute path
- `functions.apply_patch` — apply structured file patches

## `multi_tool_use` namespace
- `multi_tool_use.parallel` — run multiple `functions.*` tool calls in parallel when tasks are independent

## Notes
- Network is restricted in this environment.
- Filesystem mode is `workspace-write`.
