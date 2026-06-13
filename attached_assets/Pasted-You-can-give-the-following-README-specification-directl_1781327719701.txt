You can give the following README/specification directly to Replit AI. It is written as a precise implementation request so Replit can understand where to integrate the feature without changing your existing project structure.

# AI-Based Smart Resource Allocation System (Gemini Integration)

## Objective

Add an AI-powered resource allocation feature to the existing Resource Connect project.

The current project already supports:

* Reporters submitting issues
* NGOs managing resources
* Volunteers performing tasks
* Admin overseeing operations

Currently, resource allocation and volunteer assignment are done manually.

The goal is to introduce AI-assisted allocation using the Gemini API while preserving the entire existing project structure, design, UI, routing, alignment, styling, content, database schema (unless absolutely necessary), and workflows.

---

## Important Constraints

### Do NOT change:

* Existing UI design
* Existing dashboard layouts
* Existing navigation
* Existing colors
* Existing styling
* Existing content
* Existing project structure
* Existing database records
* Existing authentication system
* Existing report workflow

Only add the new AI allocation functionality where it naturally fits.

---

# Feature Name

AI Smart Resource Allocation

---

# Problem

Currently:

1. NGOs manually decide which resources to send.
2. Admin manually monitors allocations.
3. Volunteers manually choose tasks.

This becomes inefficient during emergencies.

---

# Solution

Use Gemini API to automatically recommend:

* Which resources should be allocated
* How many resources should be allocated
* Which volunteers are best suited
* Priority ranking of requests

based on:

* Available resources
* Resource inventory
* Volunteer skills
* Volunteer availability
* Report severity
* Number of affected people
* Location
* Existing active tasks

---

# Integration Points

## 1. NGO Dashboard

Add a new section:

### AI Allocation Assistant

Place this where resource allocation currently happens.

Add button:

```text
Generate AI Allocation Plan
```

When clicked:

Collect:

* Active reports
* Available resources
* Resource quantities
* Volunteer availability
* Volunteer skills

Send to Gemini.

Gemini returns:

```text
Suggested Allocation

Report #12
Flood Relief

Resources:
- 100 Food Kits
- 50 Water Kits

Volunteers:
- Rahul
- Priya
- Aman

Priority:
Critical

Reason:
Large affected population and severe damage.
```

Display results in a clean card.

NGO can:

```text
Approve Allocation
```

or

```text
Modify Allocation
```

---

## 2. Volunteer Dashboard

Add:

### Recommended Tasks

Instead of volunteers searching manually.

Gemini evaluates:

* Skills
* Previous tasks
* Availability

Example:

```text
Recommended Task

Medical Camp

Match Score: 95%

Reason:
Volunteer has First Aid skill.
```

Button:

```text
Accept Task
```

---

## 3. Admin Dashboard

Add:

### AI Allocation Overview

Purpose:

Monitor all AI decisions.

Show:

```text
Total Allocations

Resources Allocated

Volunteers Assigned

Pending Requests

Critical Reports
```

Admin should be able to:

```text
Approve
Reject
Re-run Allocation
```

---

# Gemini Prompt Logic

When allocation is requested:

Send structured data like:

```json
{
  "report": {
    "type": "Flood",
    "affected_people": 250,
    "severity": "High"
  },
  "resources": [
    {
      "name": "Food Kit",
      "quantity": 500
    },
    {
      "name": "Water Kit",
      "quantity": 300
    }
  ],
  "volunteers": [
    {
      "name": "Aman",
      "skills": ["Driving"]
    },
    {
      "name": "Priya",
      "skills": ["Medical"]
    }
  ]
}
```

Gemini should return JSON:

```json
{
  "priority": "Critical",
  "resources": [
    {
      "resource": "Food Kit",
      "quantity": 150
    }
  ],
  "volunteers": [
    "Priya",
    "Aman"
  ],
  "reason": "High severity flood affecting 250 people."
}
```

Parse and display in dashboard.

---

# AI Priority Scoring

Generate score:

```text
Low
Medium
High
Critical
```

Based on:

* Severity
* Population affected
* Urgency
* Resource shortage

Critical reports should appear first.

---

# AI Volunteer Matching

Use:

* Skills
* Availability
* Location
* Current workload

Generate:

```text
Match Score: 92%
```

Assign highest scoring volunteers first.

---

# AI Resource Allocation Logic

Gemini should determine:

### Food Kits

Based on:

```text
Affected Population
```

### Water Kits

Based on:

```text
Population × Duration
```

### Medical Kits

Based on:

```text
Severity
```

Allocate only from available inventory.

Never exceed stock.

---

# Database Changes

Only if required.

Add table:

```sql
AI_Allocations

id
report_id
allocation_json
status
created_at
```

Status:

```text
Pending
Approved
Rejected
```

No other schema changes unless necessary.

---

# Safety Rules

Gemini recommendations are suggestions only.

Final decision remains with:

* NGO
* Admin

Never auto-approve allocations.

Always require approval.

---

# Expected Outcome

The project should become a true Smart Resource Allocation System where:

* Reports are prioritized automatically
* Resources are allocated intelligently
* Volunteers are matched automatically
* Admin can monitor all AI decisions

while keeping the entire existing Resource Connect project unchanged in design, structure, and functionality.

---

## Gemini API Requirements

Use Gemini API for:

* Resource allocation recommendations
* Volunteer matching
* Priority scoring

Store API key in environment variables.

Never expose API keys on the frontend.

Implement all AI calls through the backend.

This feature should feel like a natural extension of the existing project rather than a redesign.
