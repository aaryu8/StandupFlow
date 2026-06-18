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

const TextArea = ({ setWords, setKey }: { setWords: (w: string) => void, setKey: (fn: (prev: number) => number) => void }) => {
  const [text, setText] = useState("")

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    try {
      const response = await axios.post("/api/generate", {
        body: text,
      })
      setWords(response.data.standup)
      setKey(prev => prev + 1)
      setText("")
    } catch (error) {
      console.log("Request failed", error)
      setText("")
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <InputGroup className="w-full max-w-sm bg-background">
        <InputGroupAddon align="block-start" className="border-b">
          <InputGroupText className="font-medium font-mono">
            <FileCodeIcon />
            Enter your Work here
          </InputGroupText>
          <InputGroupButton
            className="ml-auto"
            type="button"
            size="icon-xs"
            onClick={() => setText("")}
          >
            <RefreshCwIcon />
          </InputGroupButton>
        </InputGroupAddon>
        <InputGroupTextarea
          value={text}
          onChange={handleChange}
          className="min-h-[500px]"
          placeholder="Completed task assigned in morning meeting"
        />
        <InputGroupAddon align="block-end" className="border-t">
          <InputGroupText>char : {text.length}</InputGroupText>
          <InputGroupButton
            className="ml-auto"
            type="submit"
            size="sm"
            variant="default"
          >
            Generate
            <CornerDownLeftIcon />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </form>
  )
}

export const StandupUI = () => {
  const [words, setWords] = useState("Publish your tasks, and we will generate a standup")
  const [key, setKey] = useState(0)
  const rightRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    rightRef.current?.scrollTo({
      top: rightRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [words])

  return (
    <div className="min-h-screen pt-25 pb-10 px-6 bg-background">

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 h-14 flex items-center">
          <span className="font-mono text-sm font-semibold tracking-tight text-foreground drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
            {/* your text here */}
          </span>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl h-[80vh] grid grid-cols-2 gap-6">

        {/* LEFT */}
        <div className="h-full">
          <TextArea setWords={setWords} setKey={setKey} />
        </div>

        {/* RIGHT */}
        <div
          ref={rightRef}
          className="h-full rounded-lg p-4 bg-muted/20 overflow-y-auto overflow-x-hidden break-words"
        >
          <TextGenerateEffect key={key} words={words} />
        </div>

      </div>
    </div>
  )
}