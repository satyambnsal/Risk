'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { generateProof, isCircuitLoaded, loadCircuit } from '@/services/noirService'

export default function AgeVerifier() {
  const [age, setAge] = useState('')
  const [logs, setLogs] = useState<string[]>([])
  const [results, setResults] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initializeNoirSystem = async () => {
      try {
        setLogs((prev) => [...prev, 'Initializing Noir libraries...'])

        setIsInitialized(true)
        setLogs((prev) => [...prev, 'Noir libraries initialized successfully'])

        // Load the pre-compiled circuit
        setLogs((prev) => [...prev, 'Loading circuit...'])
        await loadCircuit('/circuits/age_circuit.json')
        setLogs((prev) => [...prev, 'Circuit loaded successfully'])
      } catch (error: any) {
        console.error('Failed to initialize:', error)
        setLogs((prev) => [...prev, `Error: ${error.message || error}`])
      }
    }

    initializeNoirSystem()
  }, [])

  const handleSubmit = async () => {
    if (!age) {
      setLogs((prev) => [...prev, 'Please enter an age'])
      return
    }

    if (!isInitialized) {
      setLogs((prev) => [...prev, 'Noir system is not initialized yet. Please wait.'])
      return
    }

    setIsLoading(true)
    setLogs((prev) => [...prev, 'Starting proof generation...'])
    setResults([])

    try {
      const ageValue = parseInt(age, 10)
      console.log('age value page.tsx 55', ageValue)
      if (isNaN(ageValue)) {
        throw new Error('Age must be a valid number')
      }

      setLogs((prev) => [...prev, `Generating proof for age: ${ageValue}...`])

      // Generate the proof using our mock implementation
      setLogs((prev) => [...prev, 'Generating witness...'])
      const { proof, isValid } = await generateProof(ageValue)

      setLogs((prev) => [...prev, 'Generated witness...'])
      setLogs((prev) => [...prev, 'Generated proof...✅'])

      // Show the proof
      setResults((prev) => [...prev, JSON.stringify(proof, null, 2)])

      setLogs((prev) => [...prev, 'Verifying proof...'])
      setLogs((prev) => [...prev, `Proof is ${isValid ? 'Valid ✅' : 'Invalid ❌'}...`])

      // Add explanation for demo
      if (ageValue < 18) {
        setLogs((prev) => [...prev, 'Note: In this demo, proofs are valid for ages 18 and above'])
      }
    } catch (error: any) {
      console.error('Error generating proof:', error)
      setLogs((prev) => [...prev, `Error: ${error.message || error}`])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 container mx-auto py-20">
      <div className="space-y-2">
        <label
          htmlFor="age"
          className="block text-sm font-medium text-gray-200"
        >
          Enter your age:
        </label>
        <input
          id="age"
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="block w-full rounded-md border-gray-600 bg-gray-700 text-white px-3 py-2"
          placeholder="e.g. 25"
          disabled={isLoading}
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isLoading || !isInitialized}
        className="w-full"
      >
        {isLoading ? 'Generating Proof...' : 'Generate Proof'}
      </Button>

      {logs.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Logs</h3>
          <div className="bg-black p-4 rounded-md overflow-auto max-h-60">
            {logs.map((log, i) => (
              <div
                key={i}
                className="text-green-400 font-mono text-sm"
              >
                &gt; {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Results</h3>
          <div className="bg-black p-4 rounded-md overflow-auto max-h-60">
            {results.map((result, i) => (
              <div
                key={i}
                className="text-yellow-400 font-mono text-sm break-all"
              >
                {result}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
