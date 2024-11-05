import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { createFileRoute, Link } from '@tanstack/react-router'
import { VotableType } from '../../models'
import { getEntityFn } from '../../server/getEntity'
import { getStatsFn } from '../../server/getStats'

export const Route = createFileRoute('/entities/$entityId/stats')({
  loader: async ({ params }) => {
    const { entityId } = params
    console.log('entityId', entityId)
    const [entity, stats] = await Promise.all([
      getEntityFn({ entityId }),
      getStatsFn({ entityId }),
    ])

    if (!entity) {
      throw new Error('Entity not found')
    }

    return {
      entity,
      stats,
    }
  },
  component: EntityStats,
})

function EntityStats() {
  const { entity, stats } = Route.useLoaderData()

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center gap-4 mb-6">
          <Link
            to="/entities/$entityId"
            params={{ entityId: entity.id }}
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Stats for {entity.title}
          </h1>
        </div>

        <div className="space-y-6">
          {entity.votables.map((votable) => {
            const votableStats = stats.votableStats.find(
              (s) => s.votableId === votable.id
            )

            if (!votableStats) return null

            return (
              <div key={votable.id} className="border-t border-gray-200 pt-4">
                <h3 className="text-xl font-semibold mb-2">{votable.label}</h3>
                <p className="text-gray-600 mb-2">
                  Total votes: {votableStats.totalVotes}
                </p>

                {votable.type === VotableType.BOOL ? (
                  <div className="space-y-2">
                    <h4 className="font-medium">Distribution:</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-500">Yes</div>
                        <div className="text-lg font-medium">
                          {votableStats.distribution?.['true'] || 0} votes
                          {votableStats.totalVotes > 0 && (
                            <span className="text-sm text-gray-500 ml-1">
                              ({((votableStats.distribution?.['true'] || 0) / votableStats.totalVotes * 100).toFixed(1)}%)
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-500">No</div>
                        <div className="text-lg font-medium">
                          {votableStats.distribution?.['false'] || 0} votes
                          {votableStats.totalVotes > 0 && (
                            <span className="text-sm text-gray-500 ml-1">
                              ({((votableStats.distribution?.['false'] || 0) / votableStats.totalVotes * 100).toFixed(1)}%)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : votable.type === VotableType.ENUM ? (
                  <div className="space-y-2">
                    <h4 className="font-medium">Distribution:</h4>
                    {Object.entries(votableStats.distribution || {}).map(
                      ([value, count]) => (
                        <div
                          key={value}
                          className="flex justify-between items-center"
                        >
                          <span>{value}:</span>
                          <span>{count} votes</span>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium">Average:</span>{' '}
                        {votableStats.average?.toFixed(2)}
                      </div>
                      <div>
                        <span className="font-medium">Median:</span>{' '}
                        {votableStats.median?.toFixed(2)}
                      </div>
                      <div>
                        <span className="font-medium">Min:</span>{' '}
                        {votableStats.min?.toFixed(2)}
                      </div>
                      <div>
                        <span className="font-medium">Max:</span>{' '}
                        {votableStats.max?.toFixed(2)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <p className="text-sm text-gray-500 mt-4">
          Last updated: {new Date(stats.updatedAt).toLocaleString()}
        </p>
      </div>
    </div>
  )
}