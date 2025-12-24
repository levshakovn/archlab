## 1. Core POC Goal

Build a **single‑user web app** where you can:

- Select 1 of 5 puzzles.
- Drag AWS services onto a canvas and position them.
- (Optional POC) Draw simple connections between services.
- Click “Grade” to get a **mock AI evaluation** based on the puzzle JSON (later you swap to real LLM).

Target: something you can realistically build in **2–3 weeks of evenings/weekends**.

---

## 2. Functional Requirements (What the POC Must Do)

## App structure

- Puzzle selector: dropdown or side list with the **5 puzzles** you already defined (static site, 3‑tier, serverless API, async pipeline, data lake).
- Canvas view:
    - Left sidebar: list of **`allowedServices`** for the selected puzzle.
    - Center: grid canvas with draggable nodes.
    - Bottom: “Grade Solution” and “Clear” buttons.
- Results panel:
    - Displays scores (correctness, reliability, security, cost, total).
    - Shows which requirements were met/not met.
    - Shows one feedback paragraph.

## Puzzle selection

- When user selects a puzzle:
    - Load its **`scenario`**, **`requirements`**, **`allowedServices`** and **`commonMistakes`** from JSON.
    - Reset canvas and result state.

## Drag & drop nodes

- User can:
    - Drag any service from the sidebar onto the canvas.
    - Move existing nodes around.
    - Remove a node (small × button).
- Each node stores:
    - **`id`**, **`serviceType`**, **`label`**, **`x`**, **`y`**.

## Connections (lightweight for POC)

- POC-level:
    - Optional: Click a node A, then node B to create a basic “connection” (just stored as **`{from, to}`**).
    - Visualize as simple lines between centers of boxes.
- For now, **no special semantics**—just graph edges.

## Graph JSON export

- Button “Export JSON” (can be hidden or dev-only).
- Build JSON structure:

`json{
  "puzzleId": "<currentPuzzleId>",
  "nodes": {
    "node-1": { "type": "ALB", "label": "ALB", "metadata": {} },
    "node-2": { "type": "EC2", "label": "WebServer", "metadata": {} }
  },
  "edges": [
    { "from": "node-1", "to": "node-2", "type": "connection" }
  ]
}`

---

## 3. Evaluation (Mock AI for POC)

You don’t need real AI yet; for POC you just simulate scoring.

## Input to grading function

- Current puzzle object (scenario, requirements, allowedServices).
- Current **`graphJSON`**.

## Simple heuristic scoring (v1)

- correctness:
    - Score based on “key services present” count.
    - Example: For **`puzzle-3tier-basic`**, require at least 1 of each:
        - Load balancer: ALB/NLB
        - Compute: EC2/ASG
        - DB: RDS/Aurora
        - VPC + at least one public + one private “like” service (VPC + Subnet).
- reliability:
    - Higher if there are **multiple** compute nodes or DB variants (pretend multi‑AZ).
- security:
    - Higher if there is **no** Internet Gateway directly connected to DB.
- cost:
    - Penalize overuse of “heavy” services (e.g., Redshift, MSK, multiple NAT Gateways) when simpler ones exist.

## Output shape

`json{
  "scores": {
    "correctness": 7,
    "reliability": 6,
    "security": 8,
    "cost": 5,
    "total": 6.5
  },
  "requirements": [
    { "requirement": "Use a load balancer …", "met": true, "comment": "ALB node found" },
    { "requirement": "Database not public …", "met": false, "comment": "No DB node detected" }
  ],
  "hardConstraintViolations": [],
  "summaryFeedback": "Good start, but you are missing a database layer and private networking."
}`

For the POC, this can be a plain JavaScript function; later you replace it with the LLM call.

---

## 4. Technical Requirements (Implementation Checklist)

## Frontend

- Tech: **React** (as in your current POC) + plain CSS or Tailwind.
- Components:
    - **`App`**: loads puzzles JSON, handles selected puzzle state.
    - **`Sidebar`**: renders **`allowedServices`** and handles drag start.
    - **`Canvas`**: renders nodes + edges, supports drop, move, delete.
    - **`Controls`**: grade, clear, export buttons.
    - **`ResultPanel`**: shows scoring JSON in a nice way.

## Data

- Store the puzzle JSON you already have in a local file, e.g. **`puzzles.json`**.
- Load once at startup or hardcode as a constant.

## No backend needed for POC

- All logic can run in the browser.
- When ready to hook an LLM, you add a tiny backend later.