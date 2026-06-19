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
}



interface StandupData {
  done: string[]
  inProgress: string[]
  blockers: string[]
}

// ─ Section config 

const SECTIONS: {
  key: keyof StandupData
  label: string
  color: string
}[] = [
  { key: "done",       label: "Completed",   color: C.done       },
  { key: "inProgress", label: "In Progress", color: C.inProgress },
  { key: "blockers",   label: "Blockers",    color: C.blockers   },
]

// ─── Spinner ──────────────────────────────────────────────────────────────────

const Spinner = () => (
  <svg
    className="animate-spin"
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    style={{ marginLeft: "6px", flexShrink: 0 }}
  >
    <circle cx="7" cy="7" r="5.5" stroke={C.surface} strokeOpacity="0.3" strokeWidth="2" />
    <path d="M7 1.5A5.5 5.5 0 0 1 12.5 7" stroke={C.surface} strokeWidth="2" strokeLinecap="round" />
  </svg>
)

// ─── TextArea ─────────────────────────────────────────────────────────────────

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

  return (

    <form onSubmit={handleSubmit} className="h-full flex flex-col min-h-0">
      <InputGroup
        className="w-full h-full flex flex-col min-h-0 shadow-sm hover:shadow-md transition-shadow duration-300"
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
          <InputGroupText
            className="text-[11px] font-bold tracking-widest uppercase"
            style={{ color: C.inkMid }}
          >
            <FileCodeIcon className="w-4 h-4 mr-2 inline-block" style={{ color: C.inkFaint }} />
            Raw Notes
          </InputGroupText>
          <InputGroupButton
            className="ml-auto transition-opacity hover:opacity-70"
            type="button"
            size="icon-xs"
            onClick={() => setText("")}
            style={{ color: C.inkMid }}
          >
            <RefreshCwIcon className="w-4 h-4" />
          </InputGroupButton>
        </InputGroupAddon>

        <InputGroupTextarea
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

        <InputGroupAddon
          align="block-end"
          style={{ borderTop: `1px solid ${C.borderSoft}`, backgroundColor: C.surfaceHigh }}
          className="px-5 py-4 flex items-center justify-between shrink-0"
        >
          <InputGroupText className="text-xs font-semibold tracking-wide" style={{ color: C.inkFaint }}>
            {text.length} characters
          </InputGroupText>
          <InputGroupButton
            className="text-xs font-bold tracking-wide flex items-center transition-all hover:scale-105 active:scale-95"
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

// ─── Section block ────────────────────────────────────────────────────────────

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

// ─── Loading & Placeholder ───────────────────────────────────────────────────

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
  <div className="h-full flex flex-col items-center justify-center gap-2 select-none">
    <p className="text-[13px] font-bold tracking-widest uppercase" style={{ color: C.inkFaint }}>
      Your standup will appear here
    </p>
  </div>
)

// ─── StandupUI ────────────────────────────────────────────────────────────────

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
      className="h-screen w-full flex overflow-hidden relative"
      style={{ 
        backgroundColor: C.canvas,
       
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}
    >
      
      {/* FLOATING CAPSULE NAVBAR */}
      <nav className="absolute top-6 w-full flex justify-center z-50 pointer-events-none">
        <div 
          className="pointer-events-auto flex items-center p-1.5 rounded-full shadow-sm backdrop-blur-md"
          style={{
            backgroundColor: `${C.surfaceHigh}E6`, 
            border: `1px solid ${C.border}`,
          }}
        >
          <div 
            className="px-6 py-2 rounded-full flex items-center gap-2 select-none"
            style={{ backgroundColor: C.brandSoft }}
          >
            <span className="text-[30px] font-black tracking-tight" style={{ color: C.ink }}>
              standupFlow.
            </span>
          </div>

          <div className="px-6 flex items-center gap-6 text-[13px] font-bold tracking-wide" style={{ color: C.inkMid }}>
            <div className="px-6 flex items-center gap-6 text-[13px] font-bold tracking-wide" style={{ color: C.inkMid }}>
            <a 
              href="https://digitalheroesco.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden sm:inline hover:opacity-70 transition-opacity"
              style={{ color: C.ink }}
            >
              For digitalheroesco.com
            </a>
            <span className="text-[18px] opacity-30 select-none hidden sm:inline">|</span>
            <span className="select-none">Internal Utility TOOL By <span className="text-black text-[17px]"><b>Aryan</b></span></span>
          </div>
          </div>

          <div className="pr-1 pl-2">
            <div
              className="px-5 py-2 rounded-full text-[13px] font-bold flex items-center gap-2 select-text"
              style={{
                backgroundColor: C.surface,
                border: `1px solid ${C.borderSoft}`,
                color: C.ink,
              }}
            >
              aryan8kaushik@gmail.com
            </div>
          </div>
          
        </div>
      </nav>

      {/* AGENCY SPINE (Left Vertical Text Area) */}
      <div 
        className="hidden lg:flex w-[140px] border-r h-full shrink-0 relative items-center justify-center select-none"
        style={{ borderColor: C.borderSoft }}
      >
        <h1 
          className="text-[69px] font-black tracking-tighter uppercase whitespace-nowrap" 
          style={{ 
            color: C.ink,
            // Proper vertical text CSS instead of rotation hacks
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)'
          }}
        >
          We Build <span style={{ color: C.done }}>Standups.</span>
        </h1>
      </div>

      {/* MAIN 2-COLUMN APP AREA */}
      <div className="flex-1 px-6 lg:px-12 pt-[120px] pb-10 h-full flex flex-col min-h-0">
        
        {/* Equal height grid for both input and output */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-0">
          
          {/* LEFT — Input Form */}
          <div className="h-full min-h-0">
            <TextArea setStandup={setStandup} setKey={setKey} loading={loading} setLoading={setLoading} />
          </div>

          {/* RIGHT — Output Viewer */}
          <div
            ref={rightRef}
            className="h-full overflow-y-auto overflow-x-hidden p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
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
  )
}