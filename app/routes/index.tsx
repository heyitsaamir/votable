import { createFileRoute, Link } from '@tanstack/react-router'
import { Entity, EntityType } from '../models'
import { getEntitiesFn } from '../server/getEntities'

export const Route = createFileRoute('/')({
  loader: async () => {
    const entities = await getEntitiesFn()
    return { entities }
  },
  component: EntitiesList,
})

function EntitiesList() {
  const { entities } = Route.useLoaderData()

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">All Entities</h1>
          <Link
            to="/entities/create"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Create New Entity
          </Link>
        </div>

        {entities.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No entities found.</p>
            <p className="text-gray-400 mt-2">
              Create your first entity to get started!
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {entities.map((entity: Entity) => (
              <Link
                key={entity.id}
                to="/entities/$entityId"
                params={{ entityId: entity.id }}
                className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`px-3 py-1 text-sm rounded-full ${
                        entity.type === EntityType.PROMPT
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {entity.type}
                    </span>
                  </div>

                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {entity.title}
                  </h2>

                  {entity.description && (
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {entity.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
