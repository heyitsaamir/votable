import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/start'
import { useState } from 'react'
import { UserRegistrationModal } from '../../client/components/UserRegistrationModal'
import { useUser } from '../../client/hooks/useUser'
import { EnumConfig, NumberConfig, SliderConfig, VotableConfig, VotableType } from '../../models'
import { createEntityFn } from '../../server/createEntity'
import { createVotableFn } from '../../server/createVotable'

type VotableInput = {
  type: VotableType
  config: VotableConfig
  label: string
}

export const Route = createFileRoute('/entities/create')({
  component: CreateEntityForm,
})

export function CreateEntityForm() {
  const { user, showRegistration, setShowRegistration } = useUser()
  const createEntity = useServerFn(createEntityFn)
  const createVotable = useServerFn(createVotableFn)
  const navigate = useNavigate()
  const [votables, setVotables] = useState<VotableInput[]>([])

  const addVotable = () => {
    setVotables([
      ...votables,
      {
        type: VotableType.NUMBER,
        config: { min: 0, max: 100 },
        label: '',
      },
    ])
  }

  const updateVotable = (index: number, updates: Partial<VotableInput>) => {
    const newVotables = [...votables]
    newVotables[index] = { ...newVotables[index], ...updates }
    setVotables(newVotables)
  }

  const removeVotable = (index: number) => {
    setVotables(votables.filter((_, i) => i !== index))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    
    if (!user) {
      setShowRegistration(true)
      return
    }

    try {
      // Create entity with existing user
      const entity = await createEntity({
        entityDetails: {
          type: formData.get('type') as string,
          title: formData.get('title') as string,
          description: formData.get('description') as string,
          userId: user.id
        },
        votables: votables
      })
      
      navigate({ to: '/entities/$entityId', params: { entityId: entity.id } })
    } catch (error) {
      console.error('Failed to create entity:', error)
    }
  }

  const renderVotableConfig = (votable: VotableInput, index: number) => {
    switch (votable.type) {
      case VotableType.NUMBER:
        return (
          <div className="flex gap-4">
            <input
              type="number"
              placeholder="Min"
              value={(votable.config as NumberConfig).min}
              onChange={(e) =>
                updateVotable(index, {
                  config: {
                    ...(votable.config as NumberConfig),
                    min: Number(e.target.value),
                  },
                })
              }
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md"
            />
            <input
              type="number"
              placeholder="Max"
              value={(votable.config as NumberConfig).max}
              onChange={(e) =>
                updateVotable(index, {
                  config: {
                    ...(votable.config as NumberConfig),
                    max: Number(e.target.value),
                  },
                })
              }
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>
        )

      case VotableType.SLIDER:
        return (
          <div className="flex gap-4">
            <input
              type="number"
              placeholder="Min"
              value={(votable.config as SliderConfig).min}
              onChange={(e) =>
                updateVotable(index, {
                  config: {
                    ...(votable.config as SliderConfig),
                    min: Number(e.target.value),
                  },
                })
              }
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md"
            />
            <input
              type="number"
              placeholder="Max"
              value={(votable.config as SliderConfig).max}
              onChange={(e) =>
                updateVotable(index, {
                  config: {
                    ...(votable.config as SliderConfig),
                    max: Number(e.target.value),
                  },
                })
              }
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md"
            />
            <input
              type="number"
              placeholder="Step"
              value={(votable.config as SliderConfig).step}
              onChange={(e) =>
                updateVotable(index, {
                  config: {
                    ...(votable.config as SliderConfig),
                    step: Number(e.target.value),
                  },
                })
              }
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>
        )

      case VotableType.ENUM:
        return (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Options (comma-separated)"
              value={(votable.config as EnumConfig).options.join(',')}
              onChange={(e) =>
                updateVotable(index, {
                  config: {
                    options: e.target.value.split(',').map(s => s.trim()),
                  },
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>
        )

      case VotableType.BOOL:
        return (
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Yes Label (optional)"
              value={(votable.config as BoolConfig).yesLabel || ''}
              onChange={(e) =>
                updateVotable(index, {
                  config: {
                    ...(votable.config as BoolConfig),
                    yesLabel: e.target.value,
                  },
                })
              }
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md"
            />
            <input
              type="text"
              placeholder="No Label (optional)"
              value={(votable.config as BoolConfig).noLabel || ''}
              onChange={(e) =>
                updateVotable(index, {
                  config: {
                    ...(votable.config as BoolConfig),
                    noLabel: e.target.value,
                  },
                })
              }
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>
        )
    }
  }

  const handleTypeChange = (index: number, type: VotableType) => {
    const defaultConfigs = {
      [VotableType.NUMBER]: { min: 0, max: 100 },
      [VotableType.SLIDER]: { min: 0, max: 100, step: 1 },
      [VotableType.ENUM]: { options: [] },
      [VotableType.BOOL]: { yesLabel: 'Yes', noLabel: 'No' }
    }

    updateVotable(index, {
      type,
      config: defaultConfigs[type],
    })
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8 bg-white p-8 rounded-lg shadow-md">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Entity Information</h2>
            <select
              name="type"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="prompt">Prompt</option>
              <option value="text">Text</option>
            </select>

            <input
              name="title"
              type="text"
              placeholder="Title"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />

            <textarea
              name="description"
              placeholder="Description (optional)"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Votables</h2>
            {votables.map((votable, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-lg space-y-3"
              >
                <div className="flex flex-wrap gap-4">
                  <select
                    value={votable.type}
                    onChange={(e) => handleTypeChange(index, e.target.value as VotableType)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md"
                  >
                    <option value={VotableType.NUMBER}>Number</option>
                    <option value={VotableType.SLIDER}>Slider</option>
                    <option value={VotableType.ENUM}>Enum</option>
                    <option value={VotableType.BOOL}>Yes/No</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Label"
                    value={votable.label}
                    onChange={(e) =>
                      updateVotable(index, { label: e.target.value })
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {renderVotableConfig(votable, index)}
              </div>
            ))}

            <button
              type="button"
              onClick={addVotable}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Add Votable
            </button>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Create Entity with Votables
          </button>
        </form>
      </div>

      <UserRegistrationModal 
        isOpen={showRegistration}
        onClose={() => setShowRegistration(false)}
      />
    </>
  )
}
