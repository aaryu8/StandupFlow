"use client"

import { CornerDownLeftIcon, FileCodeIcon, RefreshCwIcon } from "lucide-react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import React, { useEffect, useRef, useState } from "react"
import axios from "axios"
import { TextGenerateEffect } from "../ui/text-generate-effect"

// ─── Types ────────────────────────────────────────────────────────────────────

interface StandupData {
  done: string[]
  inProgress: string[]
  blockers: string[]
}

// ─── Section config ───────────────────────────────────────────────────────────

const SECTIONS: {
  key: keyof StandupData
  label: string
  accent: string          // Tailwind border color
  dot: string             // inline dot color
  badge: string           // badge bg + text
}[] = [
  {
    key: "done",
    label: "Completed",
    accent: "border-emerald-500/40",
    dot: "#10b981",
    badge: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20",
  },
  {
    key: "inProgress",
    label: "In Progress",
    accent: "border-sky-500/40",
    dot: "#38bdf8",
    badge: "bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/20",
  },
  {
    key: "blockers",
    label: "Blockers",
    accent: "border-amber-500/40",
    dot: "#f59e0b",
    badge: "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20",
  },
]

// ─── TextArea ─────────────────────────────────────────────────────────────────

const TextArea = ({
  setStandup,
  setKey,
}: {
  setStandup: (s: StandupData) => void
  setKey: (fn: (prev: number) => number) => void
}) => {
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!text.trim()) return
    setLoading(true)
    try {
      const response = await axios.post("/api/generate", { body: text })
      setStandup(response.data.standup)
      setKey((prev) => prev + 1)
      setText("")
    } catch (err: unknown) {
      // Pull the error message the API sent back, or fall back to a generic one
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        ?? "Something went wrong. Try again."
      setStandup({ done: [], inProgress: [], blockers: [msg] })
      setKey((prev) => prev + 1)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <InputGroup className="w-full max-w-sm bg-background">
        <InputGroupAddon align="block-start" className="border-b">
          <InputGroupText className="font-medium font-mono">
            <FileCodeIcon className="w-4 h-4" />
            Enter your work
          </InputGroupText>
          <InputGroupButton
            className="ml-auto"
            type="button"
            size="icon-xs"
            onClick={() => setText("")}
          >
            <RefreshCwIcon className="w-3 h-3" />
          </InputGroupButton>
        </InputGroupAddon>
        <InputGroupTextarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[500px]"
          placeholder={`What did you work on today?\n\n- Fixed login bug\n- Working on dashboard\n- Blocked on API spec`}
        />
        <InputGroupAddon align="block-end" className="border-t">
          <InputGroupText className="text-xs text-muted-foreground">
            {text.length} chars
          </InputGroupText>
          <InputGroupButton
            className="ml-auto"
            type="submit"
            size="sm"
            variant="default"
            disabled={loading || !text.trim()}
          >
            {loading ? "Generating…" : "Generate"}
            <CornerDownLeftIcon className="w-3 h-3" />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </form>
  )
}

// ─── Section card ─────────────────────────────────────────────────────────────

const SectionCard = ({
  section,
  items,
  animKey,
  delay,
}: {
  section: (typeof SECTIONS)[number]
  items: string[]
  animKey: number
  delay: number
}) => {
  return (
    <div
      className={`rounded-xl border ${section.accent} bg-muted/10 p-4 space-y-3`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        {/* Dot */}
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: section.dot, boxShadow: `0 0 6px ${section.dot}` }}
        />
        <span className={`text-[11px] font-semibold tracking-widest uppercase px-2 py-0.5 rounded-full ${section.badge}`}>
          {section.label}
        </span>
      </div>

      {/* Divider */}
      <div className={`h-px w-full ${section.accent} bg-current opacity-20`} />

      {/* Items */}
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={`${animKey}-${i}`} className="flex gap-2.5 items-start">
            <span
              className="mt-[6px] w-1 h-1 rounded-full flex-shrink-0 opacity-60"
              style={{ backgroundColor: section.dot }}
            />
            <span className="text-sm leading-relaxed text-foreground/85 font-mono">
              <TextGenerateEffect key={`${animKey}-${section.key}-${i}`} words={item} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── Placeholder ──────────────────────────────────────────────────────────────

const Placeholder = () => (
  <div className="h-full flex flex-col items-center justify-center gap-3 text-muted-foreground/40 select-none">
    <FileCodeIcon className="w-8 h-8" />
    <p className="text-sm font-mono tracking-wide">
      Your standup will appear here
    </p>
  </div>
)

// ─── StandupUI ────────────────────────────────────────────────────────────────

export const StandupUI = () => {
  const [standup, setStandup] = useState<StandupData | null>(null)
  const [key, setKey] = useState(0)
  const rightRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    rightRef.current?.scrollTo({ top: 0, behavior: "smooth" })
  }, [key])

  return (
    <div className="min-h-screen pt-25 pb-10 px-6 bg-background">

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 h-14 flex items-center gap-2">
          <span className="font-mono text-xs font-semibold tracking-widest uppercase text-muted-foreground">
            Standup
          </span>
          <span className="w-1 h-1 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 6px #10b981" }} />
          <span className="font-mono text-xs text-muted-foreground/50">formatter</span>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl h-[80vh] grid grid-cols-2 gap-6">

        {/* LEFT */}
        <div className="h-full">
          <TextArea setStandup={setStandup} setKey={setKey} />
        </div>

        {/* RIGHT */}
        <div
          ref={rightRef}
          className="h-full rounded-xl border border-border/30 bg-muted/5 overflow-y-auto overflow-x-hidden p-5 space-y-4"
        >
          {!standup ? (
            <Placeholder />
          ) : (
            SECTIONS.map((section, i) => {
              const items = standup[section.key]
              if (!items || items.length === 0) return null
              return (
                <SectionCard
                  key={`${key}-${section.key}`}
                  section={section}
                  items={items}
                  animKey={key}
                  delay={i * 150}
                />
              )
            })
          )}
        </div>

      </div>
    </div>
  )
}