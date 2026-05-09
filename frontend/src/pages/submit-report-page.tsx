import { useCallback, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Mic, StopCircle, UploadCloud } from 'lucide-react'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { SelectField } from '@/components/ui/select-field'
import { Textarea } from '@/components/ui/textarea'

type DictationTarget = 'symptoms' | 'medicines' | 'diagnosis'

export function SubmitReportPage() {
  const [mode, setMode] = useState<'manual' | 'speech'>('manual')
  const [patientCondition, setPatientCondition] = useState('unknown')
  const [symptoms, setSymptoms] = useState('')
  const [medicines, setMedicines] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [dictating, setDictating] = useState<DictationTarget | null>(null)
  const recognitionRef = useRef<{ stop: () => void } | null>(null)

  const conditionOptions = useMemo(
    () => [
      { value: 'stable', label: 'Stable' },
      { value: 'monitoring', label: 'Monitoring' },
      { value: 'critical', label: 'Critical' },
      { value: 'discharged', label: 'Discharged' },
      { value: 'unknown', label: 'Unknown / unspecified' },
    ],
    []
  )

  const isFormValid = useMemo(() => {
    return symptoms.trim().length > 0 && medicines.trim().length > 0 && diagnosis.trim().length > 0
  }, [symptoms, medicines, diagnosis])

  const appendTranscript = useCallback((target: DictationTarget, text: string) => {
    const cleaned = `${text.trim()} `
    if (target === 'symptoms') setSymptoms((prev) => `${prev}${cleaned}`)
    if (target === 'medicines') setMedicines((prev) => `${prev}${cleaned}`)
    if (target === 'diagnosis') setDiagnosis((prev) => `${prev}${cleaned}`)
  }, [])

  function startDictation(target: DictationTarget) {
    const SpeechCtor = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechCtor) {
      toast.error('Speech recognition not supported in this browser.')
      return
    }
    recognitionRef.current?.stop()

    const recognition = new SpeechCtor()
    recognition.lang = 'en-US'
    recognition.continuous = true
    recognition.interimResults = true
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      appendTranscript(target, transcript)
    }
    recognition.onerror = () => toast.error('Speech capture paused — verify microphone permissions.')
    recognition.onend = () => setDictating(null)
    recognition.start()
    recognitionRef.current = recognition
    setDictating(target)
    toast.message(`Listening for ${target.replace('_', ' ')}`)
  }

  function stopDictation() {
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setDictating(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const fd = new FormData()
    fd.append('symptoms', symptoms)
    fd.append('medicines', medicines)
    fd.append('diagnosis', diagnosis)
    fd.append('patientCondition', patientCondition)
    files.forEach((file) => fd.append('files', file))

    try {
      const res = await apiFetch<{ notification: { type: string; message?: string }; alert?: unknown }>(
        '/api/doctor/reports',
        {
          method: 'POST',
          body: fd,
        }
      )
      toast.success(res.notification.message ?? 'Report routed to AI verification.')
      setSymptoms('')
      setMedicines('')
      setDiagnosis('')
      setFiles([])
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
      <div className="flex flex-wrap gap-3">
        <Badge variant={mode === 'manual' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setMode('manual')}>
          Manual capture
        </Badge>
        <Badge variant={mode === 'speech' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setMode('speech')}>
          Speech-assisted capture
        </Badge>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-ms-accent/35 bg-white/85">
          <CardHeader>
            <CardTitle>Clinical disclosure composer</CardTitle>
            <CardDescription>
              Narratives route through the MediShield AI reconciliation mesh before anonymized publication.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={(e) => void handleSubmit(e)}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label>Patient symptoms</Label>
                  <Textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} required />
                  {symptoms.trim().length === 0 && <p className="text-xs text-red-500">Patient symptoms are required</p>}
                  {mode === 'speech' && (
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => startDictation('symptoms')}>
                        <Mic className="size-4" />
                        Dictate
                      </Button>
                      {dictating === 'symptoms' && (
                        <Button type="button" variant="ghost" size="sm" onClick={stopDictation}>
                          <StopCircle className="size-4" />
                          Stop
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Medicines given</Label>
                  <Textarea value={medicines} onChange={(e) => setMedicines(e.target.value)} required />
                  {medicines.trim().length === 0 && <p className="text-xs text-red-500">Medicines given are required</p>}
                  {mode === 'speech' && (
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => startDictation('medicines')}>
                        <Mic className="size-4" />
                        Dictate
                      </Button>
                      {dictating === 'medicines' && (
                        <Button type="button" variant="ghost" size="sm" onClick={stopDictation}>
                          <StopCircle className="size-4" />
                          Stop
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Diagnosis notes</Label>
                  <Textarea value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} required />
                  {diagnosis.trim().length === 0 && <p className="text-xs text-red-500">Diagnosis notes are required</p>}
                  {mode === 'speech' && (
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => startDictation('diagnosis')}>
                        <Mic className="size-4" />
                        Dictate
                      </Button>
                      {dictating === 'diagnosis' && (
                        <Button type="button" variant="ghost" size="sm" onClick={stopDictation}>
                          <StopCircle className="size-4" />
                          Stop
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Patient condition</Label>
                  <SelectField value={patientCondition} onChange={setPatientCondition} options={conditionOptions} />
                </div>
              </div>

              <div
                className="rounded-2xl border border-dashed border-ms-accent/60 bg-ms-panel/40 px-6 py-10 text-center"
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
              >
                <UploadCloud className="mx-auto size-10 text-[#2f7d56]" />
                <p className="mt-4 text-sm font-semibold text-ms-ink">Drag imaging, labs, PDFs, DOCX packets</p>
                <p className="text-xs text-ms-muted">Accepted · PDF · PNG · JPG · DOCX · ≤15MB each</p>
                <input
                  type="file"
                  multiple
                  className="mt-4"
                  accept=".pdf,.png,.jpg,.jpeg,.docx"
                  onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                  aria-label="Upload imaging, labs, PDFs, or DOCX packets"
                />
                {files.length > 0 && (
                  <ul className="mt-4 space-y-1 text-left text-xs text-ms-muted">
                    {files.map((file) => (
                      <li key={file.name}>{file.name}</li>
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
