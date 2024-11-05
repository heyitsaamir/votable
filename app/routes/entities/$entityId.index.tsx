import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/start";
import { useEffect, useState } from "react";
import { UserRegistrationModal } from "../../client/components/UserRegistrationModal";
import { Votable } from "../../client/components/Votable";
import { useUser } from "../../client/hooks/useUser";
import { getEntityFn } from "../../server/getEntity";
import { getVotesFn } from "../../server/getVotes";

export const Route = createFileRoute("/entities/$entityId/")({
  loader: async ({ params }) => {
    const { entityId } = params;
    console.log("calling entityid");
    const entity = await getEntityFn({ entityId });

    if (!entity) {
      throw new Error("Entity not found");
    }

    return {
      entity,
    };
  },
  component: EntityDetails,
});

function EntityDetails() {
  const { entity: initialEntity } = Route.useLoaderData();
  const { user, showRegistration, setShowRegistration } = useUser();
  const getVotes = useServerFn(getVotesFn);
  const [entityWithVotes, setEntityWithVotes] = useState(initialEntity);

  // Fetch votes when user is available
  useEffect(() => {
    async function fetchVotes() {
      if (user) {
        const votes = await getVotes({
          entityId: initialEntity.id,
          userId: user.id,
        });
        // Merge votes with entity votables
        setEntityWithVotes({
          ...initialEntity,
          votables: initialEntity.votables.map((votable) => ({
            ...votable,
            userVote: votes.find((v) => v.votableId === votable.id)?.value,
          })),
        });
      }
    }
    fetchVotes();
  }, [user, initialEntity]);

  if (!entityWithVotes) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-500 text-center">Entity not found</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
          </Link>

          <div className="grid grid-cols-6 gap-4">
            <div className="col-span-4">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-6">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {entityWithVotes.title}
                  </h1>
                  <Link
                    to="/entities/$entityId/stats"
                    params={{ entityId: entityWithVotes.id }}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100"
                  >
                    View Stats
                  </Link>
                </div>

                <div className="space-y-4">
                  <div>
                    <h2 className="text-sm font-medium text-gray-500">Type</h2>
                    <p className="mt-1 text-gray-900">{entityWithVotes.type}</p>
                  </div>

                  {entityWithVotes.description && (
                    <div>
                      <h2 className="text-sm font-medium text-gray-500">
                        Description
                      </h2>
                      <p className="mt-1 text-gray-900">
                        {entityWithVotes.description}
                      </p>
                    </div>
                  )}

                  <div>
                    <h2 className="text-sm font-medium text-gray-500">
                      Created
                    </h2>
                    <p className="mt-1 text-gray-900">
                      {new Date(entityWithVotes.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <h2 className="text-sm font-medium text-gray-500">
                      Total Votables
                    </h2>
                    <p className="mt-1 text-gray-900">
                      {entityWithVotes.votables.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Votables
                </h2>

                {entityWithVotes.votables?.length > 0 ? (
                  <div className="space-y-6">
                    {entityWithVotes.votables.map((votable) => (
                      <div
                        key={votable.id}
                        className="border-b border-gray-200 last:border-0 pb-6 last:pb-0"
                      >
                        <Votable votable={votable} userId={user?.id ?? ""} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    No votables found for this entity.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <UserRegistrationModal
        isOpen={showRegistration}
        onClose={() => setShowRegistration(false)}
      />
    </>
  );
}
