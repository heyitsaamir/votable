import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline'
import { useServerFn } from '@tanstack/start'
import { useEffect, useRef, useState } from 'react'
import { BoolConfig, EnumConfig, NumberConfig, SliderConfig, Votable as VotableModel, VotableType } from '../../models'
import { createVoteFn } from '../../server/createVote'

interface VotableProps {
  votable: VotableModel & { userVote?: string | number | null }
  userId: string
}

export function Votable({ votable, userId }: VotableProps) {
  const createVote = useServerFn(createVoteFn)
  const [vote, setVote] = useState(votable.userVote || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const config = votable.config
  const submitTimeoutRef = useRef<NodeJS.Timeout>()
  const successTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (votable.userVote !== undefined && votable.userVote !== null) {
      setVote(votable.userVote)
    }
  }, [votable.userVote])

  const handleVoteSubmit = async (value: string | number) => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      await createVote({
        votableId: votable.id,
        userId,
        value
      })
      setShowSuccess(true)
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current)
      }
      successTimeoutRef.current = setTimeout(() => {
        setShowSuccess(false)
      }, 2000)
    } catch (err) {
      setError('Failed to submit vote. Please try again.')
      console.error('Error submitting vote:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVoteChange = (newValue: string | number) => {
    setVote(newValue)
    
    // Only set timeout for NUMBER type votables
    if (votable.type === VotableType.NUMBER || votable.type === VotableType.SLIDER) {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current)
      }
      submitTimeoutRef.current = setTimeout(() => {
        handleVoteSubmit(newValue)
      }, 1000)
    } else {
      // For all other types, submit immediately
      handleVoteSubmit(newValue)
    }
  }

  // Cleanup both timeouts on unmount
  useEffect(() => {
    return () => {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current)
      }
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current)
      }
    }
  }, [])

  const renderInput = () => {
    switch (votable.type) {
      case VotableType.SLIDER: {
        const { min, max, step } = config as SliderConfig
        return (
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={vote}
              onChange={(e) => handleVoteChange(e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm text-gray-600">{vote}</span>
          </div>
        )
      }
      
      case VotableType.NUMBER: {
        const { min, max } = config as NumberConfig
        return (
          <input
            type="number"
            min={min}
            max={max}
            value={vote}
            onChange={(e) => setVote(e.target.value)} // Only update state, don't submit
            onBlur={() => handleVoteSubmit(vote)} // Submit on blur
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )
      }
      
      case VotableType.ENUM: {
        const { options } = config as EnumConfig
        return (
          <select
            value={vote}
            onChange={(e) => handleVoteChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select an option</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )
      }
      
      case VotableType.BOOL: {
        const { yesLabel = 'Yes', noLabel = 'No' } = config as BoolConfig
        return (
          <div className="flex gap-4">
            <button
              onClick={() => handleVoteChange('true')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md border 
                ${vote === 'true'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
            >
              {yesLabel}
            </button>
            <button
              onClick={() => handleVoteChange('false')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md border
                ${vote === 'false'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
            >
              {noLabel}
            </button>
          </div>
        )
      }
    }
  }

  return (
    <div className="p-4 mb-4 bg-white rounded-lg shadow">
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            {votable.label}
          </h3>
          {isSubmitting && (
            <span className="text-sm text-gray-500">
              Saving...
            </span>
          )}
          {showSuccess && (
            <span className="text-sm text-green-600 flex items-center">
              <CheckCircleIcon className="w-4 h-4 mr-1" />
              Saved
            </span>
          )}
        </div>
      </div>
      
      <div className="flex flex-col gap-4">
        {renderInput()}
        
        <button
          onClick={() => handleVoteSubmit(vote)}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          disabled={isSubmitting}
        >
          Submit Vote
        </button>
        
        {votable.type === VotableType.NUMBER && (
          <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
            <ClockIcon className="w-3 h-3" />
            Answers will automatically be saved
          </p>
        )}
      </div>

      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  )
}
