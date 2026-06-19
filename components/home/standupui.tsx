"use client"

import { CheckIcon, ClipboardIcon, CornerDownLeftIcon, FileCodeIcon, RefreshCwIcon } from "lucide-react"
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


const C = {
  canvas:     "#F2F1E8",
  surface:    "#FFFFFF",
  surfaceHigh:"#FAFAF8",
  border:     "#DCDAD2",
  borderSoft: "#EAEBEA",
  ink:        "#1A1D1A",
  inkMid:     "#6B7068",
  inkFaint:   "#A3A69F",
  brandSoft:  "#CDE0D4",
  done:       "#305341",
  inProgress: "#D99A4A",
  blockers:   "#C05746",
  spine:      "#15170F",
  spineLine:  "#2A2D24",
}



interface StandupData {
  done: string[]
  inProgress: string[]
  blockers: string[]
}

const SECTIONS: {
  key: keyof StandupData
  label: string
  color: string
}[] = [
  { key: "done",       label: "Completed",   color: C.done       },
  { key: "inProgress", label: "In Progress", color: C.inProgress },
  { key: "blockers",   label: "Blockers",    color: C.blockers   },
]

const EXAMPLES = [
  "fixed navbar bug, reviewed PR, stuck on webhook",
  "shipped dashboard v1, blocked on figma specs",
  "merged login fix, writing tests, waiting on access",
]

const Spinner = ({ color = C.surface }: { color?: string }) => (
  <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginLeft: "6px", flexShrink: 0 }}>
    <circle cx="7" cy="7" r="5.5" stroke={color} strokeOpacity="0.3" strokeWidth="2" />
    <path d="M7 1.5A5.5 5.5 0 0 1 12.5 7" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const TextArea = ({
  setStandup,
  setKey,
  loading,
  setLoading,
}: {
  setStandup: (s: StandupData) => void
  setKey: (fn: (prev: number) => number) => void
  loading: boolean
  setLoading: (v: boolean) => void
}) => {
  const [text, setText] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        ?? "Something went wrong. Try again."
      setStandup({ done: [], inProgress: [], blockers: [msg] })
      setKey((prev) => prev + 1)
    } finally {
      setLoading(false)
    }
  }

  function fillExample(example: string) {
    setText(example)
    textareaRef.current?.focus()
  }

  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col min-h-0">
      <InputGroup
        className="w-full h-full flex flex-col min-h-0 shadow-sm hover:shadow-md focus-within:shadow-md transition-shadow duration-300"
        style={{
          backgroundColor: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        <InputGroupAddon
          align="block-start"
          style={{ borderBottom: `1px solid ${C.borderSoft}`, backgroundColor: C.surfaceHigh }}
          className="px-5 py-4 flex items-center shrink-0"
        >
          <InputGroupText className="text-[11px] font-bold tracking-widest uppercase" style={{ color: C.inkMid }}>
            <FileCodeIcon className="w-4 h-4 mr-2 inline-block" style={{ color: C.inkFaint }} />
            Raw Notes
          </InputGroupText>
          <InputGroupButton
            className="ml-auto transition-opacity hover:opacity-70"
            type="button"
            size="icon-xs"
            onClick={() => setText("")}
            aria-label="Clear notes"
            style={{ color: C.inkMid }}
          >
            <RefreshCwIcon className="w-4 h-4" />
          </InputGroupButton>
        </InputGroupAddon>

        <InputGroupTextarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 min-h-0 text-[15px] leading-relaxed resize-none font-medium overflow-y-auto"
          placeholder={`What did you work on today?\n\n- Fixed login bug\n- Building dashboard component\n- Blocked on API spec`}
          style={{
            backgroundColor: C.surface,
            color: C.ink,
            caretColor: C.done,
            border: "none",
            outline: "none",
            padding: "24px",
          }}
        />

        <div className="px-5 py-3 flex flex-wrap gap-2 shrink-0" style={{ borderTop: `1px solid ${C.borderSoft}`, backgroundColor: C.surfaceHigh }}>
          {EXAMPLES.map((example, i) => (
            <button
              key={i}
              type="button"
              onClick={() => fillExample(example)}
              className="text-[11px] font-semibold px-3 py-1.5 rounded-full transition-all hover:-translate-y-[1px] focus-visible:ring-2 focus-visible:ring-offset-1"
              style={{
                backgroundColor: C.surface,
                border: `1px solid ${C.borderSoft}`,
                color: C.inkMid,
              }}
            >
              {example.length > 32 ? example.slice(0, 32) + "…" : example}
            </button>
          ))}
        </div>

        <InputGroupAddon
          align="block-end"
          style={{ borderTop: `1px solid ${C.borderSoft}`, backgroundColor: C.surfaceHigh }}
          className="px-5 py-4 flex items-center justify-between shrink-0"
        >
          <InputGroupText className="text-xs font-semibold tracking-wide" style={{ color: C.inkFaint }}>
            {text.length} characters
          </InputGroupText>
          <InputGroupButton
            className="text-xs font-bold tracking-wide flex items-center transition-all hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-offset-2"
            type="submit"
            size="sm"
            disabled={loading || !text.trim()}
            style={{
              backgroundColor: C.done,
              color: C.surface,
              border: "none",
              borderRadius: "9999px",
              padding: "10px 24px",
              opacity: loading || !text.trim() ? 0.5 : 1,
              cursor: loading || !text.trim() ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Generating…" : "Generate"}
            {loading ? <Spinner /> : <CornerDownLeftIcon className="w-3.5 h-3.5 ml-2" />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </form>
  )
}

const SectionBlock = ({
  section,
  items,
  animKey,
  isLast,
}: {
  section: (typeof SECTIONS)[number]
  items: string[]
  animKey: number
  isLast: boolean
}) => {
  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: section.color }} />
        <span className="text-[13px] font-bold tracking-widest uppercase" style={{ color: C.ink }}>
          {section.label}
        </span>
      </div>
      <ul className="space-y-4 pl-2">
        {items.map((item, i) => (
          <li key={`${animKey}-${i}`} className="flex gap-4 items-start">
            <span className="mt-[8px] w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: section.color, opacity: 0.7 }} />
            <span className="text-[15px] leading-relaxed font-semibold" style={{ color: C.ink }}>
              <TextGenerateEffect key={`${animKey}-${section.key}-${i}`} words={item} />
            </span>
          </li>
        ))}
      </ul>
      {!isLast && <div className="mt-8 mb-8" style={{ height: "1px", backgroundColor: C.borderSoft }} />}
    </div>
  )
}

const LoadingPane = () => (
  <div className="h-full flex flex-col items-center justify-center gap-6 select-none">
    <svg className="animate-spin" width="40" height="40" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="13" stroke={C.borderSoft} strokeWidth="3.5" />
      <path d="M16 3A13 13 0 0 1 29 16" stroke={C.done} strokeWidth="3.5" strokeLinecap="round" />
    </svg>
    <p className="text-[13px] font-bold tracking-widest uppercase" style={{ color: C.inkMid }}>
      Formatting standup…
    </p>
  </div>
)

const Placeholder = () => (
  <div className="h-full flex flex-col items-center justify-center gap-10 select-none px-6">
    <div className="flex flex-col gap-5 w-full max-w-[260px]">
      {SECTIONS.map((section, i) => (
        <div key={section.key} className="flex items-center gap-4">
          <span
            className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
            style={{ backgroundColor: `${section.color}1A`, color: section.color }}
          >
            {i + 1}
          </span>
          <div className="flex-1 flex flex-col gap-1.5">
            <span className="text-[13px] font-bold tracking-wide" style={{ color: C.ink }}>
              {section.label}
            </span>
            <div className="h-[6px] rounded-full" style={{ backgroundColor: C.borderSoft, width: `${85 - i * 15}%` }} />
          </div>
        </div>
      ))}
    </div>
    <p className="text-[12px] font-semibold tracking-wide text-center max-w-[220px] leading-relaxed" style={{ color: C.inkFaint }}>
      Paste your notes on the left — your standup will be sorted into these three sections.
    </p>
  </div>
)

const CopyButton = ({ standup }: { standup: StandupData }) => {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    const text = SECTIONS
      .filter((s) => standup[s.key]?.length > 0)
      .map((s) => `${s.label}:\n${standup[s.key].map((item) => `- ${item}`).join("\n")}`)
      .join("\n\n")
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center gap-2 text-[12px] font-bold tracking-wide px-4 py-2 rounded-full transition-all hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{
        backgroundColor: copied ? C.done : C.surfaceHigh,
        color: copied ? C.surface : C.inkMid,
        border: `1px solid ${copied ? C.done : C.borderSoft}`,
      }}
    >
      {copied ? <CheckIcon className="w-3.5 h-3.5" /> : <ClipboardIcon className="w-3.5 h-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  )
}

export const StandupUI = () => {
  const [standup, setStandup] = useState<StandupData | null>(null)
  const [loading, setLoading] = useState(false)
  const [key, setKey] = useState(0)
  const rightRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    rightRef.current?.scrollTo({ top: 0, behavior: "smooth" })
  }, [key])

  return (
    <div
      className="h-screen w-full flex overflow-hidden"
      style={{
        backgroundColor: C.canvas,
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}
    >

      <div
        className="hidden lg:flex w-[120px] h-full shrink-0 relative flex-col items-center justify-between py-8"
        style={{ backgroundColor: C.spine }}
      >
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: C.brandSoft }} />

        <h1
          className="text-[52px] font-black tracking-tighter uppercase whitespace-nowrap select-none"
          style={{
            color: "#F2F1E8",
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)'
          }}
        >
          We Build <span style={{ color: C.brandSoft }}>Standups.</span>
        </h1>

        <span
          className="text-[10px] font-bold tracking-widest uppercase select-none"
          style={{ color: "#6B7068", writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          Notes in, standups out.
        </span>
      </div>

      <div className="flex-1 h-full flex flex-col min-h-0">

        <header
          className="shrink-0 flex items-center justify-between px-6 lg:px-10 h-[68px]"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          {/* Brand lockup */}
          <a href="https://standup-flow-two.vercel.app/" className="flex items-center gap-3 group" aria-label="standupFlow">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: C.brandSoft, boxShadow: `0 0 0 3px ${C.brandSoft}59` }}
            />
            <div className="flex flex-col leading-none">
              <span className="text-[30px] font-black tracking-tight transition-opacity group-hover:opacity-70" style={{ color: C.ink }}>
                standupFlow<span style={{ color: C.done }}>.</span>
              </span>
              <span className="text-[8px] font-bold tracking-[0.18em] uppercase mt-[2px]" style={{ color: C.inkFaint }}>
                Standup formatter
              </span>
            </div>
          </a>

          {/* Metadata field strip */}
          <div className="hidden sm:flex items-stretch gap-5 lg:gap-7">
            <div className="flex flex-col gap-1 justify-center">
              <span className="text-[9px] font-bold tracking-[0.18em] uppercase" style={{ color: C.inkFaint }}>
                For
              </span>
              <a
                href="https://digitalheroesco.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] font-bold transition-opacity hover:opacity-60"
                style={{ color: C.ink }}
              >
                Digital Heroes
              </a>
            </div>

            <span className="w-px self-stretch my-0.5" style={{ backgroundColor: C.borderSoft }} />

            <div className="hidden md:flex flex-col gap-1 justify-center">
              <span className="text-[9px] font-bold tracking-[0.18em] uppercase" style={{ color: C.inkFaint }}>
                Contact
              </span>
              <span className="text-[13px] font-semibold select-text" style={{ color: C.inkMid }}>
                aryan8kaushik@gmail.com
              </span>
            </div>

            <span className="hidden md:block w-px self-stretch my-0.5" style={{ backgroundColor: C.borderSoft }} />

            <div className="flex flex-col gap-1 justify-center">
              <span className="text-[9px] font-bold tracking-[0.18em] uppercase" style={{ color: C.inkFaint }}>
                Tool by
              </span>
              <span className="text-[13px] font-bold" style={{ color: C.ink }}>
                Aryan Kaushik
              </span>
            </div>
          </div>
        </header>

        <div className="flex-1 min-h-0 px-6 lg:px-10 py-8">
          <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">

            <div className="h-full min-h-0">
              <TextArea setStandup={setStandup} setKey={setKey} loading={loading} setLoading={setLoading} />
            </div>

            <div className="h-full min-h-0 flex flex-col gap-3">
              {standup && !loading && (
                <div className="flex items-center justify-between px-1 shrink-0">
                  <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: C.inkFaint }}>
                    Your standup
                  </span>
                  <CopyButton standup={standup} />
                </div>
              )}
              <div
                ref={rightRef}
                className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
                style={{
                  backgroundColor: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: "16px",
                }}
              >
                {loading ? (
                  <LoadingPane />
                ) : !standup ? (
                  <Placeholder />
                ) : (
                  <div className="space-y-0">
                    {SECTIONS.map((section) => {
                      const items = standup[section.key]
                      if (!items || items.length === 0) return null
                      const visibleSections = SECTIONS.filter((s) => standup[s.key]?.length > 0)
                      const isLast = section.key === visibleSections[visibleSections.length - 1]?.key
                      return (
                        <SectionBlock
                          key={`${key}-${section.key}`}
                          section={section}
                          items={items}
                          animKey={key}
                          isLast={isLast}
                        />
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  )
}