import { useCallback, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mic, Square, UploadCloud } from 'lucide-react'
import { toast } from 'sonner'
import { getToken } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const API_ORIGIN = 'http://localhost:5000'

type SpeechFieldApi = {
  isListening: boolean
  interim: string
  start: () => void
  stop: () => void
}

function useSpeechField(onAppendFinal: (text: string) => void): SpeechFieldApi {
  const [isListening, setIsListening] = useState(false)
  const [interim, setInterim] = useState('')
  const recognitionRef = useRef<InstanceType<NonNullable<typeof window.SpeechRecognition>> | null>(null)

  const stop = useCallback(() => {
    try {
      recognitionRef.current?.stop()
    } catch {
      /* ignore */
    }
    recognitionRef.current = null
    setIsListening(false)
    setInterim('')
  }, [])

  const start = useCallback(() => {
    const SpeechCtor = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechCtor) {
      toast.error('Speech recognition is not supported in this browser.')
      return
    }

    try {
      recognitionRef.current?.stop()
    } catch {
      /* ignore */
    }
    recognitionRef.current = null

    const recognition = new SpeechCtor()
    recognition.lang = 'en-US'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimBuf = ''
      let finalBuf = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const piece = event.results[i][0]?.transcript ?? ''
        if (event.results[i].isFinal) finalBuf += piece
        else interimBuf += piece
      }
      if (finalBuf.trim()) {
        const chunk = `${finalBuf.trim()} `
        onAppendFinal(chunk)
      }
      setInterim(interimBuf)
    }

    recognition.onerror = (ev: SpeechRecognitionErrorEvent) => {
      if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') {
        toast.error('Microphone access denied. Enable the mic in browser settings to dictate.')
      } else if (ev.error === 'no-speech') {
        toast.message('No speech detected — try again or speak closer to the microphone.')
      } else {
        toast.error(`Speech capture paused (${ev.error}). Check your microphone and connection.`)
      }
      setIsListening(false)
      setInterim('')
    }

    recognition.onend = () => {
      if (recognitionRef.current !== recognition) return
      recognitionRef.current = null
      setIsListening(false)
      setInterim('')
    }

    try {
      recognition.start()
      recognitionRef.current = recognition
      setIsListening(true)
    } catch {
      toast.error('Could not start speech recognition. Try again.')
    }
  }, [onAppendFinal])

  return { isListening, interim, start, stop }
}

async function postReportFormData(fd: FormData): Promise<{
  notification: { type: string; message?: string }
  alert?: unknown
}> {
  const headers = new Headers()
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${API_ORIGIN}/api/doctor/reports`, {
    method: 'POST',
    headers,
    body: fd,
  })

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as { error?: string; message?: string }
    throw new Error(errorData.error || errorData.message || `API error: ${response.status}`)
  }

  return response.json() as Promise<{ notification: { type: string; message?: string }; alert?: unknown }>
}

export function SubmitReportPage() {
  const navigate = useNavigate()
  const [medicines, setMedicines] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [files, setFiles] = useState<File[]>([])

  const appendDiagnosis = useCallback((chunk: string) => {
    setDiagnosis((prev) => `${prev}${chunk}`)
  }, [])
  const appendMedicines = useCallback((chunk: string) => {
    setMedicines((prev) => `${prev}${chunk}`)
  }, [])

  const diagnosisSpeech = useSpeechField(appendDiagnosis)
  const medicineSpeech = useSpeechField(appendMedicines)

  const isFormValid = useMemo(() => {
    return medicines.trim().length > 0 && diagnosis.trim().length > 0
  }, [medicines, diagnosis])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const fd = new FormData()
    fd.append('diagnosis', diagnosis)
    fd.append('medicines', medicines)
    files.forEach((file) => fd.append('files', file))

    try {
      const res = await postReportFormData(fd)
      const msg = res.notification.message ?? 'Report routed to AI verification.'
      if (res.notification.type === 'warning') toast.warning(msg)
      else toast.success(msg)
      setMedicines('')
      setDiagnosis('')
      setFiles([])
      navigate('/ai-alerts', { replace: true })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Submission failed')
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const list = Array.from(e.dataTransfer.files ?? [])
    setFiles((prev) => [...prev, ...list])
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-ms-accent/35 bg-white/85">
          <CardHeader>
            <CardTitle>Clinical disclosure composer</CardTitle>
            <CardDescription>
              MediShield AI reconciles your doctor notes, prescribed medicines, and uploaded labs or imaging to surface
              possible diagnostic or prescribing inconsistencies before anonymized publication.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={(e) => void handleSubmit(e)}>
              <div className="space-y-3">
                <Label htmlFor="diagnosis-notes" className="text-base font-semibold text-ms-ink">
                  Doctor Diagnosis &amp; Notes
                </Label>
                <Textarea
                  id="diagnosis-notes"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  required
                  rows={8}
                  placeholder="Enter diagnosis details, observations, reasoning, suspected condition, prescribed treatment, and important medical notes..."
                  className={cn(
                    'min-h-[200px] resize-y text-base leading-relaxed',
                    'border-ms-accent/50 bg-gradient-to-b from-emerald-50/40 to-white/90 shadow-md shadow-ms-accent/10',
                    'ring-1 ring-ms-accent/25 focus-visible:ring-2 focus-visible:ring-[#2f7d56]/45'
                  )}
                />
                {diagnosis.trim().length === 0 && (
                  <p className="text-xs text-red-500">Doctor diagnosis &amp; notes are required</p>
                )}

                <div className="rounded-xl border border-ms-accent/45 bg-ms-panel/55 px-4 py-3 shadow-sm">
                  <p className="text-xs font-semibold tracking-wide text-ms-muted">🎙 Voice-to-Text Controls</p>
                  <p className="mt-1 text-sm font-medium text-ms-ink">Dictate Diagnosis Notes</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      aria-label="Start diagnosis dictation"
                      onClick={() => diagnosisSpeech.start()}
                      disabled={diagnosisSpeech.isListening}
                      className={cn(
                        'inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-ms-accent/50 bg-white text-[#2f7d56] shadow-sm transition-all',
                        diagnosisSpeech.isListening &&
                          'animate-pulse border-[#2f7d56]/60 shadow-[0_0_18px_rgba(47,125,86,0.45)] ring-2 ring-[#2f7d56]/35'
                      )}
                    >
                      <Mic className="size-4" />
                    </button>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => diagnosisSpeech.start()}
                        disabled={diagnosisSpeech.isListening}
                      >
                        Start Recording
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => diagnosisSpeech.stop()}
                        disabled={!diagnosisSpeech.isListening}
                      >
                        <Square className="mr-1.5 size-3.5 fill-current" />
                        Stop Recording
                      </Button>
                    </div>
                    {diagnosisSpeech.isListening && (
                      <span className="inline-flex items-center gap-2 text-xs font-medium text-[#2f7d56]">
                        <span className="relative flex size-2">
                          <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#2f7d56]/50 opacity-75" />
                          <span className="relative inline-flex size-2 rounded-full bg-[#2f7d56]" />
                        </span>
                        Listening…
                        {diagnosisSpeech.interim ? (
                          <span className="max-w-[min(100%,220px)] truncate text-ms-muted">“{diagnosisSpeech.interim}”</span>
                        ) : null}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="medicines-given">Medicine Given</Label>
                <Textarea
                  id="medicines-given"
                  value={medicines}
                  onChange={(e) => setMedicines(e.target.value)}
                  required
                  rows={4}
                  placeholder="List medications, doses, routes, and PRN instructions…"
                  className="min-h-[120px]"
                />
                {medicines.trim().length === 0 && (
                  <p className="text-xs text-red-500">Medicines given are required</p>
                )}

                <div className="rounded-xl border border-ms-accent/45 bg-ms-panel/55 px-4 py-3 shadow-sm">
                  <p className="text-xs font-semibold tracking-wide text-ms-muted">🎙 Voice-to-Text Controls</p>
                  <p className="mt-1 text-sm font-medium text-ms-ink">Dictate Medicines</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      aria-label="Start medicines dictation"
                      onClick={() => medicineSpeech.start()}
                      disabled={medicineSpeech.isListening}
                      className={cn(
                        'inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-ms-accent/50 bg-white text-[#2f7d56] shadow-sm transition-all',
                        medicineSpeech.isListening &&
                          'animate-pulse border-[#2f7d56]/60 shadow-[0_0_18px_rgba(47,125,86,0.45)] ring-2 ring-[#2f7d56]/35'
                      )}
                    >
                      <Mic className="size-4" />
                    </button>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => medicineSpeech.start()}
                        disabled={medicineSpeech.isListening}
                      >
                        Start Recording
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => medicineSpeech.stop()}
                        disabled={!medicineSpeech.isListening}
                      >
                        <Square className="mr-1.5 size-3.5 fill-current" />
                        Stop Recording
                      </Button>
                    </div>
                    {medicineSpeech.isListening && (
                      <span className="inline-flex items-center gap-2 text-xs font-medium text-[#2f7d56]">
                        <span className="relative flex size-2">
                          <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#2f7d56]/50 opacity-75" />
                          <span className="relative inline-flex size-2 rounded-full bg-[#2f7d56]" />
                        </span>
                        Listening…
                        {medicineSpeech.interim ? (
                          <span className="max-w-[min(100%,220px)] truncate text-ms-muted">“{medicineSpeech.interim}”</span>
                        ) : null}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div
                className="rounded-2xl border border-dashed border-ms-accent/60 bg-ms-panel/40 px-6 py-10 text-center"
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
              >
                <UploadCloud className="mx-auto size-10 text-[#2f7d56]" />
                <p className="mt-4 text-sm font-semibold text-ms-ink">Drag labs or narrative reports (PDF / TXT)</p>
                <p className="text-xs text-ms-muted">Accepted · PDF · TXT · ≤15MB each</p>
                <input
                  type="file"
                  multiple
                  className="mt-4"
                  accept=".pdf,.txt"
                  onChange={(e) => setFiles((prev) => [...prev, ...Array.from(e.target.files ?? [])])}
                  aria-label="Upload PDF or plain-text medical reports"
                />
                {files.length > 0 && (
                  <ul className="mt-4 space-y-1 text-left text-xs text-ms-muted">
                    {files.map((file) => (
                      <li key={`${file.name}-${file.size}-${file.lastModified}`}>{file.name}</li>
                    ))}
                  </ul>
                )}
              </div>

              <Button type="submit" disabled={!isFormValid} className="w-full md:w-auto">
                Submit to AI verification desk
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
